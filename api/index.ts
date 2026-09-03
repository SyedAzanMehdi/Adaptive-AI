import type { IncomingMessage, ServerResponse } from "node:http";
import { createApp } from "../server/src/app.js";
import { connectDB } from "../server/src/config/db.js";
import { bootstrapDevData } from "../server/src/config/bootstrap.js";

const app = createApp();

// Serverless boot: connect lazily on the first request of a container, then
// reuse the connection across warm invocations. Bootstrap is idempotent
// (creates the admin only if missing, upserts canonical lessons).
let ready: Promise<void> | null = null;

function ensureReady(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await connectDB();
      await bootstrapDevData();
    })().catch((err) => {
      ready = null;
      throw err;
    });
  }
  return ready;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    await ensureReady();
  } catch (err) {
    console.error("[vercel] startup failed:", err instanceof Error ? err.message : err);
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: { code: "SERVICE_UNAVAILABLE", message: "Service is starting up; try again shortly", status: 503 },
      })
    );
    return;
  }
  app(req, res);
}
