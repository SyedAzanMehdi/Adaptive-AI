import { chatReplySchema, type ChatReply } from "@edu/shared";
import { KNOWLEDGE_BASE, pickFallback } from "../data/knowledgeBase.js";
import { aiMode, generateJson } from "./aiService.js";

const REPLY_JSON_SCHEMA = {
  type: "OBJECT",
  properties: {
    reply: { type: "STRING" },
    domain: { type: "STRING" },
  },
  required: ["reply"],
};

function scoreEntry(message: string, keywords: string[]): number {
  const lower = message.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (lower.includes(kw)) score += kw.includes(" ") ? 3 : 1;
  }
  return score;
}

function mockChat(message: string): ChatReply {
  let best = KNOWLEDGE_BASE[0];
  let bestScore = 0;
  for (const entry of KNOWLEDGE_BASE) {
    const s = scoreEntry(message, entry.keywords);
    if (s > bestScore) {
      best = entry;
      bestScore = s;
    }
  }
  if (bestScore === 0) {
    return { reply: pickFallback(message.length), domain: "general" };
  }
  return { reply: best.answer, domain: best.domain };
}

export async function getChatReply(
  message: string,
  history: { role: string; content: string }[]
): Promise<{ reply: string; domain?: string; source: "ai" | "knowledge"; degraded: boolean }> {
  const knowledgeFallback = () => {
    const fb = mockChat(message);
    return { reply: fb.reply, domain: fb.domain, source: "knowledge" as const, degraded: true };
  };

  if (aiMode() !== "gemini") {
    // No key configured: serve the built-in knowledge base so Ask AI always works.
    return knowledgeFallback();
  }

  const transcript = history
    .slice(-10)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const prompt =
    "You are the general AI mentor of an adaptive learning platform. " +
    "Answer questions across ALL domains — computer science (syntax, OOP, data structures, " +
    "algorithms, debugging), web development, databases, AI/ML, learning strategies, and careers. " +
    "Be concise (under 120 words), constructive, and adapt to the learner's apparent level.\n\n" +
    (transcript ? `Conversation so far:\n${transcript}\n\n` : "") +
    `Student's new message: ${message}`;

  const started = Date.now();
  try {
    const { text, slot } = await generateJson({
      prompt,
      responseSchema: REPLY_JSON_SCHEMA,
      route: "primary",
    });
    const parsed = JSON.parse(text);
    const result = chatReplySchema.parse(parsed);
    console.log(`[chat] gemini reply ok via key ${slot} (${Date.now() - started}ms)`);
    return { reply: result.reply, domain: result.domain, source: "ai", degraded: false };
  } catch (err) {
    // Gemini quota/rate-limit/timeout/network failure: degrade gracefully to the
    // knowledge base so the learner still gets a useful answer (flagged, not silent).
    const reason = err instanceof Error ? err.message : "Unknown Gemini error";
    console.warn("[chat] Gemini unavailable, using knowledge base:", reason.slice(0, 160));
    return knowledgeFallback();
  }
}
