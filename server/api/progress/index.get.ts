import { unlockedLevelIds } from '#shared/levels'
import { connectDB } from '../../utils/db'
import { Progress } from '../../models/Progress'
import { User } from '../../models/User'

export default defineEventHandler(async (event) => {
  await connectDB()
  const userId = event.context.userId as string

  const user = await User.findById(userId)
  if (!user) {
    throw createError({ statusCode: 404, message: 'Usuário não encontrado.' })
  }

  const docs = await Progress.find({ userId }).sort({ completedAt: 1 })
  const progress = docs.map(p => ({
    levelId: p.levelId,
    stars: p.stars,
    attemptsCount: p.attemptsCount,
    completedAt: p.completedAt.toISOString(),
  }))

  return {
    xp: user.xp,
    totalStars: progress.reduce((acc, p) => acc + p.stars, 0),
    progress,
    unlockedLevelIds: unlockedLevelIds(progress.map(p => p.levelId)),
  }
})
