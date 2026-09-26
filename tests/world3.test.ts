import { describe, expect, it } from 'vitest'
import { execute } from '../shared/interpreter'
import { simulate } from '../shared/game/simulator'
import { WORLD3_CONCEPTS, WORLD3_LEVELS } from '../shared/levels/world3'

const VALID_CHARS = new Set(['.', '#', '^', 'o', 'G', 'P', 'V', 'E', ' '])
const EXPECTED_IDS = ['w3-l1', 'w3-l2', 'w3-l3', 'w3-l4', 'w3-l5']

/**
 * "CI do designer" do Mundo 3 (Floresta das Decisões): nenhum nível pode
 * ficar impossível, com mapa quebrado ou voltar a ser fill-in-the-blank.
 * Para cada nível:
 *  - mapa vertical válido (linhas de mesma largura, chars ok, 1 P, 1 G,
 *    chão sob o P, ≥ 8 linhas);
 *  - starter só-comentários (0 comandos executáveis);
 *  - solution escrita do zero vence o mapa sob as regras do simulador;
 *  - conteúdo pedagógico completo (concept/learnAfter/hints).
 */
describe('níveis do Mundo 3', () => {
  it('existem 5 níveis com ids únicos e na ordem', () => {
    expect(WORLD3_LEVELS).toHaveLength(5)
    expect(WORLD3_LEVELS.map(l => l.id)).toEqual(EXPECTED_IDS)
    expect(new Set(WORLD3_LEVELS.map(l => l.id)).size).toBe(5)
    expect(WORLD3_LEVELS.every(l => l.world === 3)).toBe(true)
    expect(WORLD3_LEVELS.map(l => l.order)).toEqual([1, 2, 3, 4, 5])
  })

  for (const level of WORLD3_LEVELS) {
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

      it('allowedFunctions dos mundos 3-4 (sem falar)', () => {
        expect(level.allowedFunctions).toEqual(['mover_direita', 'mover_esquerda', 'pular', 'esperar'])
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
        expect(level.hints[0].length).toBeGreaterThan(10)
        expect(level.hints[1].length).toBeGreaterThan(10)
        expect(level.hints).toHaveLength(2)
        expect(level.cheatSheet.length).toBeGreaterThan(0)
      })
    })
  }

  it('WORLD3_CONCEPTS cobre todos os níveis com rótulos curtos', () => {
    expect(Object.keys(WORLD3_CONCEPTS)).toHaveLength(EXPECTED_IDS.length)
    for (const id of EXPECTED_IDS) {
      const label = WORLD3_CONCEPTS[id]
      expect(label, `falta conceito para ${id}`).toBeTruthy()
      expect(label!.length, `rótulo longo demais para ${id}`).toBeLessThanOrEqual(25)
    }
  })
})
