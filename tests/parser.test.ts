import { describe, expect, it } from 'vitest'
import { GameException } from '../shared/interpreter/errors'
import { parse } from '../shared/interpreter/parser'

function codeError(source: string): string {
  try {
    parse(source)
    expect.unreachable('devia ter falhado')
  }
  catch (e) {
    if (e instanceof GameException) return e.gameError.code
    throw e
  }
  return ''
}

describe('parser', () => {
  it('precedência: 2 + 3 * 4 soma com produto por filho', () => {
    const program = parse('let x = 2 + 3 * 4;')
    const decl = program.body[0]!
    expect(decl.kind).toBe('LetDecl')
    if (decl.kind !== 'LetDecl') return
    expect(decl.value.kind).toBe('Binary')
    if (decl.value.kind !== 'Binary') return
    expect(decl.value.op).toBe('+')
    expect(decl.value.right.kind).toBe('Binary')
    if (decl.value.right.kind !== 'Binary') return
    expect(decl.value.right.op).toBe('*')
  })

  it('parênteses agrupam', () => {
    const program = parse('let x = (2 + 3) * 4;')
    const decl = program.body[0]!
    if (decl.kind !== 'LetDecl') return expect.unreachable()
    expect(decl.value.kind).toBe('Binary')
    if (decl.value.kind !== 'Binary') return
    expect(decl.value.op).toBe('*')
    expect(decl.value.left.kind).toBe('Binary')
  })

  it('aceita let mut com anotação de tipo', () => {
    const program = parse('let mut x: i32 = 1;')
    const decl = program.body[0]!
    if (decl.kind !== 'LetDecl') return expect.unreachable()
    expect(decl.mut).toBe(true)
    expect(decl.typeAnn).toBe('i32')
  })

  it('atribuição vira nó Assign (não confunde com ==)', () => {
    const program = parse('let mut x = 1; x = 2;')
    expect(program.body[1]!.kind).toBe('Assign')
    const cmp = parse('let b = x == 2;')
    const decl = cmp.body[0]!
    if (decl.kind !== 'LetDecl') return expect.unreachable()
    expect(decl.value.kind).toBe('Binary')
  })

  it('faltando ; aponta E0002', () => {
    expect(codeError('mover_direita(3)')).toBe('E0002')
  })

  it('let sem nome aponta E0002', () => {
    expect(codeError('let = 5;')).toBe('E0002')
  })

  it('chamada com parênteses não fechado aponta E0002', () => {
    expect(codeError('mover_direita(3;')).toBe('E0002')
  })

  it('expressão incompleta após = aponta E0002', () => {
    expect(codeError('let x = ;')).toBe('E0002')
  })

  it('token estranho aponta E0001', () => {
    expect(codeError('let x = }')).toBe('E0001')
  })
})
