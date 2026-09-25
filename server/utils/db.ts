import mongoose from 'mongoose'

interface Cache {
  conn: Promise<typeof mongoose> | null
}

// Cache em globalThis: essencial no dev, onde o HMR do Nitro recria rotas
// e novas conexões estourariam o pool do Atlas.
const g = globalThis as unknown as { _mongooseCache?: Cache }

/**
 * Conecta ao MongoDB (Atlas) com cache. Falha rápido (5s) em vez de
 * pendurar a requisição quando a URI está ausente ou inacessível.
 */
export async function connectDB(): Promise<typeof mongoose> {
  const uri = useRuntimeConfig().mongodbUri
  if (!uri) {
    throw createError({
      statusCode: 503,
      message: 'Banco não configurado: preencha NUXT_MONGODB_URI no .env (connection string do Atlas).',
    })
  }
  if (!g._mongooseCache) g._mongooseCache = { conn: null }
  if (!g._mongooseCache.conn) {
    g._mongooseCache.conn = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
    })
  }
  return g._mongooseCache.conn
}
