import type { RunResult } from '../types'
import { check } from './checker'
import { GameException } from './errors'
import { run } from './executor'
import { parse } from './parser'

export interface ExecuteOptions {
  /** Allowlist do nível — quais funções da API de jogo estão liberadas. */
  allowedFunctions: string[]
}

export { GAME_API, ALL_GAME_FUNCTIONS } from './game-api'
export type { GameFunctionName } from './game-api'

/**
 * Pipeline completo: lexer → parser → checker → executor.
 * Puro e síncrono: roda idêntico no browser e no Nitro.
 * Nunca lança erro de código do jogador — erros viram RunResult.error.
 */
export function execute(code: string, options: ExecuteOptions): RunResult {
  try {
    const program = parse(code)
    check(program, options)
    const commands = run(program)
    return { ok: true, commands, error: null, stdout: [] }
  }
  catch (e) {
    if (e instanceof GameException) {
      return { ok: false, commands: [], error: e.gameError, stdout: [] }
    }
    throw e
  }
}
