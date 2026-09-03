import type { Request, Response, NextFunction } from "express";
import { ChatMessage } from "../models/ChatMessage.js";
import { getChatReply } from "../services/chatService.js";

export async function chat(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const { message } = req.body;

    const history = await ChatMessage.find({ userId }).sort({ createdAt: -1 }).limit(10);
    const { reply, domain, source, degraded } = await getChatReply(
      message,
      history.reverse().map((m) => ({ role: m.role, content: m.content }))
    );

    const [userMsg, assistantMsg] = await ChatMessage.create([
      { userId, role: "user", content: message },
      { userId, role: "assistant", content: reply, domain: domain ?? null },
    ]);

    res.status(201).json({
      userMessage: { id: userMsg._id.toString(), content: userMsg.content, createdAt: userMsg.createdAt },
      reply: {
        id: assistantMsg._id.toString(),
        content: assistantMsg.content,
        domain: assistantMsg.domain,
        createdAt: assistantMsg.createdAt,
      },
      source,
      degraded,
    });
  } catch (err) {
    next(err);
  }
}

export async function history(req: Request, res: Response, next: NextFunction) {
  try {
    const messages = await ChatMessage.find({ userId: (req as any).user.id })
      .sort({ createdAt: 1 })
      .limit(100);
    res.json({
      messages: messages.map((m) => ({
        id: m._id.toString(),
        role: m.role,
        content: m.content,
        domain: m.domain,
        createdAt: m.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function clearHistory(req: Request, res: Response, next: NextFunction) {
  try {
    await ChatMessage.deleteMany({ userId: (req as any).user.id });
    res.json({ cleared: true });
  } catch (err) {
    next(err);
  }
}

export async function adminStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const [totalMessages, activeUsers] = await Promise.all([
      ChatMessage.countDocuments({}),
      ChatMessage.distinct("userId"),
    ]);
    res.json({ totalMessages, activeUsers: activeUsers.length });
  } catch (err) {
    next(err);
  }
}
