import { describe, expect, it } from 'vitest'
import { execute } from '../shared/interpreter'
import { simulate } from '../shared/game/simulator'
import { WORLD5_CONCEPTS, WORLD5_LEVELS } from '../shared/levels/world5'

const VALID_CHARS = new Set(['.', '#', '^', 'o', 'G', 'P', 'V', 'E', ' '])

/**
 * "CI do designer" do Mundo 5 (Oficina das Funções): nenhum nível pode
 * ficar impossível, com mapa quebrado ou starter com código pronto.
 * Para cada nível:
 *  - mapa vertical válido (linhas de mesma largura, chars ok, 1 P, 1 G,
 *    chão sob o P, ≥ 8 linhas);
 *  - starter só-comentários (0 comandos executáveis);
 *  - solution escrita do zero vence o mapa sob as regras do simulador.
 */
describe('níveis do Mundo 5 — Oficina das Funções', () => {
  it('existem 5 níveis (w5-l1..w5-l5) com ids únicos e world 5', () => {
    expect(WORLD5_LEVELS).toHaveLength(5)
    expect(new Set(WORLD5_LEVELS.map(l => l.id)).size).toBe(5)
    expect(WORLD5_LEVELS.map(l => l.id)).toEqual(['w5-l1', 'w5-l2', 'w5-l3', 'w5-l4', 'w5-l5'])
    expect(WORLD5_LEVELS.every(l => l.world === 5)).toBe(true)
    expect(WORLD5_LEVELS.map(l => l.order)).toEqual([1, 2, 3, 4, 5])
  })

  it('WORLD5_CONCEPTS rotula todos os níveis com rótulos curtos', () => {
    expect(Object.keys(WORLD5_CONCEPTS)).toHaveLength(5)
    for (const level of WORLD5_LEVELS) {
      const label = WORLD5_CONCEPTS[level.id]
      expect(label, `falta conceito para ${level.id}`).toBeTruthy()
      expect(label!.length, `rótulo longo em ${level.id}`).toBeLessThanOrEqual(25)
    }
  })

  for (const level of WORLD5_LEVELS) {
    describe(`${level.id} — ${level.title}`, () => {
      it('mapa vertical válido', () => {
        const widths = new Set(level.map.map(r => r.length))
        expect(widths.size, `larguras diferentes: ${[...widths]}`).toBe(1)
        expect(level.map.length).toBeGreaterThanOrEqual(8)

        const flat = level.map.join('')
        expect((flat.match(/P/g) ?? [])).toHaveLength(1)
        expect((flat.match(/G/g) ?? [])).toHaveLength(1)
        for (const ch of flat) expect(VALID_CHARS.has(ch), `char inválido: ${ch}`).toBe(true)

        const startRow = level.map.findIndex(r => r.includes('P'))
        const startCol = level.map[startRow]!.indexOf('P')
        expect(level.map[startRow + 1]?.[startCol]).toBe('#')
      })

      it('starter exige que o jogador escreva (nada de fill-in)', () => {
        const run = execute(level.starterCode, { allowedFunctions: level.allowedFunctions })
        expect(run.ok, run.error?.friendly ?? '').toBe(true)
        expect(run.commands, 'starter não pode ter código executável').toHaveLength(0)
      })

      it('solution escrita do zero vence o mapa', () => {
        const run = execute(level.solution, { allowedFunctions: level.allowedFunctions })
        expect(run.ok, run.error?.friendly ?? '').toBe(true)

        const outcome = simulate(level.map, run.commands, level.success)
        expect(
          outcome.result,
          `morreu: ${outcome.cause} no passo ${outcome.deathStep} (final ${outcome.finalX},${outcome.finalY})`,
        ).toBe('win')
      })

      it('tem conteúdo pedagógico completo', () => {
        expect(level.concept.title.length).toBeGreaterThan(3)
        expect(level.concept.body.length).toBeGreaterThan(20)
        expect(level.concept.bullets.length).toBeGreaterThanOrEqual(2)
        expect(level.learnAfter.body.length).toBeGreaterThan(20)
        expect(level.learnAfter.bullets.length).toBeGreaterThanOrEqual(2)
        expect(level.hints[0].length).toBeGreaterThan(10)
        expect(level.hints[1].length).toBeGreaterThan(10)
        expect(level.cheatSheet.length).toBeGreaterThanOrEqual(1)
      })

      it('usa só os comandos liberados do Mundo 5', () => {
        expect(level.allowedFunctions).toEqual(['mover_direita', 'mover_esquerda', 'pular', 'esperar'])
      })
    })
  }
})
