import { createApp } from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { bootstrapDevData } from "./config/bootstrap.js";
import { env } from "./config/env.js";

async function main() {
  await connectDB();
  await bootstrapDevData();
  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`[server] listening on http://localhost:${env.PORT}/api/v1`);
  });

  let shuttingDown = false;
  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[server] ${signal} received — shutting down gracefully`);

    // Force-exit safety net if draining hangs.
    const force = setTimeout(() => {
      console.error("[server] forced exit after drain timeout");
      process.exit(1);
    }, 10_000);
    force.unref?.();

    // Stop accepting new connections and drop idle keep-alives.
    server.close(() => console.log("[server] all connections drained"));
    (server as any).closeIdleConnections?.();

    try {
      await disconnectDB();
    } catch (err) {
      console.error("[server] error during DB disconnect:", err);
    }
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("unhandledRejection", (reason) => {
    console.error("[server] unhandled rejection:", reason);
  });
  process.on("uncaughtException", (err) => {
    console.error("[server] uncaught exception:", err);
    void shutdown("uncaughtException");
  });
}

main().catch((err) => {
  console.error("[server] failed to start:", err);
  process.exit(1);
});
