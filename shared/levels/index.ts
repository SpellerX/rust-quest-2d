import { WORLD1_LEVELS } from './world1'
import { WORLD2_LEVELS } from './world2'
import type { Level } from './types'

/** Sequência única de desbloqueio: mundos em ordem, níveis por `order`. */
export const LEVELS: Level[] = [...WORLD1_LEVELS, ...WORLD2_LEVELS]

export function getLevel(id: string): Level | undefined {
  return LEVELS.find(l => l.id === id)
}

/** Níveis desbloqueados para quem já completou os ids informados (ordem global). */
export function unlockedLevelIds(completedLevelIds: string[]): string[] {
  const done = new Set(completedLevelIds)
  const unlocked: string[] = []
  for (const level of LEVELS) {
    unlocked.push(level.id)
    if (!done.has(level.id)) break
  }
  return unlocked
}
