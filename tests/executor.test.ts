import { describe, expect, it } from 'vitest'
import { execute } from '../shared/interpreter'

const ALL = ['mover_direita', 'mover_esquerda', 'pular', 'esperar']

function commandsOf(code: string) {
  const res = execute(code, { allowedFunctions: ALL })
  expect(res.ok, res.error?.friendly ?? '').toBe(true)
  return res.commands
}

describe('executor', () => {
  it('variável vira passos do movimento', () => {
    const commands = commandsOf('let passos = 3; mover_direita(passos);')
    expect(commands).toEqual([
      expect.objectContaining({ type: 'move', direction: 'right', steps: 3 }),
    ])
  })

  it('pular() usa força 1 por padrão', () => {
    const commands = commandsOf('pular();')
    expect(commands).toEqual([expect.objectContaining({ type: 'jump', force: 1 })])
  })

  it('pular(2 + 1) calcula a força', () => {
    const commands = commandsOf('pular(2 + 1);')
    expect(commands[0]).toMatchObject({ type: 'jump', force: 3 })
  })

  it('divisão inteira trunca (8 / 3 = 2)', () => {
    const commands = commandsOf('let x = 8 / 3; mover_direita(x);')
    expect(commands[0]).toMatchObject({ steps: 2 })
  })

  it('divisão por zero → E0201', () => {
    const res = execute('let x = 1 / 0; mover_direita(x);', { allowedFunctions: ALL })
    expect(res.ok).toBe(false)
    expect(res.error?.code).toBe('E0201')
    expect(res.error?.friendly).toContain('zero')
  })

  it('divisão decimal preserva casas (7.0 / 2.0 = 3.5 → esperar)', () => {
    const commands = commandsOf('esperar(7.0 / 2.0);')
    expect(commands[0]).toMatchObject({ type: 'wait', durationMs: 3500 })
  })

  it('escrever mais de 500 comandos → E0900', () => {
    const code = 'mover_direita(1);'.repeat(501)
    const res = execute(code, { allowedFunctions: ALL })
    expect(res.ok).toBe(false)
    expect(res.error?.code).toBe('E0900')
  })

  it('passos além do limite → E0900', () => {
    const res = execute('mover_direita(101);', { allowedFunctions: ALL })
    expect(res.ok).toBe(false)
    expect(res.error?.code).toBe('E0900')
  })

  it('movimento para a esquerda', () => {
    const commands = commandsOf('mover_esquerda(2);')
    expect(commands[0]).toMatchObject({ type: 'move', direction: 'left', steps: 2 })
  })

  it('comparação produz bool e pode ser guardada', () => {
    const commands = commandsOf('let b = 2 < 3; mover_direita(1);')
    expect(commands).toHaveLength(1)
  })

  it('comando com span aponta a linha original', () => {
    const commands = commandsOf('let x = 1;\nmover_direita(x);')
    expect(commands[0]!.src.line).toBe(2)
  })
})
