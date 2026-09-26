<template>
    <div class="map-page">
    <header class="map-header">
      <div class="map-heading">
        <p class="eyebrow">Sua jornada em Rust</p>
        <h1><span aria-hidden="true">🗺️</span> Mapa da aventura</h1>
        <p class="subtitle">Complete os níveis na sequência para desbloquear os próximos.</p>
      </div>
      <div class="header-stats" role="group" aria-label="Seu progresso">
        <div class="stat"><span aria-hidden="true">⭐</span><strong>{{ progress.totalStars }}</strong><span>estrelas</span></div>
        <div class="stat"><span aria-hidden="true">⚡</span><strong>{{ sessionReady ? (auth.user?.xp ?? progress.xp) : 0 }}</strong><span>XP</span></div>
      </div>
    </header>

    <InlineAlert v-if="sessionReady && !auth.isAuthenticated" class="progress-alert" tone="info">
      <span>Você está jogando como visitante: os 3 primeiros níveis são livres. Crie uma conta grátis para liberar os 30 níveis e salvar progresso.</span>
      <NuxtLink class="btn btn-sm" to="/registro">Criar conta grátis</NuxtLink>
    </InlineAlert>

    <InlineAlert v-if="progressError" class="progress-alert" tone="warning">
      <span>Não foi possível sincronizar seu progresso. Este mapa pode estar desatualizado.</span>
      <button class="btn btn-sm" type="button" @click="loadProgress">Tentar novamente</button>
    </InlineAlert>

    <div v-if="loading" class="map-loading" role="status" aria-live="polite" aria-busy="true">
      <span class="loading-title">Carregando sua aventura…</span>
      <div class="skeleton-row" aria-hidden="true"><span /><span /><span /></div>
      <div class="skeleton-row" aria-hidden="true"><span /><span /><span /></div>
    </div>

    <template v-else>
      <section class="journey-banner panel" aria-labelledby="journey-title">
        <div class="journey-copy">
          <p class="eyebrow">Próximo passo</p>
          <template v-if="recommendedLevel">
            <h2 id="journey-title">{{ recommendedLevel.title }}</h2>
            <p>{{ worldName(recommendedLevel.world) }} <span aria-hidden="true">·</span> {{ conceptFor(recommendedLevel.id) }}</p>
          </template>
          <template v-else>
            <h2 id="journey-title">Você concluiu todos os mundos!</h2>
            <p>Uma aventura e tanto. Volte aos níveis para buscar mais estrelas.</p>
          </template>
          <div class="overall-progress">
            <div class="progress-label"><span>Jornada completa</span><strong>{{ completedCount }} / {{ LEVELS.length }}</strong></div>
            <progress :value="completedCount" :max="LEVELS.length" :aria-label="`${completedCount} de ${LEVELS.length} níveis concluídos`" />
          </div>
        </div>
        <NuxtLink v-if="recommendedLevel" class="btn btn-primary continue-btn" :to="`/nivel/${recommendedLevel.id}`">
          <span aria-hidden="true">▶</span> Continuar aventura
        </NuxtLink>
      </section>

      <section
        v-for="world in worlds"
        :key="world.world"
        class="world"
        :class="{ 'world--current': currentWorld === world.world }"
        :aria-labelledby="`world-${world.world}-title`"
      >
        <header class="world-header">
          <div>
            <p v-if="currentWorld === world.world" class="current-world-label">Mundo atual</p>
            <h2 :id="`world-${world.world}-title`" class="world-title">
              <span class="world-num">Mundo {{ world.world }}</span>
              {{ world.name }}
            </h2>
          </div>
          <div class="world-progress">
            <progress :value="world.completed" :max="world.levels.length" :aria-label="`${world.name}: ${world.completed} de ${world.levels.length} níveis concluídos`" />
            <span>{{ world.completed }}/{{ world.levels.length }}</span>
          </div>
        </header>

        <div class="cards">
          <template v-for="level in world.levels" :key="level.id">
            <NuxtLink
              v-if="progress.isUnlocked(level.id) || !sessionReady || !auth.isAuthenticated"
              class="level-card panel"
              :class="{
                'level-card--completed': progress.isCompleted(level.id),
                'level-card--recommended': recommendedLevel?.id === level.id,
              }"
              :to="`/nivel/${level.id}`"
              :aria-label="`${level.title}, ${progress.isCompleted(level.id) ? `${progress.starsByLevel[level.id]} de 3 estrelas` : recommendedLevel?.id === level.id ? 'próximo nível recomendado' : 'disponível'}`"
            >
              <div class="card-top">
                <span class="order">{{ level.order }}</span>
                <span class="card-stars" aria-hidden="true">
                  <span v-for="n in 3" :key="n" :class="{ on: n <= (progress.starsByLevel[level.id] ?? 0) }">★</span>
                </span>
              </div>
              <div class="card-title">{{ level.title }}</div>
              <div class="card-concept">{{ conceptFor(level.id) }}</div>
              <div class="card-state">
                <template v-if="progress.isCompleted(level.id)"><span aria-hidden="true">✓</span> Concluído</template>
                <template v-else-if="recommendedLevel?.id === level.id"><span aria-hidden="true">▶</span> Próximo recomendado</template>
                <template v-else-if="sessionReady && !auth.isAuthenticated && !isFreeLevel(level.id)"><span aria-hidden="true">🔒</span> Cadastre-se para jogar</template>
                <template v-else>Disponível</template>
              </div>
            </NuxtLink>
            <div v-else class="level-card panel level-card--locked">
              <div class="card-top">
                <span class="order lock" aria-hidden="true">🔒</span>
                <span class="card-stars" aria-hidden="true">★★★</span>
              </div>
              <div class="card-title">{{ level.title }}</div>
              <div class="card-concept">{{ conceptFor(level.id) }}</div>
              <div class="card-state">Bloqueado <span class="sr-only">, conclua os níveis anteriores para desbloquear</span></div>
            </div>
          </template>
        </div>
      </section>
    </template>
    </div>
