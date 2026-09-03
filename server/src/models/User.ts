import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: "student" | "admin";
  plan: "free" | "premium";
  premiumSince: Date | null;
  profile: {
    levelTier: "beginner" | "intermediate" | "advanced";
    learningStyle: "analogical" | "diagrammatic" | "conceptual";
  };
  status: "active" | "suspended";
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    plan: { type: String, enum: ["free", "premium"], default: "free" },
    premiumSince: { type: Date, default: null },
    profile: {
      levelTier: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner",
      },
      learningStyle: {
        type: String,
        enum: ["analogical", "diagrammatic", "conceptual"],
        default: "analogical",
      },
    },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.passwordHash);
};

export const User = mongoose.model<IUser>("User", userSchema);

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}
