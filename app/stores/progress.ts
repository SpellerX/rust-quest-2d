import { LEVELS, unlockedLevelIds } from '#shared/levels'

export interface LevelProgress {
  levelId: string
  stars: number
  completedAt?: string
  attemptsCount?: number
}

export const useProgressStore = defineStore('progress', () => {
  const levels = LEVELS
  const xp = ref(0)
  const totalStars = ref(0)
  const progress = ref<LevelProgress[]>([])
  /** Desbloqueio local (Fase 0): sequência global de níveis. */
  const localUnlocked = ref<string[]>(['w1-l1'])

  const starsByLevel = computed(() => {
    const map: Record<string, number> = {}
    for (const p of progress.value) map[p.levelId] = p.stars
    return map
  })

  const unlockedIds = computed(() => localUnlocked.value)

  function isUnlocked(levelId: string) {
    return unlockedIds.value.includes(levelId)
  }

  function isCompleted(levelId: string) {
    return levelId in starsByLevel.value
  }

  /** Recompensa local (Fase 0) — substituída pela resposta do servidor na Fase 2. */
  function applyLocalWin(levelId: string, stars: number) {
    const existing = starsByLevel.value[levelId]
    const best = Math.max(existing ?? 0, stars)
    const list = progress.value.filter(p => p.levelId !== levelId)
    list.push({ levelId, stars: best, completedAt: new Date().toISOString() })
    progress.value = list
    totalStars.value = Object.values(starsByLevel.value).reduce((a, b) => a + b, 0)
    if (!existing) xp.value += stars * 10
    localUnlocked.value = unlockedLevelIds(progress.value.map(p => p.levelId))
  }

  function setUnlocked(ids: string[]) {
    localUnlocked.value = ids
  }

  async function fetch() {
    const auth = useAuthStore()
    if (!auth.token) return
    const res = await $fetch<{
      xp: number
      totalStars: number
      progress: LevelProgress[]
      unlockedLevelIds: string[]
    }>('/api/progress', {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    xp.value = res.xp
    totalStars.value = res.totalStars
    progress.value = res.progress
    localUnlocked.value = res.unlockedLevelIds
  }

  return {
    levels,
    xp,
    totalStars,
    progress,
    starsByLevel,
    unlockedIds,
    isUnlocked,
    isCompleted,
    applyLocalWin,
    setUnlocked,
    fetch,
  }
})
