import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import { env } from "./env.js";

type MemoryServer = { stop: () => Promise<boolean>; getUri: (dbName?: string) => string };
let memoryServer: MemoryServer | null = null;

// Dev data persists to disk so hot reloads/restarts keep accounts and
// sessions alive (tests always run against a fresh ephemeral DB).
const DEFAULT_DEV_DB_PATH = path.resolve(process.cwd(), "mongo-data");

export async function connectDB(): Promise<void> {
  let uri = env.MONGO_URI;

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
    serverSelectionTimeoutMS: 10_000,
  });
  console.log("[db] connected");
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
