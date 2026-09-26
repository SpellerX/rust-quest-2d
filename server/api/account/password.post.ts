import bcrypt from 'bcryptjs'
import { connectDB } from '../../utils/db'
import { User } from '../../models/User'

/**
 * Troca a senha do usuário autenticado (JWT via middleware auth.jwt).
 * Fora de /api/auth/ de propósito: o middleware exige Authorization.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ currentPassword?: unknown; newPassword?: unknown }>(event)
  const currentPassword = String(body?.currentPassword ?? '')
  const newPassword = String(body?.newPassword ?? '')

  if (!currentPassword || !newPassword) {
    throw createError({ statusCode: 400, message: 'Informe a senha atual e a nova senha.' })
  }
  if (newPassword.length < 6) {
    throw createError({ statusCode: 400, message: 'Senha precisa de pelo menos 6 caracteres.' })
  }
  if (newPassword === currentPassword) {
    throw createError({ statusCode: 400, message: 'A nova senha é igual à atual.' })
  }

  await connectDB()

  const userId = event.context.userId as string
  const user = await User.findById(userId)
  if (!user) {
    throw createError({ statusCode: 404, message: 'Usuário não encontrado.' })
  }

  const ok = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!ok) {
    throw createError({ statusCode: 401, message: 'Senha atual incorreta.' })
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10)
  await user.save()

  return { ok: true }
})
