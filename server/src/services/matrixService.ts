import type { Domain } from "@edu/shared";
import { CapabilityMatrix, type DomainStat } from "../models/CapabilityMatrix.js";
import { getOrCreateMatrix } from "./diagnosticService.js";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export async function applyDeltas(
  userId: string,
  deltas: { domain: Domain; delta: number }[]
): Promise<void> {
  if (!deltas.length) return;
  const matrix = await getOrCreateMatrix(userId);
  const next = { ...matrix.domains };
  for (const { domain, delta } of deltas) {
    const stat: DomainStat = next[domain] ?? {
      score: 0.5,
      confidence: 0,
      attempts: 0,
      correct: 0,
    };
    next[domain] = { ...stat, score: clamp(stat.score + delta, 0, 1) };
  }
  matrix.domains = next;
  await matrix.save();
}
