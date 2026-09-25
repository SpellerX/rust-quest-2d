import jwt from 'jsonwebtoken'

export interface TokenPayload {
  sub: string
  username: string
}

function getSecret(): string {
  const secret = useRuntimeConfig().jwtSecret
  if (!secret) {
    throw createError({
      statusCode: 500,
      message: 'JWT não configurado: preencha NUXT_JWT_SECRET no .env.',
    })
  }
  return secret
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: '7d' })
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, getSecret()) as TokenPayload
}
