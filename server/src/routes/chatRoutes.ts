import { Router } from "express";
import rateLimit from "express-rate-limit";
import { chatRequestSchema } from "@edu/shared";
import { authenticate } from "../middleware/authMiddleware.js";
import { validateBody } from "../utils/validate.js";
import { chat, history, clearHistory, adminStats } from "../controllers/chatController.js";

export const chatRoutes = Router();

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Chat limit reached; try again shortly", status: 429 } },
});

chatRoutes.use(authenticate);
chatRoutes.get("/history", history);
chatRoutes.delete("/history", clearHistory);
chatRoutes.post("/", chatLimiter, validateBody(chatRequestSchema), chat);
chatRoutes.get("/stats", adminStats);
