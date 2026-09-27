import { CAPITULOS } from './capitulos'
import type { Capitulo } from './types'

export { CAPITULOS }
export type { Capitulo, CodigoExemplo, SecaoArtigo } from './types'

/** Nomes dos mundos — a mesma grade usada no mapa da aventura. */
export const NOMES_MUNDOS: Record<number, string> = {
  1: 'Vila das Variáveis',
  2: 'Penhasco dos Operadores',
  3: 'Floresta das Decisões',
  4: 'Caverna da Repetição',
  5: 'Oficina das Funções',
  6: 'Ruínas da Posse',
}

/** Título curto do passo da progressão canônica — orientação do novato no índice. */
export const NOMES_PASSOS: Record<number, string> = {
  1: 'Sintaxe básica',
  2: 'Tipos e valores',
  3: 'Variáveis e mutabilidade',
  4: 'Operadores e expressões',
  5: 'Controle de fluxo',
  6: 'Funções',
  9: 'Tratamento de erros',
  10: 'Conceitos próprios de Rust',
}

export function getCapitulo(slug: string): Capitulo | undefined {
  return CAPITULOS.find(c => c.slug === slug)
}

/** Capítulos de um mundo, na ordem em que foram escritos. */
export function capitulosDoMundo(mundo: number): Capitulo[] {
  return CAPITULOS.filter(c => c.mundo === mundo)
}

/** Os 6 mundos na ordem do jogo, para renderizar a prateleira. */
export function prateleiras(): { mundo: number; nome: string; capitulos: Capitulo[] }[] {
  return [1, 2, 3, 4, 5, 6].map(mundo => ({
    mundo,
    nome: NOMES_MUNDOS[mundo] ?? '',
    capitulos: capitulosDoMundo(mundo),
  }))
}

/** Mapa nível → slug do capítulo que o explica. Derivado de `capitulos[].niveis`. */
export const CAPITULO_POR_NIVEL: Record<string, string> = Object.fromEntries(
  CAPITULOS.flatMap(capitulo =>
    capitulo.niveis.map(nivel => [nivel, capitulo.slug] as [string, string]),
  ),
)

export function slugDoNivel(levelId: string): string | undefined {
  return CAPITULO_POR_NIVEL[levelId]
}
