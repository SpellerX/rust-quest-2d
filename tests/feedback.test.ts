import { describe, expect, it } from 'vitest'
import {
  MAX_COMMENT_LENGTH,
  summarizeFeedback,
  validateFeedback,
} from '../server/utils/feedback'

const VALID = { levelId: 'w1-l1', rating: 5, liked: true, comment: 'Gostei do ritmo' }

function expectFail(input: unknown, status: number) {
  const result = validateFeedback(input)
  expect(result.ok).toBe(false)
  if (!result.ok) {
    expect(result.status).toBe(status)
    expect(result.message).toBeTruthy()
  }
  return result
}

describe('validateFeedback', () => {
  it('aceita uma avaliação válida e normaliza comentário e liked', () => {
    const result = validateFeedback({ ...VALID, comment: '  bom nível  ' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value).toEqual({
        levelId: 'w1-l1',
        rating: 5,
        liked: true,
        comment: 'bom nível',
      })
    }
  })

  it('aceita sem comentário e sem resposta de "gostou"', () => {
    const result = validateFeedback({ levelId: 'w1-l2', rating: 3 })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.comment).toBe('')
      expect(result.value.liked).toBeNull()
    }
  })

  it('aceita comentário com exatamente o limite', () => {
    const comment = 'x'.repeat(MAX_COMMENT_LENGTH)
    const result = validateFeedback({ ...VALID, comment })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value.comment).toHaveLength(MAX_COMMENT_LENGTH)
  })

  it('rejeita nota ausente, fora do intervalo ou fracionada', () => {
    expectFail({ levelId: 'w1-l1' }, 400)
    expectFail({ ...VALID, rating: 0 }, 400)
    expectFail({ ...VALID, rating: 6 }, 400)
    expectFail({ ...VALID, rating: 3.5 }, 400)
    expectFail({ ...VALID, rating: '4' }, 400)
    expectFail({ ...VALID, rating: null }, 400)
  })

  it('rejeita comentário acima do limite', () => {
    expectFail({ ...VALID, comment: 'x'.repeat(MAX_COMMENT_LENGTH + 1) }, 400)
  })

  it('rejeita nível vazio ou id longo demais', () => {
    expectFail({ ...VALID, levelId: '' }, 400)
    expectFail({ ...VALID, levelId: 'x'.repeat(41) }, 400)
    expectFail({ levelId: 'não-existe', rating: 5 }, 404)
  })

  it('rejeita body ausente ou não-objeto', () => {
    expectFail(undefined, 400)
    expectFail(null, 400)
    expectFail('w1-l1', 400)
  })
})

describe('summarizeFeedback', () => {
  it('calcula média, distribuição e % de "gostou"', () => {
    const summary = summarizeFeedback([
      { rating: 5, liked: true },
      { rating: 4, liked: true },
      { rating: 5, liked: false },
      { rating: 2, liked: false },
      { rating: 3, liked: null },
    ])

    expect(summary.avg).toBe(3.8)
    expect(summary.distribution).toEqual({ '1': 0, '2': 1, '3': 1, '4': 1, '5': 2 })
    expect(summary.likedPct).toBe(50)
  })

  it('retorna média 0 e % nulo sem respostas', () => {
    const summary = summarizeFeedback([])
    expect(summary.avg).toBe(0)
    expect(summary.distribution).toEqual({ '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 })
    expect(summary.likedPct).toBeNull()
  })

  it('ignora "gostou" não respondido no percentual', () => {
    const summary = summarizeFeedback([
      { rating: 5, liked: true },
      { rating: 5, liked: null },
      { rating: 5, liked: null },
    ])
    expect(summary.avg).toBe(5)
    expect(summary.likedPct).toBe(100)
  })
})
