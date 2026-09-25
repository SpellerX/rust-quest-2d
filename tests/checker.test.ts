import { describe, expect, it } from 'vitest'
import { execute } from '../shared/interpreter'

const ALL = ['mover_direita', 'mover_esquerda', 'pular', 'esperar']

function errorOf(code: string, allowed = ALL) {
  const res = execute(code, { allowedFunctions: allowed })
  expect(res.ok, `devia falhar: ${code}`).toBe(false)
  return res.error!
}

describe('checker', () => {
  it('variável usada antes de declarar → E0412', () => {
    const err = errorOf('mover_direita(passos);')
    expect(err.code).toBe('E0412')
    expect(err.friendly).toContain('passos')
    expect(err.hint).toContain('let')
  })

  it('atribuição sem mut → E0384 com sugestão', () => {
    const err = errorOf('let x = 1; x = 2; mover_direita(x);')
    expect(err.code).toBe('E0384')
    expect(err.friendly).toContain('let mut')
  })

  it('atribuição com mut passa no checker', () => {
    const res = execute('let mut x = 1; x = 2; mover_direita(x);', { allowedFunctions: ALL })
    expect(res.ok).toBe(true)
  })

  it('inteiro onde espera i32 mas recebido f64 → E0308', () => {
    const err = errorOf('mover_direita(1.5);')
    expect(err.code).toBe('E0308')
    expect(err.friendly).toContain('i32')
  })

  it('misturar i32 e f64 numa conta → E0308', () => {
    const err = errorOf('let x = 2 + 2.0;')
    expect(err.code).toBe('E0308')
  })

  it('função desconhecida → E0425', () => {
    const err = errorOf('voar(1);')
    expect(err.code).toBe('E0425')
  })

  it('número errado de argumentos → E0061', () => {
    const err = errorOf('mover_direita(1, 2);')
    expect(err.code).toBe('E0061')
    expect(err.friendly).toContain('1 argumento')
  })

  it('função fora do allowlist do nível → E0901', () => {
    const err = errorOf('pular(1);', ['mover_direita'])
    expect(err.code).toBe('E0901')
  })

  it('anotação de tipo incompatível → E0308', () => {
    const err = errorOf('let x: i32 = 2.5;')
    expect(err.code).toBe('E0308')
  })

  it('expressão solta que não é chamada → E0003', () => {
    const err = errorOf('let x = 1; x;')
    expect(err.code).toBe('E0003')
  })

  it('conta com bool → E0308', () => {
    const err = errorOf('let x = true + 1;')
    expect(err.code).toBe('E0308')
  })

  it('pular() sem argumento é válido (default)', () => {
    const res = execute('pular();', { allowedFunctions: ALL })
    expect(res.ok).toBe(true)
  })
})
