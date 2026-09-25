import { describe, expect, it } from 'vitest'
import { execute } from '../shared/interpreter'
import { simulate } from '../shared/game/simulator'
import { LEVELS } from '../shared/levels'

const VALID_CHARS = new Set(['.', '#', '^', 'o', 'G', 'P', 'V', 'E', ' '])

/**
 * "CI do designer": nenhum nível pode ficar impossível, com mapa quebrado
 * ou voltar a ser fill-in-the-blank. Para cada nível:
 *  - mapa vertical válido (linhas de mesma largura, chars ok, 1 P, 1 G,
 *    chão sob o P, ≥ 8 linhas);
 *  - starter só-comentários (0 comandos executáveis) — exceto w1-l3, que
 *    deve falhar exatamente com E0384 (a lição do nível);
 *  - solution escrita do zero vence o mapa sob as regras do simulador.
 */
describe('níveis', () => {
  it('existem 10 níveis (mundos 1 e 2) com ids únicos', () => {
    expect(LEVELS).toHaveLength(10)
    expect(new Set(LEVELS.map(l => l.id)).size).toBe(10)
  })

  for (const level of LEVELS) {
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
        if (level.id === 'w1-l3') {
          // Código propositalmente quebrado: a lição é o E0384.
          expect(run.ok).toBe(false)
          expect(run.error?.code).toBe('E0384')
        }
        else {
          expect(run.ok, run.error?.friendly ?? '').toBe(true)
          expect(run.commands, 'starter não pode ter código executável').toHaveLength(0)
        }
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
      })
    })
  }
})
