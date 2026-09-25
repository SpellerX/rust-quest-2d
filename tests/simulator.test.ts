import { describe, expect, it } from 'vitest'
import { simulate } from '../shared/game/simulator'
import type { GameCommand } from '../shared/types'

const SPAN = { line: 1, col: 1, start: 0, end: 0 }
const move = (steps: number, direction: 'right' | 'left' = 'right'): GameCommand => ({
  type: 'move',
  direction,
  steps,
  src: SPAN,
})
const jump = (force: number): GameCommand => ({ type: 'jump', force, src: SPAN })
const wait = (ms: number): GameCommand => ({ type: 'wait', durationMs: ms, src: SPAN })

const REACH = { type: 'reach_goal' } as const
const REACH_ALL = { type: 'reach_goal_all_coins' } as const

// Mapas: linha do caminho em cima, chão embaixo (pode haver mais linhas de céu).
const FLAT = ['....', 'P..G', '####'] // P0, G3
const PIT2 = ['....', 'P  G', '#  #'] // buraco x1–x2 (largura 2), G x3

describe('simulate — básico', () => {
  it('reta até o objetivo → win com finalX/finalY', () => {
    const out = simulate(FLAT, [move(3)], REACH)
    expect(out.result).toBe('win')
    expect(out.finalX).toBe(3)
    expect(out.finalY).toBe(1)
  })

  it('sem chegar ao objetivo → incomplete', () => {
    const out = simulate(FLAT, [move(1)], REACH)
    expect(out.result).toBe('incomplete')
  })

  it('esperar não altera estado e não tem células', () => {
    const out = simulate(FLAT, [wait(500), move(3)], REACH)
    expect(out.result).toBe('win')
    expect(out.trace[0]).toEqual([])
  })

  it('parede bloqueia o resto do movimento', () => {
    const out = simulate(['P#.', '###'], [move(2)], REACH)
    expect(out.result).toBe('incomplete')
    expect(out.finalX).toBe(0)
  })

  it('mover para a esquerda até o objetivo', () => {
    const out = simulate(['....', 'G.P ', '####'], [move(2, 'left')], REACH)
    expect(out.result).toBe('win')
    expect(out.finalX).toBe(0)
  })

  it('NPC V não bloqueia nem mata', () => {
    const out = simulate(['.....', 'PV.G', '#####'], [move(3)], REACH)
    expect(out.result).toBe('win')
  })
})

describe('simulate — arco do pulo', () => {
  // Alturas do arco: h(k)=min(k, f−k). f=4 → 1,2,1,0.
  it('f=4 sobe e desce em parábola (trace.y = 1,0,1,2… na casa certa)', () => {
    const map = ['......', '......', 'P    G', '#    #'] // caminho y=2, buraco x1–x4
    const out = simulate(map, [jump(4), move(5)], REACH)
    expect(out.result).toBe('win')
    const ys = out.trace[1]!.map(c => c.y)
    expect(ys).toEqual([1, 0, 1, 2, 2]) // pico 1 acima do caminho (y=2 → pico y=0)
    expect(out.trace[1]![0]!.k).toBe('jump')
  })

  it('buraco de 2 com força 2 → cruza (arco passa por cima)', () => {
    const out = simulate(PIT2, [jump(2), move(3)], REACH)
    expect(out.result).toBe('win')
  })

  it('buraco de 2 com força 1 → cai e morre no fundo', () => {
    const out = simulate(PIT2, [jump(1), move(3)], REACH)
    expect(out.result).toBe('death')
    expect(out.cause).toBe('pit')
    expect(out.deathStep).toBe(1)
  })

  it('andar sem pular para dentro do buraco → queda e morte', () => {
    const out = simulate(PIT2, [move(3)], REACH)
    expect(out.result).toBe('death')
    expect(out.cause).toBe('pit')
    expect(out.finalX).toBe(1) // caiu na primeira célula do vão
  })

  it('pular longe da borda gasta o ar antes do vão → morre', () => {
    // P0; firme x1–x2; vão x3–x4; G x5. Pulo em x1 (2 casas antes da borda):
    // o arco termina antes das duas células do vão.
    const map = ['.....', 'P..  G', '#..  #']
    const out = simulate(map, [move(1), jump(2), move(5)], REACH)
    expect(out.result).toBe('death')
    expect(out.cause).toBe('pit')
  })

  it('programa termina no ar sobre o vão → queda automática e morte', () => {
    const out = simulate(PIT2, [jump(2), move(1)], REACH)
    expect(out.result).toBe('death')
    expect(out.cause).toBe('pit')
    expect(out.deathStep).toBe(1)
  })
})

