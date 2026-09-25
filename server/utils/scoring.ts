/** Estrelas: 3 base, −1 por dica usada, piso de 1. */
export function starsForHints(hintsUsed: number): number {
  const clamped = Math.min(10, Math.max(0, Math.trunc(hintsUsed)))
  return Math.max(1, 3 - clamped)
}

/** XP de uma primeira conclusão de nível. */
export function xpForStars(stars: number): number {
  return stars * 10
}
