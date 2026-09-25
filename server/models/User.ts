import mongoose from 'mongoose'

export interface UserDoc {
  email: string
  username: string
  passwordHash: string
  xp: number
  totalStars: number
  createdAt: Date
  updatedAt: Date
}

const userSchema = new mongoose.Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, trim: true, minlength: 3, maxlength: 20 },
    passwordHash: { type: String, required: true },
    xp: { type: Number, default: 0 },
    totalStars: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export const User = (mongoose.models.User as mongoose.Model<UserDoc>)
  ?? mongoose.model<UserDoc>('User', userSchema)
