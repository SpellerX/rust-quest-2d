import { getLevel } from '#shared/levels'

export interface FeedbackInput {
  levelId: string
  rating: number
  liked: boolean | null
  comment: string
}

export type ValidationResult =
  | { ok: true; value: FeedbackInput }
  | { ok: false; status: number; message: string }

export interface FeedbackRow {
  rating: number
  liked: boolean | null
}

export interface FeedbackSummary {
  avg: number
  /** Chaves '1'..'5' com a contagem de cada nota. */
  distribution: Record<string, number>
  /** % de "gostou" entre quem respondeu; null se ninguém respondeu. */
  likedPct: number | null
}

export const MAX_COMMENT_LENGTH = 500
export const MAX_LEVEL_ID_LENGTH = 40

export function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function fail(status: number, message: string): ValidationResult {
  return { ok: false, status, message }
}

/** Valida o body do POST /api/feedback sem tocar no banco (testável puro). */
export function validateFeedback(input: unknown): ValidationResult {
  const body = (input ?? {}) as {
    levelId?: unknown
    rating?: unknown
    liked?: unknown
    comment?: unknown
  }

  const levelId = String(body.levelId ?? '').trim()
  if (!levelId || levelId.length > MAX_LEVEL_ID_LENGTH) {
    return fail(400, 'Informe o nível avaliado.')
  }
  if (!getLevel(levelId)) {
    return fail(404, 'Nível não encontrado.')
  }

  const rating = body.rating
  if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return fail(400, 'Nota inválida: escolha de 1 a 5 estrelas.')
  }

  const comment = String(body.comment ?? '').trim()
  if (comment.length > MAX_COMMENT_LENGTH) {
    return fail(400, `Comentário longo demais: máximo de ${MAX_COMMENT_LENGTH} caracteres.`)
  }

  const liked = typeof body.liked === 'boolean' ? body.liked : null

  return { ok: true, value: { levelId, rating, liked, comment } }
}

/** Agrega média, distribuição por nota e % de "gostou". */
export function summarizeFeedback(rows: readonly FeedbackRow[]): FeedbackSummary {
  const distribution: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
  let total = 0
  let likedYes = 0
  let likedAnswered = 0

  for (const row of rows) {
    distribution[String(row.rating)] = (distribution[String(row.rating)] ?? 0) + 1
    total += row.rating
    if (row.liked !== null) {
      likedAnswered++
      if (row.liked) likedYes++
    }
  }

  return {
    avg: rows.length ? round1(total / rows.length) : 0,
    distribution,
    likedPct: likedAnswered ? Math.round((likedYes / likedAnswered) * 100) : null,
  }
}
