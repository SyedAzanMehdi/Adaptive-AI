import mongoose from "mongoose";

export interface ICodeSubmission {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  exerciseId: string;
  code: string;
  language: string;
  evaluation: Record<string, unknown> | null;
  attemptNumber: number;
  createdAt: Date;
}

const codeSubmissionSchema = new mongoose.Schema<ICodeSubmission>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    exerciseId: { type: String, required: true },
    code: { type: String, required: true },
    language: { type: String, default: "javascript" },
    evaluation: { type: Object, default: null },
    attemptNumber: { type: Number, default: 1 },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

codeSubmissionSchema.index({ userId: 1, exerciseId: 1, createdAt: -1 });
codeSubmissionSchema.index({ userId: 1, createdAt: -1 });

export const CodeSubmission = mongoose.model<ICodeSubmission>("CodeSubmission", codeSubmissionSchema);
