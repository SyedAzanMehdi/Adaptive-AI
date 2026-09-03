import mongoose from "mongoose";

export interface ISettings {
  _id: string;
  masteryThreshold: number;
  maxDiagnosticItems: number;
  minAttemptsPerDomain: number;
  cacheTtlHours: number;
  submissionLimitPerHour: number;
}

const settingsSchema = new mongoose.Schema<ISettings>(
  {
    _id: { type: String, default: "global" },
    masteryThreshold: { type: Number, default: 0.6 },
    maxDiagnosticItems: { type: Number, default: 10 },
    minAttemptsPerDomain: { type: Number, default: 2 },
    cacheTtlHours: { type: Number, default: 24 },
    submissionLimitPerHour: { type: Number, default: 20 },
  },
  { versionKey: false }
);

export const Settings = mongoose.model<ISettings>("Settings", settingsSchema);

export async function getSettings(): Promise<ISettings> {
  const existing = await Settings.findById("global");
  if (existing) return existing;
  return Settings.create({ _id: "global" });
}
