import { WORLD1_LEVELS } from './world1'
import { WORLD2_LEVELS } from './world2'
import { WORLD3_LEVELS } from './world3'
import { WORLD4_LEVELS } from './world4'
import { WORLD5_LEVELS } from './world5'
import { WORLD6_LEVELS } from './world6'
import type { Level } from './types'

/** Sequência única de desbloqueio: mundos em ordem, níveis por `order`. */
export const LEVELS: Level[] = [
  ...WORLD1_LEVELS,
  ...WORLD2_LEVELS,
  ...WORLD3_LEVELS,
  ...WORLD4_LEVELS,
  ...WORLD5_LEVELS,
  ...WORLD6_LEVELS,
]

/** Níveis jogáveis sem conta — 3 primeiros da sequência. */
export const FREE_LEVEL_IDS: string[] = ['w1-l1', 'w1-l2', 'w1-l3']

export function isFreeLevel(id: string): boolean {
  return FREE_LEVEL_IDS.includes(id)
}

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
