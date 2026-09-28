/**
 * Corta um texto para a faixa útil de `meta description` (buscadores
 * truncam por volta de 155-160 caracteres e cortam no meio da palavra).
 *
 * Corta no espaço anterior quando possível, para não deixar palavra pela
 * metade, e fecha com reticências.
 */
export function cortaMeta(texto: string, max = 155): string {
  const limpo = texto.replace(/\s+/g, ' ').trim()
  if (limpo.length <= max) return limpo

  const tentativa = limpo.slice(0, max - 1)
  const espaco = tentativa.lastIndexOf(' ')
  const corte = espaco > max * 0.6 ? tentativa.slice(0, espaco) : tentativa
  return `${corte.trimEnd()}…`
}
