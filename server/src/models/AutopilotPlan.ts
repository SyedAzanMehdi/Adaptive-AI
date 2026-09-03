import mongoose from "mongoose";

export interface IAutopilotPlan extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  targetRole: string;
  jobExcerpt: string;
  source: "ai" | "mock";
  report: Record<string, unknown>;
  plan: Record<string, unknown>;
  createdAt: Date;
}

const autopilotPlanSchema = new mongoose.Schema<IAutopilotPlan>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    targetRole: { type: String, required: true },
    jobExcerpt: { type: String, default: "" },
    source: { type: String, enum: ["ai", "mock"], default: "mock" },
    report: { type: Object, required: true },
    plan: { type: Object, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const AutopilotPlan = mongoose.model<IAutopilotPlan>("AutopilotPlan", autopilotPlanSchema);
