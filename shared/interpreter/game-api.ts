export type PrimitiveType = 'i32' | 'f64' | 'bool' | 'String'

export interface ParamSpec {
  name: string
  type: PrimitiveType
  optional?: boolean
  default?: number | boolean
}

export interface FunctionSpec {
  params: ParamSpec[]
}

export type GameFunctionName = 'mover_direita' | 'mover_esquerda' | 'pular' | 'esperar' | 'falar'

/**
 * API de jogo whitelistada — as únicas funções da biblioteca que o código
 * do jogador pode chamar (além das `fn` que ele mesmo define).
 * `pegar()` não existe: moedas são coletadas automaticamente ao entrar na célula.
 */
export const GAME_API: Record<GameFunctionName, FunctionSpec> = {
  mover_direita: { params: [{ name: 'passos', type: 'i32' }] },
  mover_esquerda: { params: [{ name: 'passos', type: 'i32' }] },
  pular: { params: [{ name: 'forca', type: 'i32', optional: true, default: 1 }] },
  esperar: { params: [{ name: 'segundos', type: 'f64' }] },
  falar: { params: [{ name: 'mensagem', type: 'String' }] },
}

export const ALL_GAME_FUNCTIONS = Object.keys(GAME_API) as GameFunctionName[]
