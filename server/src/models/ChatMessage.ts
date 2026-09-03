import mongoose from "mongoose";

export interface IChatMessage {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: "user" | "assistant";
  content: string;
  domain: string | null;
  createdAt: Date;
}

const chatMessageSchema = new mongoose.Schema<IChatMessage>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true, maxlength: 20000 },
    domain: { type: String, default: null },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

chatMessageSchema.index({ userId: 1, createdAt: 1 });

export const ChatMessage = mongoose.model<IChatMessage>("ChatMessage", chatMessageSchema);
