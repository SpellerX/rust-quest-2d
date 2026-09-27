import { connectDB } from '../../utils/db'
import { isAdmin } from '../../utils/admin'
import { User } from '../../models/User'

/** Usado pelo middleware de rota /admin para decidir entre entrar e redirecionar. */
export default defineEventHandler(async (event) => {
  await connectDB()
  const user = await User.findById(event.context.userId as string)
  return { admin: !!user && isAdmin(user) }
})
