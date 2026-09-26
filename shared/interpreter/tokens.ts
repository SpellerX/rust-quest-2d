import type { Span } from '../types'

export type TokenType = 'int' | 'float' | 'string' | 'ident' | 'keyword' | 'op' | 'punct' | 'eof'

export interface Token {
  type: TokenType
  value: string
  span: Span
}

export const KEYWORDS = new Set([
  'let', 'mut', 'true', 'false', 'i32', 'f64', 'bool', 'String',
  'if', 'else', 'while', 'loop', 'for', 'in',
  'fn', 'return', 'break', 'continue',
])

/** Operadores de um ou dois caracteres, mais longos primeiro. */
export const OPERATORS = ['==', '!=', '<=', '>=', '&&', '||', '..', '->', '+', '-', '*', '/', '%', '=', '<', '>', '!'] as const

export const PUNCTUATION = ['(', ')', ';', ',', ':', '{', '}', '&'] as const
