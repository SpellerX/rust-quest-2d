import { connectDB } from '../../utils/db'
import { requireAdmin } from '../../utils/admin'
import { round1, summarizeFeedback } from '../../utils/feedback'
import { Feedback } from '../../models/Feedback'
import { User } from '../../models/User'

const RECENT_LIMIT = 30

/**
 * Painel do administrador: contagem de usuários, agregados de avaliação
 * e os comentários mais recentes. Restrito a NUXT_ADMIN_EMAILS.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event.context.userId as string | undefined)
  await connectDB()

  const totalUsers = await User.countDocuments()

  const rows = await Feedback
    .find({}, { rating: 1, liked: 1, levelId: 1 })
    .lean()
  const summary = summarizeFeedback(rows)

  const perLevel = new Map<string, { count: number; sum: number }>()
  for (const row of rows) {
    const acc = perLevel.get(row.levelId) ?? { count: 0, sum: 0 }
    acc.count += 1
    acc.sum += row.rating
    perLevel.set(row.levelId, acc)
  }
  const byLevel = [...perLevel.entries()]
    .map(([levelId, acc]) => ({ levelId, count: acc.count, avg: round1(acc.sum / acc.count) }))
    .sort((a, b) => b.count - a.count)

  const recent = await Feedback.find().sort({ createdAt: -1 }).limit(RECENT_LIMIT).lean()
  const authorIds = [...new Set(recent.map(row => String(row.userId)))]
  const authors = await User.find({ _id: { $in: authorIds } }, 'username').lean()
  const nameById = new Map(authors.map(author => [String(author._id), author.username]))

  return {
    totals: {
      users: totalUsers,
      feedbacks: rows.length,
      levels: perLevel.size,
      avgRating: summary.avg,
      likedPct: summary.likedPct,
    },
    distribution: summary.distribution,
    byLevel,
    recent: recent.map(row => ({
      levelId: row.levelId,
      rating: row.rating,
      liked: row.liked,
      comment: row.comment,
      username: nameById.get(String(row.userId)) ?? 'conta removida',
      createdAt: row.createdAt.toISOString(),
    })),
  }
})
