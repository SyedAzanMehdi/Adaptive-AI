import mongoose from "mongoose";
import { APPLICATION_STAGES, type ApplicationStage } from "@edu/shared";

export interface StageChange {
  stage: ApplicationStage;
  at: Date;
}

export interface IApplication extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  company: string;
  role: string;
  stage: ApplicationStage;
  location: string;
  url: string;
  salaryBand: string;
  notes: string;
  nextActionAt: Date | null;
  /** Append-only, so time-in-stage can be reported without recomputing. */
  stageHistory: StageChange[];
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new mongoose.Schema<IApplication>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    stage: { type: String, enum: APPLICATION_STAGES, default: "saved", index: true },
    location: { type: String, default: "", trim: true },
    url: { type: String, default: "" },
    salaryBand: { type: String, default: "", trim: true },
    notes: { type: String, default: "" },
    nextActionAt: { type: Date, default: null },
    stageHistory: [
      {
        _id: false,
        stage: { type: String, enum: APPLICATION_STAGES, required: true },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

// One tracker entry per company+role per student; the controller turns a
// duplicate insert into a 409 rather than a Mongo error.
applicationSchema.index({ userId: 1, company: 1, role: 1 }, { unique: true });
// Pipeline view is always "my rows, newest activity first".
applicationSchema.index({ userId: 1, updatedAt: -1 });

export const Application = mongoose.model<IApplication>("Application", applicationSchema);
