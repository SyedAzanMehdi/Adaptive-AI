import mongoose from "mongoose";

export interface IDesignCritique extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  challengeId: string;
  notesExcerpt: string;
  critique: Record<string, unknown>;
  source: "ai" | "mock";
  createdAt: Date;
}

const designCritiqueSchema = new mongoose.Schema<IDesignCritique>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    challengeId: { type: String, required: true },
    notesExcerpt: { type: String, required: true },
    critique: { type: Object, required: true },
    source: { type: String, enum: ["ai", "mock"], required: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

export const DesignCritique = mongoose.model<IDesignCritique>(
  "DesignCritique",
  designCritiqueSchema
);
