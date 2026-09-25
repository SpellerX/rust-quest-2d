<template>
  <div v-if="level" class="level-page">
    <HUD
      :level="level"
      :stars="starsNow"
      :xp="auth.user?.xp ?? progress.xp"
    />

    <div class="game-grid">
      <div class="main-col">
        <GameCanvas :key="level.id" :map="level.map" />

        <ErrorDisplay
          :error="game.lastError"
          :hint-visible="hintRevealed"
          @use-hint="onUseHint"
        />

        <div v-if="game.emptyCode" class="empty-notice panel">
          ✍️ Seu código ainda não tem comandos — escreva no console e clique em Executar.
        </div>

        <CodeConsole
          :model-value="game.code"
          :disabled="game.phase === 'animating'"
          @update:model-value="game.setCode($event)"
          @run="onRun"
          @reset="onReset"
        />
      </div>

      <HintsPanel
        :level="level"
        :revealed-hints="game.revealedHints"
        :example-shown="game.exampleShown"
        @reveal="game.revealHint($event)"
        @show-example="game.showExample()"
      />
    </div>

    <NarrativeBanner
      :level="level"
      :phase="game.phase"
      :outcome="game.outcome"
      :stars="starsNow"
      :hints-used="game.hintsUsed"
      :next-level-id="nextLevelId"
      @retry="onRetry"
      @map="navigateTo('/mapa')"
      @next="onNext"
    />
  </div>
</template>

<script setup lang="ts">
import { getLevel, LEVELS } from '#shared/levels'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const game = useGameStore()
const progress = useProgressStore()
const auth = useAuthStore()

const level = computed(() => getLevel(String(route.params.id)))
const nextLevelId = computed(() => {
  if (!level.value) return null
  const idx = LEVELS.findIndex(l => l.id === level.value!.id)
  return LEVELS[idx + 1]?.id ?? null
})
const starsNow = computed(() => game.computedStars())

const hintRevealed = ref(false)

// Troca de nível (link "Próximo nível" ou digitação de URL).
watch(
  level,
  (lvl) => {
    if (lvl) {
      cancelPlayback()
      game.loadLevel(lvl)
      hintRevealed.value = false
    }
    else {
      navigateTo('/mapa')
    }
  },
  { immediate: true },
)

// Nível trancado volta pro mapa.
watch(
  () => progress.unlockedIds,
  (ids) => {
    if (level.value && !ids.includes(level.value.id)) navigateTo('/mapa')
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
}

async function onReset() {
  game.requestReset()
  await resetScene()
}

function onUseHint() {
  game.useHint()
  hintRevealed.value = true
}

function onNext() {
  if (nextLevelId.value) navigateTo(`/nivel/${nextLevelId.value}`)
}
</script>

<style scoped>
.level-page {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.game-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 0.9rem;
  align-items: start;
}

.main-col {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  min-width: 0;
}

.empty-notice {
  padding: 0.7rem 0.9rem;
  color: var(--gold);
  border-color: var(--gold);
  font-size: 0.92rem;
}

@media (max-width: 960px) {
  .game-grid {
    grid-template-columns: 1fr;
  }
}
</style>
