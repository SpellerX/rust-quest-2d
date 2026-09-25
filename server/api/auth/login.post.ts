import bcrypt from 'bcryptjs'
import { connectDB } from '../../utils/db'
import { signToken } from '../../utils/jwt'
import { User } from '../../models/User'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: unknown; password?: unknown }>(event)
  const email = String(body?.email ?? '').trim().toLowerCase()
  const password = String(body?.password ?? '')

  if (!email || !password) {
    throw createError({ statusCode: 400, message: 'Informe e-mail e senha.' })
  }

  await connectDB()

  const user = await User.findOne({ email })
  const ok = user && (await bcrypt.compare(password, user.passwordHash))
  if (!ok) {
    throw createError({ statusCode: 401, message: 'E-mail ou senha incorretos.' })
  }

  const token = signToken({ sub: user._id.toString(), username: user.username })
  return {
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      xp: user.xp,
      totalStars: user.totalStars,
    },
  }
})
