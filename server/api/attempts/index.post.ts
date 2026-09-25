import { execute } from '#shared/interpreter'
import { simulate } from '#shared/game/simulator'
import { getLevel, unlockedLevelIds } from '#shared/levels'
import { connectDB } from '../../utils/db'
import { Attempt } from '../../models/Attempt'
import { Progress } from '../../models/Progress'
import { User } from '../../models/User'
import { starsForHints, xpForStars } from '../../utils/scoring'

const MAX_CODE_LENGTH = 5000

/**
 * O servidor é a autoridade: recebe o CÓDIGO do jogador (nunca comandos
 * prontos), re-executa no interpretador compartilhado, re-simula o mapa e
 * só então grava progresso.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ levelId?: unknown; code?: unknown; hintsUsed?: unknown }>(event)
  const levelId = String(body?.levelId ?? '')
  const code = String(body?.code ?? '')
  const hintsUsed = Math.min(10, Math.max(0, Math.trunc(Number(body?.hintsUsed) || 0)))

  if (code.length > MAX_CODE_LENGTH) {
    throw createError({ statusCode: 400, message: 'Código longo demais.' })
  }

  const level = getLevel(levelId)
  if (!level) {
    throw createError({ statusCode: 404, message: 'Nível não encontrado.' })
  }

  await connectDB()
  const userId = event.context.userId as string

  // 1) Interpretar + checar
  const run = execute(code, { allowedFunctions: level.allowedFunctions })
  if (!run.ok) {
    await Attempt.create({
      userId,
      levelId,
      code,
      success: false,
      stars: null,
      errorCodes: [run.error!.code],
      outcomeResult: 'error',
      hintsUsed,
    })
    return { success: false, error: run.error }
  }

  // 2) Simular o mapa — fonte da verdade
  const outcome = simulate(level.map, run.commands, level.success)
  if (outcome.result !== 'win') {
    await Attempt.create({
      userId,
      levelId,
      code,
      success: false,
      stars: null,
      errorCodes: [],
      outcomeResult: outcome.result,
      hintsUsed,
    })
    return { success: false, outcome }
  }

  // 3) Vitória: estrelas + progresso
  const stars = starsForHints(hintsUsed)
  const user = await User.findById(userId)
  if (!user) {
    throw createError({ statusCode: 404, message: 'Usuário não encontrado.' })
  }

  const existing = await Progress.findOne({ userId, levelId })
  let xpAwarded = 0

  if (!existing) {
    await Progress.create({ userId, levelId, stars, attemptsCount: 1, hintsUsedBest: hintsUsed })
    xpAwarded = xpForStars(stars)
    user.xp += xpAwarded
  }
  else {
    existing.stars = Math.max(existing.stars, stars)
    existing.attemptsCount += 1
    existing.hintsUsedBest = Math.max(existing.hintsUsedBest, hintsUsed)
    existing.completedAt = new Date()
    await existing.save()
  }

  const progressDocs = await Progress.find({ userId })
  user.totalStars = progressDocs.reduce((acc, p) => acc + p.stars, 0)
  await user.save()

  await Attempt.create({
    userId,
    levelId,
    code,
    success: true,
    stars,
    errorCodes: [],
    outcomeResult: 'win',
    hintsUsed,
  })

  return {
    success: true,
    stars,
    xpAwarded,
    xp: user.xp,
    totalStars: user.totalStars,
    unlockedLevelIds: unlockedLevelIds(progressDocs.map(p => p.levelId)),
  }
})
