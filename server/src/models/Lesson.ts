import mongoose from "mongoose";

export interface ILesson extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  conceptId: string;
  title: string;
  domain: string;
  objectives: string[];
  canonicalContent: string;
  adaptations: {
    levelTier: string;
    style: string;
    content: string;
    cacheKey: string;
    createdAt: Date;
  }[];
}

const lessonSchema = new mongoose.Schema<ILesson>(
  {
    conceptId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    domain: { type: String, required: true },
    objectives: { type: [String], default: [] },
    canonicalContent: { type: String, required: true },
    adaptations: {
      type: [
        {
          levelTier: String,
          style: String,
          content: String,
          cacheKey: String,
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: false }
);

export const Lesson = mongoose.model<ILesson>("Lesson", lessonSchema);
