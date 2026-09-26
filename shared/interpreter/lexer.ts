import type { Span } from '../types'
import { fail } from './errors'
import { KEYWORDS, OPERATORS, PUNCTUATION, type Token } from './tokens'

export function tokenize(source: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  let line = 1
  let col = 1

  const spanAt = (start: number, startLine: number, startCol: number): Span => ({
    line: startLine,
    col: startCol,
    start,
    end: i,
  })

  const advance = (n = 1) => {
    for (let k = 0; k < n; k++) {
      if (source[i] === '\n') {
        line++
        col = 1
      }
      else {
        col++
      }
      i++
    }
  }

  while (i < source.length) {
    const ch = source[i]!

    // Espaços em branco
    if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') {
      advance()
      continue
    }

    // Comentário // até o fim da linha
    if (ch === '/' && source[i + 1] === '/') {
      while (i < source.length && source[i] !== '\n') advance()
      continue
    }

    const start = i
    const startLine = line
    const startCol = col

    // Strings "..." (sem escapes — subconjunto didático)
    if (ch === '"') {
      advance()
      const valStart = i
      while (i < source.length && source[i] !== '"' && source[i] !== '\n') advance()
      if (source[i] !== '"') {
        fail('E0001', spanAt(start, startLine, startCol), 'string fechada com "')
      }
      const value = source.slice(valStart, i)
      advance() // fecha aspas
      tokens.push({ type: 'string', value, span: spanAt(start, startLine, startCol) })
      continue
    }

    // Números (int ou float)
    if (/[0-9]/.test(ch)) {
      while (i < source.length && /[0-9]/.test(source[i]!)) advance()
      let isFloat = false
      if (source[i] === '.' && /[0-9]/.test(source[i + 1] ?? '')) {
        isFloat = true
        advance()
        while (i < source.length && /[0-9]/.test(source[i]!)) advance()
      }
      tokens.push({
        type: isFloat ? 'float' : 'int',
        value: source.slice(start, i),
        span: spanAt(start, startLine, startCol),
      })
      continue
    }

    // Identificadores e palavras-chave
    if (/[A-Za-z_]/.test(ch)) {
      while (i < source.length && /[A-Za-z0-9_]/.test(source[i]!)) advance()
      const value = source.slice(start, i)
      tokens.push({
        type: KEYWORDS.has(value) ? 'keyword' : 'ident',
        value,
        span: spanAt(start, startLine, startCol),
      })
      continue
    }

    // Operadores (mais longos primeiro)
    const twoChar = source.slice(i, i + 2)
    const op = OPERATORS.find(o => o.length === 2 && o === twoChar)
      ?? OPERATORS.find(o => o.length === 1 && o === ch)
    if (op) {
      advance(op.length)
      tokens.push({ type: 'op', value: op, span: spanAt(start, startLine, startCol) })
      continue
    }

    // Pontuação
    if ((PUNCTUATION as readonly string[]).includes(ch)) {
      advance()
      tokens.push({ type: 'punct', value: ch, span: spanAt(start, startLine, startCol) })
      continue
    }

    fail('E0001', spanAt(start, startLine, startCol), `“${ch}”`)
  }

  tokens.push({ type: 'eof', value: '', span: { line, col, start: i, end: i } })
  return tokens
}
