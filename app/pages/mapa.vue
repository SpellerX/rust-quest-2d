<template>
  <div class="map-page">
    <header class="map-header">
      <div>
        <h1>🗺️ Mapa da aventura</h1>
        <p class="subtitle">Complete os níveis na sequência para desbloquear os próximos.</p>
      </div>
      <div class="header-stats">
        <span class="stat">⭐ {{ progress.totalStars }}</span>
        <span class="stat">⚡ {{ auth.user?.xp ?? progress.xp }} XP</span>
        <button class="btn" @click="auth.logout()">Sair</button>
      </div>
    </header>

    <section v-for="world in worlds" :key="world.world" class="world">
      <h2 class="world-title">
        <span class="world-num">Mundo {{ world.world }}</span>
        {{ world.name }}
      </h2>

      <div class="cards">
        <NuxtLink
          v-for="level in world.levels"
          :key="level.id"
          class="card panel"
          :class="{ locked: !progress.isUnlocked(level.id) }"
          :to="progress.isUnlocked(level.id) ? `/nivel/${level.id}` : '/mapa'"
        >
          <div class="card-top">
            <span v-if="!progress.isUnlocked(level.id)" class="lock">🔒</span>
            <span v-else class="order">{{ level.order }}</span>
            <span class="card-stars">
              <span
                v-for="n in 3"
                :key="n"
                :class="{ on: n <= (progress.starsByLevel[level.id] ?? 0) }"
              >★</span>
            </span>
          </div>
          <div class="card-title">{{ level.title }}</div>
          <div class="card-concept">{{ conceptFor(level.id) }}</div>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { LEVELS } from '#shared/levels'

definePageMeta({ middleware: 'auth' })

const progress = useProgressStore()
const auth = useAuthStore()

const WORLD_NAMES: Record<number, string> = {
  1: 'Vila das Variáveis',
  2: 'Penhasco dos Operadores',
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
}

const worlds = computed(() =>
  ([1, 2] as const).map(w => ({
    world: w,
    name: WORLD_NAMES[w]!,
    levels: LEVELS.filter(l => l.world === w),
  })),
)

function conceptFor(id: string) {
  return CONCEPTS[id] ?? ''
}

onMounted(async () => {
  if (auth.isAuthenticated) {
    await progress.fetch().catch(() => {})
  }
})
</script>

<style scoped>
.map-page {
  max-width: 1000px;
  margin: 0 auto;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.4rem;
}

.map-header h1 {
  margin-bottom: 0.2rem;
}

.subtitle {
  color: var(--text-dim);
  margin: 0;
}

.header-stats {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.stat {
  color: var(--gold);
  font-weight: 600;
}

.world {
  margin-bottom: 1.6rem;
}

.world-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.15rem;
}

.world-num {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  font-size: 0.75rem;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  color: var(--accent-2);
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 0.8rem;
}

.card {
  padding: 0.9rem;
  color: var(--text);
  transition: transform 0.12s, border-color 0.12s;
  display: block;
}

.card:hover:not(.locked) {
  transform: translateY(-2px);
  border-color: var(--accent);
  text-decoration: none;
}

.card.locked {
  opacity: 0.45;
  cursor: not-allowed;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.order {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-stars {
  letter-spacing: 0.1em;
  color: #3a4160;
}

.card-stars .on {
  color: var(--gold);
}

.card-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.card-concept {
  color: var(--text-dim);
  font-size: 0.8rem;
}
</style>
