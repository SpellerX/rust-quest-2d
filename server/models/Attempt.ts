import mongoose from 'mongoose'

export interface AttemptDoc {
  userId: mongoose.Types.ObjectId
  levelId: string
  code: string
  success: boolean
  stars: number | null
  errorCodes: string[]
  outcomeResult: 'win' | 'death' | 'incomplete' | 'error'
  hintsUsed: number
  createdAt: Date
}

const attemptSchema = new mongoose.Schema<AttemptDoc>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    levelId: { type: String, required: true },
    code: { type: String, required: true, maxlength: 5000 },
    success: { type: Boolean, required: true },
    stars: { type: Number, default: null },
    errorCodes: { type: [String], default: [] },
    outcomeResult: {
      type: String,
      enum: ['win', 'death', 'incomplete', 'error'],
      required: true,
    },
    hintsUsed: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
)

attemptSchema.index({ userId: 1, createdAt: -1 })

export const Attempt = (mongoose.models.Attempt as mongoose.Model<AttemptDoc>)
  ?? mongoose.model<AttemptDoc>('Attempt', attemptSchema)
