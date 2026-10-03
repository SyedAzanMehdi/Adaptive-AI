import mongoose from "mongoose";

export interface IAutopilotPlan extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  targetRole: string;
  jobExcerpt: string;
  source: "ai" | "mock";
  report: Record<string, unknown>;
  plan: Record<string, unknown>;
  /** Customized Learning Path™ + Time-to-Ready ETA™; null on pre-extension docs. */
  path: Record<string, unknown> | null;
  weeklyHours: number;
  /** Automated Assessment Generator™ suite, stored so a refresh is free. */
  assessment: Record<string, unknown> | null;
  assessmentSource: "ai" | "mock" | null;
  assessedAt: Date | null;
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
    path: { type: Object, default: null },
    weeklyHours: { type: Number, default: 10 },
    assessment: { type: Object, default: null },
    assessmentSource: { type: String, enum: ["ai", "mock"], default: null },
    assessedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const AutopilotPlan = mongoose.model<IAutopilotPlan>("AutopilotPlan", autopilotPlanSchema);
