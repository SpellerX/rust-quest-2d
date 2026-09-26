export interface CheatSection {
  title: string
  lines: string[]
}

export type SuccessType = 'reach_goal' | 'reach_goal_all_coins'

/** Conteúdo pedagógico exibido no card de intro e no resumo de vitória. */
export interface ConceptBlock {
  title: string
  body: string
  bullets: string[]
}

export interface Level {
  /** ex.: 'w1-l1' */
  id: string
  world: 1 | 2 | 3 | 4 | 5 | 6
  /** ordem dentro do mundo (1..5) */
  order: number
  title: string
  narrative: string
  /** Card "O que você vai aprender" — ANTES de começar. */
  concept: ConceptBlock
  /** Resumo "Você aprendeu" — na tela de vitória. */
  learnAfter: ConceptBlock
  allowedFunctions: string[]
  /**
   * Só comentários-guia (zero código executável) — o jogador escreve tudo.
   * Exceções: w1-l3 (código quebrado, lição do E0384) e w6-l2 (lição do
   * E0382 — uso após move).
   */
  starterCode: string
  /** Solução completa escrita do zero (usada por "Mostrar exemplo" e testes). */
  solution: string
  /** Mapa ASCII vertical multi-linha (mesma largura em todas as linhas). */
  map: string[]
  success: { type: SuccessType }
  /** Dicas progressivas: [dica 1, dica 2] — cada revelação custa 1 estrela. */
  hints: [string, string]
  cheatSheet: CheatSection[]
}
