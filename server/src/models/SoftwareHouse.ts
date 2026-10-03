import mongoose from "mongoose";
import type { SoftwareHouseRegion } from "@edu/shared";

export interface ISoftwareHouse extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  website: string;
  region: SoftwareHouseRegion;
  country: string;
  city: string;
  description: string;
  hiringFocus: string[];
  // null for seed/curated entries added at boot, not by any user.
  addedBy: mongoose.Types.ObjectId | null;
  // Admin-created or seed entries are auto-approved; student submissions sit
  // in a moderation queue until an admin approves them.
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const softwareHouseSchema = new mongoose.Schema<ISoftwareHouse>(
  {
    name: { type: String, required: true, trim: true },
    website: { type: String, default: "" },
    region: { type: String, enum: ["pakistan", "international"], required: true, index: true },
    country: { type: String, required: true, trim: true },
    city: { type: String, default: "", trim: true },
    description: { type: String, default: "" },
    hiringFocus: { type: [String], default: [] },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approved: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, versionKey: false }
);

softwareHouseSchema.index({ approved: 1, region: 1 });

export const SoftwareHouse = mongoose.model<ISoftwareHouse>("SoftwareHouse", softwareHouseSchema);
