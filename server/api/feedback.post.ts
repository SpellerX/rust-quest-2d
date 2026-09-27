import { connectDB } from '../utils/db'
import { validateFeedback } from '../utils/feedback'
import { Feedback } from '../models/Feedback'
import { Progress } from '../models/Progress'

/**
 * Recebe a avaliação do desafio (nota 1–5, gostou, comentário).
 * Rota protegida pelo middleware JWT: só usuários logados avaliam.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<unknown>(event)
  const result = validateFeedback(body)
  if (!result.ok) {
    throw createError({ statusCode: result.status, message: result.message })
  }
  const { levelId, rating, liked, comment } = result.value

  await connectDB()
  const userId = event.context.userId as string

  // O Progresso só nasce em vitória — impede avaliar nível nunca concluído.
  const completed = await Progress.exists({ userId, levelId })
  if (!completed) {
    throw createError({ statusCode: 409, message: 'Conclua o nível antes de avaliar.' })
  }

  await Feedback.findOneAndUpdate(
    { levelId, userId },
    { $set: { levelId, userId, rating, liked, comment } },
    { upsert: true },
  )

  return { ok: true }
})