</template>

<script setup lang="ts">
import { isFreeLevel, LEVELS } from '#shared/levels'
import { WORLD3_CONCEPTS } from '#shared/levels/world3'
import { WORLD4_CONCEPTS } from '#shared/levels/world4'
import { WORLD5_CONCEPTS } from '#shared/levels/world5'
import { WORLD6_CONCEPTS } from '#shared/levels/world6'

const progress = useProgressStore()
const auth = useAuthStore()
const loading = ref(false)
const progressError = ref(false)
/** Evita divergência de hidratação: SSR não sabe a sessão do visitante. */
const sessionReady = ref(false)

const WORLD_NAMES: Record<number, string> = {
  1: 'Vila das Variáveis',
  2: 'Penhasco dos Operadores',
  3: 'Floresta das Decisões',
  4: 'Caverna da Repetição',
  5: 'Oficina das Funções',
  6: 'Ruínas da Posse',
}

const CONCEPTS: Record<string, string> = {
  'w1-l1': 'Comandos e números',
  'w1-l2': 'Variáveis com let',
  'w1-l3': 'let mut e atribuição',
  'w1-l4': 'Funções e parâmetros',
  'w1-l5': 'Revisão: múltiplos saltos',
  'w2-l1': 'Operador +',
  'w2-l2': 'Operador /',
  'w2-l3': 'Operador *',
  'w2-l4': 'Operador - e movimento reverso',
  'w2-l5': 'Expressões combinadas',
  ...WORLD3_CONCEPTS,
  ...WORLD4_CONCEPTS,
  ...WORLD5_CONCEPTS,
  ...WORLD6_CONCEPTS,
}

const worlds = computed(() =>
  ([1, 2, 3, 4, 5, 6] as const).map(w => ({
    world: w,
    name: WORLD_NAMES[w]!,
    levels: LEVELS.filter(l => l.world === w),
    completed: LEVELS.filter(l => l.world === w && progress.isCompleted(l.id)).length,
  })),
)

