import { verifyToken } from '../utils/jwt'

const PUBLIC_PREFIXES = ['/api/auth/', '/api/levels']

/**
 * Valida o header Authorization: Bearer <jwt> em todas as rotas /api
 * exceto auth e levels. Injeta event.context.userId nas protegidas.
 */
export default defineEventHandler((event) => {
  const path = event.path ?? ''
  if (!path.startsWith('/api/')) return
  if (PUBLIC_PREFIXES.some(p => path.startsWith(p))) return

  const header = getHeader(event, 'authorization')
  if (!header?.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      message: 'Sessão necessária: faça login para continuar.',
    })
  }

  try {
    const payload = verifyToken(header.slice(7))
    event.context.userId = payload.sub
    event.context.username = payload.username
  }
  catch {
    throw createError({
      statusCode: 401,
      message: 'Sessão expirada ou inválida: entre novamente.',
    })
  }
})
