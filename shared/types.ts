/** Posição no código-fonte (alimenta mensagens de erro amigáveis). */
export interface Span {
  line: number
  col: number
  start: number
  end: number
}

/** Comando de jogo produzido pelo interpretador, consumido pelo simulador e pela animação. */
export type GameCommand =
  | { type: 'move'; direction: 'right' | 'left'; steps: number; src: Span }
  | { type: 'jump'; force: number; src: Span }
  | { type: 'wait'; durationMs: number; src: Span }
  /** Fala do herói: sem efeito físico (simulador ignora), animação pausa. */
  | { type: 'speak'; text: string; src: Span }

export type ErrorStage = 'lex' | 'parse' | 'check' | 'exec'

/** Erro do interpretador: `message` técnico (dev), `friendly` PT-BR (UI). */
export interface GameError {
  code: string
  stage: ErrorStage
  message: string
  friendly: string
  line: number
  col: number
  hint?: string
}

/** Resultado de uma execução do interpretador. */
export interface RunResult {
  ok: boolean
  commands: GameCommand[]
  error: GameError | null
  /** Hook para println! no futuro; sempre [] no MVP. */
  stdout: string[]
}

export type DeathCause = 'spike' | 'pit'

/** Tipo de célula do trace: escolhe a animação no playback. */
export type CellKind = 'walk' | 'jump' | 'fall'

/** Resultado da simulação do mapa — fonte da verdade do sucesso. */
export interface Outcome {
  result: 'win' | 'death' | 'incomplete'
  cause?: DeathCause
  /** Índice do comando em que morreu — a animação para ali. */
  deathStep?: number
  coinsCollected: number
  coinsTotal: number
  finalX: number
  finalY: number
  /**
   * trace[i] = células percorridas (sobrevividas) do comando i, com y
   * variando (arcos e quedas). No comando do abandono termina exatamente
   * onde o jogador errou.
   */
  trace: Array<Array<{ x: number; y: number; k: CellKind }>>
}