const completedCount = computed(() => LEVELS.filter(level => progress.isCompleted(level.id)).length)
const recommendedLevel = computed(() => LEVELS.find(level => progress.isUnlocked(level.id) && !progress.isCompleted(level.id)) ?? null)
const currentWorld = computed(() => recommendedLevel.value?.world ?? 6)

function worldName(world: number) {
  return WORLD_NAMES[world] ?? ''
}

function conceptFor(id: string) {
  return CONCEPTS[id] ?? ''
}

async function loadProgress() {
  loading.value = true
  progressError.value = false
  try {
    await progress.fetch()
  }
  catch {
    progressError.value = true
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  sessionReady.value = true
  if (auth.isAuthenticated) void loadProgress()
})

const SITE_URL = 'https://rust-quest-2d-one.vercel.app'
const DESCRIPTION
  = 'Mapa dos 30 níveis do Rust Quest 2D: 6 mundos que ensinam Rust do let ao ownership — Vila das Variáveis até as Ruínas da Posse. Os 3 primeiros níveis são grátis sem cadastro.'

useSeoMeta({
  title: 'Mapa dos níveis — aprenda Rust em 6 mundos | Rust Quest 2D',
  description: DESCRIPTION,
  ogTitle: 'Mapa da aventura — Rust Quest 2D',
  ogDescription: DESCRIPTION,
  ogUrl: `${SITE_URL}/mapa`,
  ogImage: `${SITE_URL}/og.png`,
  ogType: 'website',
  ogLocale: 'pt_BR',
  ogSiteName: 'Rust Quest 2D',
  twitterCard: 'summary_large_image',
})

useHead({
  link: [{ rel: 'canonical', href: `${SITE_URL}/mapa` }],
})
</script>

<style scoped>
.map-page {
  max-width: 1120px;
  margin: 0 auto;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.eyebrow,
.current-world-label {
  margin: 0 0 0.35rem;
  color: var(--accent-2);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.map-header h1 {
  margin: 0 0 0.35rem;
  font-size: 1.85rem;
}

.subtitle {
  color: var(--text-dim);
  margin: 0;
}

.header-stats {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-panel);
  color: var(--text-dim);
  font-size: 0.82rem;
}

.stat strong {
  color: var(--text);
  font-size: 0.95rem;
}

.world {
  margin: 1.75rem 0 2rem;
  padding-left: 1rem;
  border-left: 2px solid var(--border);
}

.world--current {
  border-left-color: var(--accent);
}

.world-title {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 1.15rem;
  font-weight: 800;
  margin: 0;
}

.world-num {
  color: var(--accent-2);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 700;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(205px, 1fr));
  gap: 0.7rem;
  margin-top: 0.8rem;
}

.level-card {
  min-width: 0;
  min-height: 148px;
  padding: 0.85rem 0.9rem;
  color: var(--text);
  display: flex;
  flex-direction: column;
  text-decoration: none;
  transition: transform 0.15s, border-color 0.15s, background 0.15s;
  background: var(--bg-panel);
}

.level-card--completed {
  border-color: rgb(120 214 160 / 42%);
}

.level-card--recommended {
  border-color: var(--gold);
  background: linear-gradient(135deg, rgb(240 201 109 / 9%), transparent 70%), var(--bg-panel);
}

.level-card:hover:not(.level-card--locked) {
  transform: translateY(-2px);
  border-color: var(--accent);
  background-color: var(--bg-elevated);
  text-decoration: none;
}

.level-card--locked {
  color: var(--text-dim);
  border-style: dashed;
  opacity: 0.68;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.65rem;
}

.order {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--border-bright);
  border-radius: 7px;
  background: var(--bg-elevated);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 0.82rem;
  font-weight: 700;
}

.card-stars {
  letter-spacing: 0.08em;
  color: #56645d;
}

