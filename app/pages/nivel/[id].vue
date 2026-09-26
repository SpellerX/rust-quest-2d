<template>
  <div class="level-page">
    <template v-if="level">
      <header class="level-header">
        <p class="level-eyebrow">
          <span class="level-world-tag">Mundo {{ level.world }}</span>
          Nível {{ level.order }}
        </p>
        <h1>{{ level.title }}</h1>
        <p class="level-narrative-text">
          <span aria-hidden="true">✦</span> {{ level.narrative }}
        </p>
      </header>

      <ClientOnly>
        <template v-if="canPlay">
          <HUD
            :level="level"
            :stars="starsNow"
            :xp="auth.user?.xp ?? progress.xp"
          />

          <nav class="mobile-switch" aria-label="Área do nível">
            <button
              class="switch-button"
              :class="{ selected: mobilePane === 'code' }"
              type="button"
              :aria-pressed="mobilePane === 'code'"
              @click="mobilePane = 'code'"
            >
              <span aria-hidden="true">⌨</span> Código
            </button>
            <button
              class="switch-button"
              :class="{ selected: mobilePane === 'scene' }"
              type="button"
              :aria-pressed="mobilePane === 'scene'"
              @click="mobilePane = 'scene'"
            >
              <span aria-hidden="true">🗺️</span> Cena
            </button>
          </nav>

          <div class="game-grid" :class="`mobile-pane-${mobilePane}`">
            <section class="workbench-panel" aria-labelledby="editor-heading">
              <header class="workbench-header">
                <div>
                  <p class="workbench-eyebrow">Seu programa</p>
                  <h2 id="editor-heading">Console Rust</h2>
                </div>
                <span class="key-hint">Ctrl / ⌘ + Enter executa</span>
              </header>
              <CodeConsole
                :model-value="game.code"
                :disabled="game.phase === 'animating'"
                @update:model-value="game.setCode($event)"
                @run="onRun"
                @reset="onReset"
              />

              <InlineAlert v-if="game.emptyCode" class="empty-notice" tone="info">
                Seu programa ainda não executou nenhum comando. Escreva uma instrução e tente novamente.
              </InlineAlert>

              <ErrorDisplay
                :error="game.lastError"
                :hint-visible="hintRevealed"
                @use-hint="onUseHint"
              />

              <HintsPanel
                :level="level"
                :revealed-hints="game.revealedHints"
                :example-shown="game.exampleShown"
                @reveal="game.revealHint($event)"
                @show-example="game.showExample()"
              />
            </section>

            <section class="stage-panel" aria-label="Cena do jogo">
              <header class="stage-header">
                <span>Cena do nível</span>
                <span class="stage-state">{{ stageStatus }}</span>
              </header>
              <GameCanvas :key="level.id" :map="level.map" />
              <p class="sr-only" aria-live="polite">{{ sceneAnnouncement }}</p>
            </section>
          </div>

          <NarrativeBanner
            :level="level"
            :phase="game.phase"
            :outcome="game.outcome"
            :stars="starsNow"
            :hints-used="game.hintsUsed"
            :next-level-id="nextLevelId"
            :sync-state="game.syncState"
            @retry="onRetry"
            @retry-sync="game.retrySync()"
            @map="navigateTo('/mapa')"
            @next="onNext"
          />
        </template>

        <section v-else class="login-gate panel" aria-labelledby="gate-title">
          <p class="gate-eyebrow">Conta gratuita</p>
          <h2 id="gate-title">Este nível desbloqueia com uma conta grátis</h2>
          <p class="gate-text">
            Os 3 primeiros níveis são livres e não pedem cadastro. Criando uma conta
            gratuita você libera os 30 níveis e salva estrelas, XP e progresso em
            qualquer dispositivo.
          </p>
          <div class="gate-actions">
            <NuxtLink class="btn btn-primary" :to="`/login?redirect=${encodeURIComponent(route.path)}`">
              Entrar
            </NuxtLink>
            <NuxtLink class="btn" :to="`/registro?redirect=${encodeURIComponent(route.path)}`">
              Criar conta grátis
            </NuxtLink>
            <NuxtLink class="btn" to="/nivel/w1-l1">
              Jogar o 1º nível sem conta
            </NuxtLink>
          </div>
        </section>

        <template #fallback>
          <div class="level-loading" role="status" aria-live="polite">Preparando sua aventura…</div>
        </template>
      </ClientOnly>

      <section class="level-about panel" aria-labelledby="about-title">
        <p class="about-eyebrow">O que você vai aprender</p>
        <h2 id="about-title">{{ level.concept.title }}</h2>
        <p class="about-body">{{ level.concept.body }}</p>
        <ul class="about-bullets">
          <li v-for="(bullet, index) in level.concept.bullets" :key="index">{{ bullet }}</li>
        </ul>
      </section>
    </template>

    <div v-else class="level-loading" role="status" aria-live="polite">Preparando sua aventura…</div>
  </div>
