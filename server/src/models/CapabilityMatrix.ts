import mongoose from "mongoose";

export interface DomainStat {
  score: number;
  confidence: number;
  attempts: number;
  correct: number;
}

export interface DiagnosticHistoryItem {
  domain: string;
  difficulty: number;
  correct: boolean;
  answeredAt: Date;
}

export interface RecallTrace {
  domain: string;
  at: Date;
  success: boolean;
}

export interface ICapabilityMatrix extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  domains: Record<string, DomainStat>;
  diagnosticStatus: "not_started" | "in_progress" | "complete";
  currentDifficulty: number;
  currentQuestion: Record<string, unknown> | null;
  history: DiagnosticHistoryItem[];
  recalls: RecallTrace[];
  activeRescue: { domain: string; questions: Record<string, unknown>[] } | null;
  prefetch: {
    forIndex: number;
    correct: Record<string, unknown>;
    incorrect: Record<string, unknown>;
  } | null;
  startedAt: Date | null;
  completedAt: Date | null;
  updatedAt: Date;
}

const capabilityMatrixSchema = new mongoose.Schema<ICapabilityMatrix>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    domains: { type: Object, default: {} },
    diagnosticStatus: {
      type: String,
      enum: ["not_started", "in_progress", "complete"],
      default: "not_started",
    },
    currentDifficulty: { type: Number, default: 3 },
    currentQuestion: { type: Object, default: null },
    history: {
      type: [
        {
          domain: String,
          difficulty: Number,
          correct: Boolean,
          answeredAt: Date,
        },
      ],
      default: [],
    },
    recalls: {
      type: [{ domain: String, at: Date, success: Boolean }],
      default: [],
    },
    activeRescue: { type: Object, default: null },
    prefetch: {
      type: {
        forIndex: Number,
        correct: Object,
        incorrect: Object,
      },
      default: null,
    },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: false, updatedAt: "updatedAt" } }
);

export const CapabilityMatrix = mongoose.model<ICapabilityMatrix>(
  "CapabilityMatrix",
  capabilityMatrixSchema
);
