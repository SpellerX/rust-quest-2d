import type { GameCommand, GameError, Outcome } from '#shared/types'
import type { Level } from '#shared/levels/types'
import { execute } from '#shared/interpreter'
import { simulate } from '#shared/game/simulator'

export type GamePhase = 'idle' | 'animating' | 'won' | 'lost'

const CODE_KEY = (levelId: string) => `rq_code_${levelId}`

export const useGameStore = defineStore('game', () => {
  const level = ref<Level | null>(null)
  const code = ref('')
  const phase = ref<GamePhase>('idle')
  const lastError = ref<GameError | null>(null)
  const outcome = ref<Outcome | null>(null)
  const commands = ref<GameCommand[]>([])
  const hintsUsed = ref(0)
  const exampleShown = ref(false)
  /** Dicas progressivas reveladas (0..2) — exemplo vem depois das duas. */
  const revealedHints = ref(0)
  /** Rodou sem nenhum comando (starter só-comentários executado cedo demais). */
  const emptyCode = ref(false)
  const resetCounter = ref(0)

  function loadLevel(l: Level) {
    level.value = l
    if (import.meta.client) {
      code.value = sessionStorage.getItem(CODE_KEY(l.id)) ?? l.starterCode
    }
    else {
      code.value = l.starterCode
    }
    phase.value = 'idle'
    lastError.value = null
    outcome.value = null
    commands.value = []
    hintsUsed.value = 0
    exampleShown.value = false
    revealedHints.value = 0
    emptyCode.value = false
    resetCounter.value++
  }

  function setCode(next: string) {
    code.value = next
    if (import.meta.client && level.value) {
      sessionStorage.setItem(CODE_KEY(level.value.id), next)
    }
  }

  /**
   * Executa o código no interpretador compartilhado e simula o resultado.
   * INVARIANTE: a vitória vem do simulador, nunca da animação.
   */
  function run() {
    if (!level.value || phase.value === 'animating') return
    lastError.value = null
    emptyCode.value = false

    const result = execute(code.value, { allowedFunctions: level.value.allowedFunctions })
    if (!result.ok) {
      lastError.value = result.error
      outcome.value = null
      return
    }

    if (result.commands.length === 0) {
      // Só comentários/vazio: não anima nem marca derrota — só avisa.
      emptyCode.value = true
      outcome.value = null
      return
    }

    commands.value = result.commands
    outcome.value = simulate(level.value.map, result.commands, level.value.success)
    phase.value = 'animating'
  }

  /** Chamado pelo playback quando a fila de animação termina. */
  function finishAnimation() {
    if (!outcome.value) return
    if (outcome.value.result === 'win') {
      phase.value = 'won'
      const auth = useAuthStore()
      const progress = useProgressStore()
      const stars = computedStars()
      if (auth.isAuthenticated) {
        // Fase 2: servidor é a autoridade final (POST /api/attempts).
        void submitAttempt(stars)
      }
      else {
        progress.applyLocalWin(level.value!.id, stars)
      }
    }
    else {
      phase.value = 'lost'
    }
  }

  async function submitAttempt(localStars: number) {
    const auth = useAuthStore()
    const progress = useProgressStore()
    if (!level.value || !auth.token) return
    try {
      const res = await $fetch<{
        success: boolean
        stars?: number
        xp?: number
        totalStars?: number
        unlockedLevelIds?: string[]
        error?: GameError
        outcome?: Outcome
      }>('/api/attempts', {
        method: 'POST',
        headers: { Authorization: `Bearer ${auth.token}` },
        body: {
          levelId: level.value.id,
          code: code.value,
          hintsUsed: hintsUsed.value,
        },
      })
      if (res.success && res.stars != null) {
        progress.applyLocalWin(level.value.id, res.stars)
        if (res.xp != null) auth.updateUser({ xp: res.xp, totalStars: res.totalStars ?? 0 })
        if (res.unlockedLevelIds) progress.setUnlocked(res.unlockedLevelIds)
      }
      else if (res.error) {
        // Revalidação do servidor discordou — mostra como erro amigável.
        lastError.value = res.error
      }
    }
    catch {
      // Sem rede: mantém a vitória local para não frustrar o jogador.
      progress.applyLocalWin(level.value.id, localStars)
    }
  }

  function computedStars(): number {
    return Math.max(1, 3 - hintsUsed.value)
  }

  function useHint() {
    hintsUsed.value++
  }

  /** Revela dica progressiva — só na ordem e uma vez cada. */
  function revealHint(index: number) {
    if (index !== revealedHints.value || revealedHints.value >= 2) return
    revealedHints.value++
    hintsUsed.value++
  }

  function showExample() {
    if (exampleShown.value || revealedHints.value < 2) return
    exampleShown.value = true
    hintsUsed.value++
    if (level.value) setCode(level.value.solution)
  }

  function requestReset() {
    if (!level.value) return
    setCode(level.value.starterCode)
    resetCounter.value++
    phase.value = 'idle'
    lastError.value = null
    outcome.value = null
  }

  function backToIdle() {
    phase.value = 'idle'
    lastError.value = null
    outcome.value = null
  }

  return {
    level,
    code,
    phase,
    lastError,
    outcome,
    commands,
    hintsUsed,
    exampleShown,
    revealedHints,
    emptyCode,
    resetCounter,
    loadLevel,
    setCode,
    run,
    finishAnimation,
    computedStars,
    useHint,
    revealHint,
    showExample,
    requestReset,
    backToIdle,
  }
})
