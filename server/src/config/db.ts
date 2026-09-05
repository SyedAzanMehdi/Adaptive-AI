import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import { env } from "./env.js";

type MemoryServer = { stop: () => Promise<boolean>; getUri: (dbName?: string) => string };
let memoryServer: MemoryServer | null = null;

// Dev data persists to disk so hot reloads/restarts keep accounts and
// sessions alive (tests always run against a fresh ephemeral DB).
const DEFAULT_DEV_DB_PATH = path.resolve(process.cwd(), "mongo-data");

function isPidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    // EPERM means the process exists but belongs to another user/elevation —
    // still alive. ESRCH (or anything else) means it is gone.
    return (err as NodeJS.ErrnoException).code === "EPERM";
  }
}

/**
 * A previous dev server killed without a clean shutdown leaves mongod.lock
 * behind, and the next start dies with a cryptic "DBPathInUse ... lock file"
 * stack trace. mongod.lock holds the owning mongod's PID, so we can tell a
 * stale lock (owner dead → safe to remove) from a live one (another dev server
 * is genuinely running → fail fast with guidance instead of corrupting data).
 */
async function clearStaleLock(dbPath: string): Promise<void> {
  const lockFile = path.join(dbPath, "mongod.lock");
  if (!fs.existsSync(lockFile)) return;
  const ownerPid = Number.parseInt(fs.readFileSync(lockFile, "utf8").trim(), 10);
  if (!Number.isFinite(ownerPid) || ownerPid <= 0) return; // unparseable: let mongod decide
  // On a tsx-watch reload the previous mongod may still be shutting down; give
  // it a few seconds to release the lock before treating it as a real conflict.
  const deadline = Date.now() + 8_000;
  while (isPidAlive(ownerPid)) {
    if (Date.now() > deadline) {
      throw new Error(
        `Another dev server (mongod PID ${ownerPid}) is already using the database at ${dbPath}. ` +
          `Stop it first, or run this one with a different EMBEDDED_DB_PATH or a real MONGO_URI.`
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  fs.rmSync(lockFile, { force: true });
  console.log(`[db] removed stale mongod.lock (owner PID ${ownerPid} is not running)`);
}

export async function connectDB(): Promise<void> {
  let uri = env.USE_EMBEDDED_DB ? "" : env.MONGO_URI;

  if (!uri) {
    if (env.NODE_ENV === "production") {
      // Never boot a production instance against a disposable embedded DB.
      throw new Error("MONGO_URI must be set in production (embedded dev DB disabled)");
    }
    // Embedded MongoDB for local development only. The specifier is a
    // variable so serverless bundlers don't trace this dev-only dependency.
    const devDbModule = "mongodb-memory-server";
    const { MongoMemoryServer } = await import(devDbModule);

    const dbPath =
      env.NODE_ENV === "test" ? "" : process.env.EMBEDDED_DB_PATH || DEFAULT_DEV_DB_PATH;

    if (dbPath) {
      fs.mkdirSync(dbPath, { recursive: true });
      await clearStaleLock(dbPath);
      const mem = await MongoMemoryServer.create({
        instance: { dbPath, storageEngine: "wiredTiger" },
      });
      memoryServer = mem as unknown as MemoryServer;
      uri = mem.getUri("adaptive_learning");
      console.log(`[db] using embedded MongoDB at ${uri} (persisted at ${dbPath})`);
      console.log("[db] note: dev-only; data survives restarts; set MONGO_URI for a real database");
    } else {
      const mem = await MongoMemoryServer.create();
      memoryServer = mem as unknown as MemoryServer;
      uri = mem.getUri("adaptive_learning");
      console.log(`[db] using embedded in-memory MongoDB at ${uri}`);
      console.log("[db] note: dev-only; data resets on restart; set MONGO_URI for persistence");
    }
  }

  // Note: NoSQL operator-injection is guarded precisely at the controller layer
  // (user-supplied filters are whitelisted) plus Zod request validation. A global
  // sanitizeFilter is intentionally NOT enabled because it breaks legitimate
  // server-side operator queries (e.g. $gte date ranges).

  await mongoose.connect(uri, {
    maxPoolSize: 20,
    // 30s (driver default), not 10s. Measured against Atlas from this network:
    // cold connect takes 4-10s for SRV discovery + TLS to all three shard
    // members, so a 10s ceiling intermittently crashed boot with
    // MongooseServerSelectionError / ReplicaSetNoPrimary. This only bounds how
    // long the driver waits to find a usable server before erroring — it adds no
    // latency to queries once connected, so hot-path budgets are unaffected.
    serverSelectionTimeoutMS: 30_000,
  });
  console.log(`[db] connected → ${mongoose.connection.host}/${mongoose.connection.name}`);
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop().catch(() => {});
    memoryServer = null;
  }
}

export function dbReady(): boolean {
  return mongoose.connection.readyState === 1;
}
