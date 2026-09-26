import { User } from '../../models/User'
import { connectDB } from '../../utils/db'

/**
 * Contador público de alunos cadastrados (apenas agregado — nenhum dado
 * individual). `users: null` quando o banco não está acessível, para o
 * front simplesmente esconder o contador.
 */
export default defineEventHandler(async (): Promise<{ users: number | null }> => {
  try {
    await connectDB()
    const users = await User.countDocuments()
    return { users }
  }
  catch {
    return { users: null }
  }
})