</template>

<script setup lang="ts">
import { getLevel, isFreeLevel, LEVELS } from '#shared/levels'

const route = useRoute()
const game = useGameStore()
const progress = useProgressStore()
const auth = useAuthStore()

const level = computed(() => getLevel(String(route.params.id)))

/** Grátis sem conta: 3 primeiros níveis; demais exigem sessão. */
const canPlay = computed(() => {
  if (!level.value) return false
  return auth.isAuthenticated || isFreeLevel(level.value.id)
})
const nextLevelId = computed(() => {
  if (!level.value) return null
  const idx = LEVELS.findIndex(l => l.id === level.value!.id)
  return LEVELS[idx + 1]?.id ?? null
})
const starsNow = computed(() => game.computedStars())
const mobilePane = ref<'code' | 'scene'>('code')
const sceneAnnouncement = computed(() => {
  if (game.phase === 'animating') return 'Seu programa está sendo executado na cena.'
  if (game.phase === 'won') return 'Você chegou ao objetivo. Nível concluído.'
  if (game.phase === 'lost') return 'A execução terminou sem completar o nível.'
  return ''
})
const stageStatus = computed(() => ({
  idle: 'Pronta',
  animating: 'Executando',
  won: 'Objetivo alcançado',
  lost: 'Tente outra rota',
}[game.phase]))

const hintRevealed = ref(false)

// Troca de nível (link "Próximo nível" ou digitação de URL).
watch(
  level,
  (lvl) => {
    if (lvl) {
      cancelPlayback()
      game.loadLevel(lvl)
      hintRevealed.value = false
      mobilePane.value = 'code'
    }
    else {
      navigateTo('/mapa')
    }
  },
  { immediate: true },
)

// Nível trancado volta pro mapa — só conta logada (visitante no nível
// gratuito joga direto; no não-gratuito vê o gate de login).
watch(
  () => progress.unlockedIds,
  (ids) => {
    if (auth.isAuthenticated && level.value && !ids.includes(level.value.id)) navigateTo('/mapa')
  },
)

watch(() => game.lastError, () => {
  hintRevealed.value = false
})

async function onRun() {
  hintRevealed.value = false
  game.run()
  if (
    game.phase === 'animating'
    && game.outcome
    && game.commands.length > 0
  ) {
    mobilePane.value = 'scene'
    await playSequence(game.commands, game.outcome, () => game.finishAnimation())
  }
  else if (game.phase === 'animating') {
    // Programa vazio: simulação já decidiu (incomplete → lost sem animação).
    game.finishAnimation()
  }
}

async function onRetry() {
  await resetScene()
  game.backToIdle()
  mobilePane.value = 'code'
}

async function onReset() {
  game.requestReset()
  await resetScene()
  mobilePane.value = 'code'
}

function onUseHint() {
  game.useHint()
  hintRevealed.value = true
}

function onNext() {
  if (nextLevelId.value) navigateTo(`/nivel/${nextLevelId.value}`)
}

const SITE_URL = 'https://rust-quest-2d-one.vercel.app'
const levelTitle = computed(() =>
  level.value ? `${level.value.title} — nível ${level.value.order} | Rust Quest 2D` : 'Rust Quest 2D',
)
const levelDescription = computed(() => {
  const l = level.value
  if (!l) return 'Aprenda Rust jogando: 30 níveis grátis no navegador.'
  return `${l.narrative} Aprenda ${l.concept.title} em Rust neste nível ${l.order} do Mundo ${l.world} — grátis no navegador, sem instalar nada.`
})

useSeoMeta({
  title: levelTitle,
  description: levelDescription,
  ogTitle: levelTitle,
  ogDescription: levelDescription,
  ogUrl: computed(() => `${SITE_URL}/nivel/${String(route.params.id)}`),
  ogImage: `${SITE_URL}/og.png`,
  ogType: 'website',
  ogLocale: 'pt_BR',
  ogSiteName: 'Rust Quest 2D',
  twitterCard: 'summary_large_image',
  twitterTitle: levelTitle,
  twitterDescription: levelDescription,
  twitterImage: `${SITE_URL}/og.png`,
})

