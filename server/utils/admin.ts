import { connectDB } from './db'
import { User } from '../models/User'

function adminEmails(): string[] {
  const raw = useRuntimeConfig().adminEmails ?? ''
  return raw
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdmin(user: { email: string }): boolean {
  return adminEmails().includes(user.email.toLowerCase())
}

/** 401 sem sessão, 403 para quem não está em NUXT_ADMIN_EMAILS. */
export async function requireAdmin(userId: string | undefined): Promise<void> {
  if (!userId) {
    throw createError({ statusCode: 401, message: 'Sessão necessária: faça login para continuar.' })
  }
  await connectDB()
  const user = await User.findById(userId)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Sessão inválida: entre novamente.' })
  }
  if (!isAdmin(user)) {
    throw createError({ statusCode: 403, message: 'Acesso restrito ao administrador.' })
  }
}
