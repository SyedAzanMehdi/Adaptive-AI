import path from "node:path";
import { config } from "dotenv";

const candidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "server/.env"),
  path.resolve(process.cwd(), "..", ".env"),
  path.resolve(process.cwd(), "..", "server/.env"),
];

for (const candidate of candidates) {
  config({ path: candidate });
}

export const env = {
  PORT: Number(process.env.PORT ?? 5000),
  MONGO_URI: process.env.MONGO_URI ?? "",
  USE_EMBEDDED_DB: process.env.USE_EMBEDDED_DB === "true",
  JWT_SECRET: process.env.JWT_SECRET ?? "dev-secret-change-me",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "",
  GEMINI_API_KEY_2: process.env.GEMINI_API_KEY_2 ?? "",
  GEMINI_MODEL: process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite",
  GEMINI_FALLBACK_MODELS: process.env.GEMINI_FALLBACK_MODELS ?? "",
  AI_TIMEOUT_MS: Number(process.env.AI_TIMEOUT_MS ?? 2000),
  NODE_ENV: process.env.NODE_ENV ?? "development",
};