useHead({
  link: [{ rel: 'canonical', href: computed(() => `${SITE_URL}/nivel/${String(route.params.id)}`) }],
})
</script>

<style scoped>
.level-page {
  max-width: 1360px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.game-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: 1rem;
  align-items: start;
}

.level-header {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.level-eyebrow {
  margin: 0;
  color: var(--text-dim);
  font-size: 0.8rem;
}

.level-world-tag {
  background: var(--accent);
  color: #fff;
  font-size: 0.7rem;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  margin-right: 0.4rem;
  font-weight: 700;
}

.level-header h1 {
  margin: 0;
  font-size: 1.7rem;
  line-height: 1.15;
}

.level-narrative-text {
  margin: 0;
  color: var(--accent-2);
  font-size: 0.92rem;
  line-height: 1.5;
  max-width: 60rem;
}

/* Gate de login para níveis que exigem conta (visitante) */
.login-gate {
  padding: 1.6rem 1.5rem;
  max-width: 40rem;
}

.gate-eyebrow {
  margin: 0 0 0.4rem;
  color: var(--accent-2);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.login-gate h2 {
  margin: 0 0 0.6rem;
  font-size: 1.35rem;
}

.gate-text {
  margin: 0 0 1.1rem;
  color: var(--text-dim);
  line-height: 1.6;
}

.gate-actions {
  display: flex;
  gap: 0.7rem;
  flex-wrap: wrap;
}

.gate-actions .btn {
  text-decoration: none;
}

/* "O que você vai aprender" — SSR, base do conteúdo indexável do nível */
.level-about {
  padding: 1.2rem 1.4rem;
}

.about-eyebrow {
  margin: 0 0 0.3rem;
  color: var(--accent-2);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
}

.level-about h2 {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
}

.about-body {
  margin: 0 0 0.7rem;
  color: var(--text-dim);
  line-height: 1.6;
  max-width: 52rem;
}

.about-bullets {
  margin: 0;
  padding-left: 1.2rem;
  color: var(--text-dim);
  line-height: 1.6;
}

.workbench-panel {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.workbench-header,
.stage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
}

.workbench-eyebrow {
  margin: 0 0 0.2rem;
  color: var(--accent-2);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
}

.workbench-header h2 {
  margin: 0;
  font-size: 1.08rem;
}

.key-hint {
  color: var(--text-dim);
  font-size: 0.75rem;
  text-align: right;
}

.empty-notice { font-size: 0.9rem; }

.stage-panel {
  min-width: 0;
  padding: 0.65rem;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-panel);
  box-shadow: var(--shadow-panel);
}

.stage-header {
  padding: 0.1rem 0.2rem 0.65rem;
  color: var(--text-dim);
  font-size: 0.8rem;
  font-weight: 700;
}

.stage-state {
  color: var(--green);
  font-size: 0.75rem;
}

.mobile-switch { display: none; }
.level-loading { padding: 1.25rem 0; color: var(--text-dim); }

@media (max-width: 900px) {
  .mobile-switch {
    display: flex;
    gap: 0.25rem;
    padding: 0.25rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-panel);
  }

  .switch-button {
    flex: 1;
    min-height: 44px;
    border-radius: 6px;
    background: transparent;
    color: var(--text-dim);
    font: inherit;
    font-weight: 700;
  }

  .switch-button.selected {
    background: var(--bg-elevated);
    color: var(--text);
    box-shadow: inset 0 0 0 1px var(--border-bright);
  }

  .game-grid { grid-template-columns: minmax(0, 1fr); }
  .mobile-pane-code .stage-panel,
  .mobile-pane-scene .workbench-panel { display: none; }
  .mobile-pane-scene .stage-panel { max-width: 900px; margin: 0 auto; width: 100%; }
}

@media (max-width: 520px) {
  .level-page { gap: 0.6rem; }
  .level-narrative { padding: 0.6rem 0.7rem; }
  .level-narrative p { font-size: 0.85rem; }
  .workbench-header { align-items: flex-start; }
  .key-hint { max-width: 9rem; }
  .stage-panel { padding: 0.4rem; }
}

@media (prefers-reduced-motion: reduce) {
  .switch-button { transition: none; }
}
</style>
