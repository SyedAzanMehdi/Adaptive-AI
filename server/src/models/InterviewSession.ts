import mongoose from "mongoose";

export interface IInterviewSession extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: string;
  source: "ai" | "mock";
  script: Record<string, unknown>;
  /** Null until the student self-scores the rehearsal. */
  scorecard: Record<string, unknown> | null;
  /** Denormalised from the scorecard so the trend query stays a cheap sort. */
  overall: number | null;
  createdAt: Date;
  scoredAt: Date | null;
}

const interviewSessionSchema = new mongoose.Schema<IInterviewSession>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role: { type: String, required: true },
    source: { type: String, enum: ["ai", "mock"], default: "mock" },
    script: { type: Object, required: true },
    scorecard: { type: Object, default: null },
    overall: { type: Number, default: null },
    scoredAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

// Trend lookup: most recent scored session for one user.
interviewSessionSchema.index({ userId: 1, scoredAt: -1 });

export const InterviewSession = mongoose.model<IInterviewSession>(
  "InterviewSession",
  interviewSessionSchema
);