describe('simulate — verticalidade (subir/descer)', () => {
  // degrau: bloco '#' na linha do caminho na coluna vizinha
  const STEP = ['....', '....', 'P.#.', '####']

  it('pular(2) + 1 passo sobe 1 degrau e pousa em cima', () => {
    const out = simulate(STEP, [move(1), jump(2), move(1)], REACH)
    expect(out.result).toBe('incomplete')
    expect(out.finalX).toBe(2)
    expect(out.finalY).toBe(1) // um andar acima
    expect(out.trace[2]!.some(c => c.k === 'jump')).toBe(true)
  })

  it('pular(1) contra o degrau → bloqueado, não sobe', () => {
    const out = simulate(STEP, [move(1), jump(1), move(1)], REACH)
    expect(out.finalX).toBe(1)
    expect(out.finalY).toBe(2)
  })

  it('G no alto: subir e pousar no objetivo → win', () => {
    const map = ['....', '..G.', 'P.#.', '####']
    const out = simulate(map, [move(1), jump(2), move(1)], REACH)
    expect(out.result).toBe('win')
    expect(out.finalY).toBe(1)
  })

  it('andar para fora da plataforma → cai até o piso inferior e CONTINUA andando', () => {
    const map = ['....', 'P...', '##..', '....', '####']
    const out = simulate(map, [move(3)], REACH)
    expect(out.result).toBe('incomplete')
    expect(out.finalX).toBe(3)
    expect(out.finalY).toBe(3) // piso de baixo
    const kinds = out.trace[0]!.map(c => c.k)
    expect(kinds).toContain('fall')
    expect(kinds[kinds.length - 1]).toBe('walk') // continuou andando após pousar
  })

  it('queda até o fundo do mapa → death(pit) com células de queda no trace', () => {
    const map = ['...', 'P..', '##.', '...'] // sem piso inferior
    const out = simulate(map, [move(2)], REACH)
    expect(out.result).toBe('death')
    expect(out.cause).toBe('pit')
    expect(out.deathStep).toBe(0)
    expect(out.trace[0]!.filter(c => c.k === 'fall').length).toBeGreaterThan(0)
  })
})

describe('simulate — espinhos', () => {
  it('andar no chão para o espinho → death(spike)', () => {
    const out = simulate(['....', 'P^G', '###'], [move(3)], REACH)
    expect(out.result).toBe('death')
    expect(out.cause).toBe('spike')
    expect(out.finalX).toBe(1)
  })

  it('espinho sobrevoado no arco → sobrevive e vence', () => {
    const out = simulate(['.....', 'P.^G.', '#####'], [move(1), jump(2), move(2)], REACH)
    expect(out.result).toBe('win')
  })

  it('pousar em cima do espinho → death(spike)', () => {
    // espinho em x2; arco desce sobre ele na casa k=2
    const out = simulate(['.....', 'P.^G.', '#####'], [jump(2), move(2)], REACH)
    expect(out.result).toBe('death')
    expect(out.cause).toBe('spike')
    expect(out.deathStep).toBe(1)
  })
})

describe('simulate — moedas e objetivo', () => {
  it('moeda coletada ao passar (multi-linha ok)', () => {
    const out = simulate(['.....', 'P.o.G', '#####'], [move(4)], REACH)
    expect(out.result).toBe('win')
    expect(out.coinsCollected).toBe(1)
    expect(out.coinsTotal).toBe(1)
  })

  it('all_coins: chegar ao G sem a moeda → incomplete; volta com ela → win', () => {
    const map = ['.....', 'P.G.o', '#####']
    expect(simulate(map, [move(2)], REACH_ALL).result).toBe('incomplete')
    const out = simulate(map, [move(4), move(2, 'left')], REACH_ALL)
    expect(out.result).toBe('win')
    expect(out.coinsCollected).toBe(1)
  })

  it('trace: cada comando tem sua lista e kinds corretos', () => {
    const out = simulate(FLAT, [move(2), jump(1), move(1)], REACH)
    expect(out.trace).toHaveLength(3)
    expect(out.trace[0]!.every(c => c.k === 'walk')).toBe(true)
    expect(out.trace[1]).toEqual([]) // pulo não anda
    expect(out.trace[2]![0]!.k).toBe('jump')
  })
})
