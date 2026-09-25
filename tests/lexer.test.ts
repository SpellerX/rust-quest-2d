import { describe, expect, it } from 'vitest'
import { GameException } from '../shared/interpreter/errors'
import { tokenize } from '../shared/interpreter/lexer'

describe('lexer', () => {
  it('tokeniza números inteiros e decimais', () => {
    const tokens = tokenize('let x = 42; let y = 3.14;')
    const types = tokens.map(t => `${t.type}:${t.value}`)
    expect(types).toContain('int:42')
    expect(types).toContain('float:3.14')
  })

  it('reconhece identificadores e palavras-chave', () => {
    const tokens = tokenize('let mut passos = 1;')
    expect(tokens[0]).toMatchObject({ type: 'keyword', value: 'let' })
    expect(tokens[1]).toMatchObject({ type: 'keyword', value: 'mut' })
    expect(tokens[2]).toMatchObject({ type: 'ident', value: 'passos' })
  })

  it('reconhece operadores de um e dois caracteres', () => {
    const tokens = tokenize('a == b <= c + d')
    const ops = tokens.filter(t => t.type === 'op').map(t => t.value)
    expect(ops).toEqual(['==', '<=', '+'])
  })

  it('ignora comentários //', () => {
    const tokens = tokenize('mover_direita(3); // conta até a porta')
    expect(tokens.some(t => t.value === 'conta')).toBe(false)
  })

  it('registra linha e coluna nos spans', () => {
    const tokens = tokenize('let x = 1;\nlet y = 2;')
    const secondLet = tokens.find(t => t.value === 'let' && t.span.line === 2)!
    expect(secondLet.span.line).toBe(2)
    expect(secondLet.span.col).toBe(1)
  })

  it('rejeita caracteres estranhos com E0001 apontando a posição', () => {
    try {
      tokenize('let x = @;')
      expect.unreachable()
    }
    catch (e) {
      expect(e).toBeInstanceOf(GameException)
      const err = (e as GameException).gameError
      expect(err.code).toBe('E0001')
      expect(err.line).toBe(1)
      expect(err.col).toBe(9)
    }
  })
})
