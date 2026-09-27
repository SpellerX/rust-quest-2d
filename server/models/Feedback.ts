import mongoose from 'mongoose'

export interface FeedbackDoc {
  userId: mongoose.Types.ObjectId
  levelId: string
  /** Nota do desafio, 1 a 5 — não confundir com as estrelas ganhas (máx. 3). */
  rating: number
  liked: boolean | null
  comment: string
  createdAt: Date
  updatedAt: Date
}

const feedbackSchema = new mongoose.Schema<FeedbackDoc>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    levelId: { type: String, required: true, maxlength: 40 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    liked: { type: Boolean, default: null },
    comment: { type: String, default: '', maxlength: 500, trim: true },
  },
  { timestamps: true },
)

/** Um feedback por usuário por nível — reavaliar atualiza a mesma linha. */
feedbackSchema.index({ levelId: 1, userId: 1 }, { unique: true })
feedbackSchema.index({ createdAt: -1 })
feedbackSchema.index({ levelId: 1 })

export const Feedback = (mongoose.models.Feedback as mongoose.Model<FeedbackDoc>)
  ?? mongoose.model<FeedbackDoc>('Feedback', feedbackSchema)
