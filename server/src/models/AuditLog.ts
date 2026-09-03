import mongoose from "mongoose";

export interface IAuditLog {
  _id: mongoose.Types.ObjectId;
  adminId: mongoose.Types.ObjectId | string;
  action: string;
  targetType: string;
  targetId: string;
  meta: Record<string, unknown>;
  createdAt: Date;
}

const auditLogSchema = new mongoose.Schema<IAuditLog>(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: { type: String, default: "" },
    meta: { type: Object, default: {} },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