.card-stars .on {
  color: var(--gold);
}

.card-title {
  overflow-wrap: anywhere;
  font-weight: 700;
  font-size: 0.95rem;
}

.card-concept {
  margin-top: 0.25rem;
  color: var(--text-dim);
  font-size: 0.82rem;
  line-height: 1.4;
}

.card-state {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: auto;
  padding-top: 0.7rem;
  color: var(--text-dim);
  font-size: 0.76rem;
  font-weight: 700;
}

.level-card--completed .card-state { color: var(--green); }
.level-card--recommended .card-state { color: var(--gold); }
.level-card--locked .card-state { color: var(--text-dim); }

.world-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.current-world-label { margin-bottom: 0.2rem; color: var(--gold); }

.world-progress {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-width: 115px;
  color: var(--text-dim);
  font-size: 0.78rem;
  font-variant-numeric: tabular-nums;
}

progress {
  width: 100%;
  height: 7px;
  overflow: hidden;
  appearance: none;
  border: 0;
  border-radius: 999px;
  background: var(--bg-elevated);
}

progress::-webkit-progress-bar { background: var(--bg-elevated); border-radius: 999px; }
progress::-webkit-progress-value { background: var(--green); border-radius: 999px; }
progress::-moz-progress-bar { background: var(--green); border-radius: 999px; }

.journey-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.2rem 1.35rem;
  border-color: rgb(240 201 109 / 48%);
  background: linear-gradient(110deg, rgb(240 201 109 / 9%), transparent 58%), var(--bg-panel);
}

.journey-copy { min-width: 0; flex: 1; }
.journey-copy h2 { margin: 0; font-size: 1.2rem; }
.journey-copy > p:not(.eyebrow) { margin: 0.35rem 0 0; color: var(--text-dim); font-size: 0.88rem; }
.journey-banner .eyebrow { color: var(--gold); }
.continue-btn { flex: 0 0 auto; }

.overall-progress {
  max-width: 420px;
  margin-top: 0.85rem;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.35rem;
  color: var(--text-dim);
  font-size: 0.76rem;
}

.progress-label strong { color: var(--text); }
.progress-alert { margin-bottom: 1rem; }
.progress-alert :deep(.btn) { margin-top: 0.55rem; }

.map-loading { padding: 1.3rem 0; }
.loading-title { color: var(--text-dim); font-weight: 600; }
.skeleton-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.7rem; margin-top: 0.8rem; }
.skeleton-row span { height: 128px; border-radius: var(--radius); background: linear-gradient(100deg, var(--bg-panel) 35%, var(--bg-elevated) 50%, var(--bg-panel) 65%); background-size: 250% 100%; animation: shimmer 1.6s ease-in-out infinite; }

@keyframes shimmer { to { background-position: -150% 0; } }

@media (max-width: 640px) {
  .map-header { align-items: flex-start; flex-direction: column; }
  .map-header h1 { font-size: 1.55rem; }
  .header-stats { width: 100%; }
  .stat { flex: 1; }
  .journey-banner { align-items: stretch; flex-direction: column; gap: 0.85rem; padding: 1rem; }
  .continue-btn { width: 100%; }
  .world { padding-left: 0.65rem; margin: 1.35rem 0 1.6rem; }
  .world-header { align-items: flex-start; }
  .world-title { align-items: flex-start; flex-direction: column; gap: 0.25rem; }
  .world-progress { min-width: 82px; max-width: 110px; padding-top: 0.2rem; }
  .cards { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.55rem; }
  .level-card { min-height: 150px; padding: 0.7rem; }
  .card-title { font-size: 0.85rem; }
  .card-concept { font-size: 0.75rem; }
  .skeleton-row { grid-template-columns: repeat(2, 1fr); }
  .skeleton-row span:nth-child(3) { display: none; }
}

@media (max-width: 360px) {
  .cards { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-row span { animation: none; }
  .level-card { transition: none; }
}
</style>
