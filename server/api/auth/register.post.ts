import bcrypt from 'bcryptjs'
import { connectDB } from '../../utils/db'
import { signToken } from '../../utils/jwt'
import { User } from '../../models/User'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: unknown; username?: unknown; password?: unknown }>(event)
  const email = String(body?.email ?? '').trim().toLowerCase()
  const username = String(body?.username ?? '').trim()
  const password = String(body?.password ?? '')

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, message: 'E-mail inválido.' })
  }
  if (username.length < 3 || username.length > 20) {
    throw createError({ statusCode: 400, message: 'Nome de jogador precisa ter 3 a 20 caracteres.' })
  }
  if (password.length < 6) {
    throw createError({ statusCode: 400, message: 'Senha precisa de pelo menos 6 caracteres.' })
  }

  await connectDB()

  const existing = await User.findOne({ email })
  if (existing) {
    throw createError({ statusCode: 409, message: 'Este e-mail já tem conta.' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ email, username, passwordHash })

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
