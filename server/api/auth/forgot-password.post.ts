import bcrypt from 'bcryptjs'
import { connectDB } from '../../utils/db'
import { User } from '../../models/User'

/**
 * Recuperação de senha SEM e-mail: e-mail + código de recuperação
 * (entregue uma vez no cadastro) + nova senha. Rota pública (auth).
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: unknown; code?: unknown; newPassword?: unknown }>(event)
  const email = String(body?.email ?? '').trim().toLowerCase()
  const code = String(body?.code ?? '').trim().toUpperCase()
  const newPassword = String(body?.newPassword ?? '')

  if (!email || !code || !newPassword) {
    throw createError({ statusCode: 400, message: 'Informe e-mail, código de recuperação e nova senha.' })
  }
  if (newPassword.length < 6) {
    throw createError({ statusCode: 400, message: 'Senha precisa de pelo menos 6 caracteres.' })
  }

  await connectDB()

  const user = await User.findOne({ email })
  // Mensagem única: não revela se o e-mail existe ou qual campo errou.
  const invalid = createError({
    statusCode: 400,
    message: 'E-mail, código ou senha inválidos. Confira o código de recuperação do seu cadastro.',
  })
  if (!user?.recoveryCodeHash) throw invalid

  const ok = await bcrypt.compare(code, user.recoveryCodeHash)
  if (!ok) throw invalid

  user.passwordHash = await bcrypt.hash(newPassword, 10)
  await user.save()

  return { ok: true }
})
