import mongoose from "mongoose";

export interface IFreelanceProfile extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  focus: string;
  source: "ai" | "mock";
  profile: Record<string, unknown>;
  createdAt: Date;
}

const freelanceProfileSchema = new mongoose.Schema<IFreelanceProfile>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    focus: { type: String, default: "" },
    source: { type: String, enum: ["ai", "mock"], default: "mock" },
    profile: { type: Object, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const FreelanceProfile = mongoose.model<IFreelanceProfile>("FreelanceProfile", freelanceProfileSchema);
