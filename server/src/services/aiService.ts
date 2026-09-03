import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";

// Two credentials × a small model cascade: free-tier quotas are per key and
// per model, so rolling over keeps AI-backed decisions live during bursts.
// Keys are read from env at call time (cached per key) so config changes and
// tests that blank the keys take effect without a restart.
const clientCache = new Map<string, GoogleGenAI>();

/**
 * Which credential a feature spends first. Ask AI owns the primary key so the
 * most latency-sensitive, user-facing path is never starved by the bulk AI
 * features; everything else prefers the secondary key. The other key is still
 * tried before the deterministic mock, so routing partitions the quota budget
 * without giving up the cascade's resilience.
 */
export type AiKeyRoute = "primary" | "secondary";

type KeySlot = 1 | 2;

function configuredSlots(): Array<{ slot: KeySlot; key: string }> {
  return ([
    { slot: 1, key: env.GEMINI_API_KEY },
    { slot: 2, key: env.GEMINI_API_KEY_2 },
  ] as Array<{ slot: KeySlot; key: string }>).filter((entry) => entry.key.length > 0);
}

function getConfiguredKeys(): string[] {
  return configuredSlots().map((entry) => entry.key);
}

function clientFor(key: string): GoogleGenAI {
  let client = clientCache.get(key);
  if (!client) {
    client = new GoogleGenAI({ apiKey: key });
    clientCache.set(key, client);
  }
  return client;
}

/** Configured clients with the route's preferred key first. */
function orderedClients(route: AiKeyRoute): Array<{ slot: KeySlot; client: GoogleGenAI }> {
  const bySlot = new Map(configuredSlots().map((entry) => [entry.slot, entry.key]));
  const preference: KeySlot[] = route === "secondary" ? [2, 1] : [1, 2];
  return preference
    .map((slot) => {
      const key = bySlot.get(slot);
      return key ? { slot, client: clientFor(key) } : null;
    })
    .filter((entry): entry is { slot: KeySlot; client: GoogleGenAI } => entry !== null);
}

export function aiMode(): "gemini" | "mock" {
  return getConfiguredKeys().length > 0 ? "gemini" : "mock";
}

const AI_MODELS = [
  env.GEMINI_MODEL,
  ...env.GEMINI_FALLBACK_MODELS.split(",").map((m) => m.trim()).filter(Boolean),
].filter((m, i, arr) => m.length > 0 && arr.indexOf(m) === i);

export interface StructuredRequest<T> {
  prompt: string;
  schema: { parse: (value: unknown) => T };
  mock: () => T | Promise<T>;
  responseSchema?: Record<string, unknown>;
  /** Credential to spend first; the other key is still tried before the mock. */
  route?: AiKeyRoute;
}

function withTimeout<R>(promise: Promise<R>, ms: number): Promise<R> {
  return new Promise<R>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("AI_TIMEOUT")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function isQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? `${err.message}` : String(err);
  return /429|RESOURCE_EXHAUSTED|quota/i.test(msg);
}

function isOverloadError(err: unknown): boolean {
  const msg = err instanceof Error ? `${err.message}` : String(err);
  return /503|500|OVERLOADED|high demand|UNAVAILABLE|AI_TIMEOUT/i.test(msg);
}

function quotaRetryMs(err: unknown): number {
  const msg = err instanceof Error ? `${err.message}` : String(err);
  const m = msg.match(/retry in ([\d.]+)\s*s/i);
  const seconds = m ? parseFloat(m[1]) : 6;
  return Math.min(Math.max(seconds, 1) * 1000 + 250, 8000);
}

async function attempt(client: GoogleGenAI, model: string, prompt: string, responseSchema?: Record<string, unknown>) {
  return withTimeout(
    client.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        ...(responseSchema ? { responseSchema: responseSchema as object } : {}),
        temperature: 0.4,
      },
    }),
    env.AI_TIMEOUT_MS
  );
}

/**
 * Generates a JSON response by walking the key × model cascade. On quota
 * errors (429 / RESOURCE_EXHAUSTED) it waits out Google's retry hint once,
 * then rolls to the next model and the next key. Transient overload/timeout
 * errors roll over immediately. Genuinely unexpected failures throw so
 * callers can fall back to their deterministic providers. Bounded to ~45s.
 */
export async function generateJson(opts: {
  prompt: string;
  responseSchema?: Record<string, unknown>;
  route?: AiKeyRoute;
}): Promise<{ text: string; slot: KeySlot }> {
  const clients = orderedClients(opts.route ?? "primary");
  if (clients.length === 0) throw new Error("AI_NOT_CONFIGURED");
  const deadline = Date.now() + 45_000;
  let lastErr: unknown;
  for (const { slot, client } of clients) {
    for (const model of AI_MODELS) {
      for (let retry = 0; retry < 2; retry++) {
        try {
          const res = await attempt(client, model, opts.prompt, opts.responseSchema);
          return { text: res.text ?? "", slot };
        } catch (err) {
          lastErr = err;
          const reason = err instanceof Error ? err.message : String(err);
          console.warn(`[ai] attempt failed (key ${slot}, ${model}): ${reason.slice(0, 140)}`);
          if (isQuotaError(err)) {
            if (retry === 0) {
              await sleep(quotaRetryMs(err));
              continue;
            }
          } else if (isOverloadError(err)) {
            break; // transient model-level overload: roll to the next model/key
          } else {
            throw err;
          }
        }
      }
      if (Date.now() > deadline) throw lastErr;
    }
  }
  throw lastErr;
}

/**
 * Single entry point for all Gemini calls. When no API key is configured, or
 * every key/model in the cascade fails, falls back to the deterministic mock
 * provider so the learning loop always works.
 */
export async function generateStructured<T>(
  opts: StructuredRequest<T>
): Promise<{ result: T; source: "ai" | "mock" }> {
  if (aiMode() === "gemini") {
    const started = Date.now();
    try {
      const { text, slot } = await generateJson({
        prompt: opts.prompt,
        responseSchema: opts.responseSchema,
        route: opts.route,
      });
      const parsed = JSON.parse(text);
      const result = opts.schema.parse(parsed);
      console.log(`[ai] gemini structured response ok via key ${slot} (${Date.now() - started}ms)`);
      return { result, source: "ai" };
    } catch (err) {
      console.warn("[ai] gemini call failed, using fallback provider:", (err as Error).message.slice(0, 160));
    }
  }
  const mockResult = await opts.mock();
  return { result: opts.schema.parse(mockResult), source: "mock" };
}
