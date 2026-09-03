import express from "express";
import type { Request, Response, NextFunction } from "express";
import { applySecurity } from "./config/security.js";
import { dbReady } from "./config/db.js";
import { authRoutes } from "./routes/authRoutes.js";
import { studentRoutes } from "./routes/studentRoutes.js";
import { lessonRoutes } from "./routes/lessonRoutes.js";
import { submissionRoutes } from "./routes/submissionRoutes.js";
import { adminRoutes } from "./routes/adminRoutes.js";
import { chatRoutes } from "./routes/chatRoutes.js";
import { premiumRoutes } from "./routes/premiumRoutes.js";
import { dojoRoutes } from "./routes/dojoRoutes.js";
import { freelanceRoutes } from "./routes/freelanceRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { aiMode } from "./services/aiService.js";

// Minimal latency logger — one line per request, no dependencies.
function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    console.log(`[req] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms`);
  });
  next();
}

export function createApp() {
  const app = express();

  // Correct client IPs for rate limiting when running behind a load balancer.
  app.set("trust proxy", 1);

  applySecurity(app);
  app.use(express.json({ limit: "1mb" }));
  app.use(requestLogger);

  app.get("/api/v1/health", (_req, res) => {
    const db = dbReady();
    res.status(db ? 200 : 503).json({ status: db ? "ok" : "degraded", db: db ? "up" : "down", aiMode: aiMode() });
  });

  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/student", studentRoutes);
  app.use("/api/v1/lessons", lessonRoutes);
  app.use("/api/v1/submissions", submissionRoutes);
  app.use("/api/v1/admin", adminRoutes);
  app.use("/api/v1/chat", chatRoutes);
  app.use("/api/v1/premium", premiumRoutes);
  app.use("/api/v1/dojo", dojoRoutes);
  app.use("/api/v1/freelance", freelanceRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
