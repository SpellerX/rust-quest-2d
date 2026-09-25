import mongoose from 'mongoose'

export interface ProgressDoc {
  userId: mongoose.Types.ObjectId
  levelId: string
  completed: boolean
  stars: number
  attemptsCount: number
  hintsUsedBest: number
  completedAt: Date
}

const progressSchema = new mongoose.Schema<ProgressDoc>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    levelId: { type: String, required: true },
    completed: { type: Boolean, default: true },
    stars: { type: Number, min: 1, max: 3, required: true },
    attemptsCount: { type: Number, default: 1 },
    hintsUsedBest: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
)

progressSchema.index({ userId: 1, levelId: 1 }, { unique: true })

export const Progress = (mongoose.models.Progress as mongoose.Model<ProgressDoc>)
  ?? mongoose.model<ProgressDoc>('Progress', progressSchema)
