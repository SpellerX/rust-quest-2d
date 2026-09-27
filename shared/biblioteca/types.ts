/** Um bloco de código de exemplo exibido dentro de uma seção do capítulo. */
export interface CodigoExemplo {
  titulo: string
  snippet: string
}

/** Bloco teórico de um capítulo — parágrafos livres + código opcional. */
export interface SecaoArtigo {
  titulo: string
  paragrafos: string[]
  codigos?: CodigoExemplo[]
}

/**
 * Capítulo da Biblioteca do Aventureiro — um "livrinho" na prateleira.
 * Cada capítulo aprofunda o conceito de um nível; vários níveis podem
 * apontar para o mesmo capítulo (ex.: `w1-l1` e `w5-l1` → `chamada-de-funcao`).
 */
export interface Capitulo {
  /** Amigável na URL, ex.: 'move', 'if-else'. */
  slug: string
  titulo: string
  /** Uma frase — usada na lombada e no rótulo do botão da vitória. */
  resumo: string
  /** Qual prateleira o livro ocupa. */
  mundo: 1 | 2 | 3 | 4 | 5 | 6
  /**
   * Encaixe na progressão canônica de 13 passos — orienta o novato.
   * 7, 8 e 11-13 não têm conteúdo no jogo hoje, então não aparecem.
   */
  passo: 1 | 2 | 3 | 4 | 5 | 6 | 9 | 10
  /** O que o jogador REALMENTE fez na fase — específico, não genérico. */
  oQueVoceFez: string
  secoes: SecaoArtigo[]
  /** Erros reais que um iniciante comete neste conceito. */
  pegadinhas?: string[]
  /** Referência ao livro oficial — a fonte da redação do capítulo. */
  livro: { capitulo: string; url: string }
  /** Ids dos níveis que apontam para este capítulo (cada id aparece uma vez só). */
  niveis: string[]
}
