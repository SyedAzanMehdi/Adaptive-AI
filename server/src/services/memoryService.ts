// Memory Twin™ — a per-student memory model built from real practice history.
// Forgetting follows an exponential decay R(t) = e^(-t/S) where the stability S
// grows with each successful recall (spacing effect). This drives the 14-day
// decay forecast and the "Rescue Review" micro-sessions — premium features.

import { DOMAINS, type Domain } from "@edu/shared";
import type { ICapabilityMatrix } from "../models/CapabilityMatrix.js";
import { generateQuestionForDomain, publicQuestion } from "./diagnosticService.js";
import { ApiError } from "../utils/errors.js";

const DAY_MS = 86_400_000;
const RESCUE_LENGTH = 2;

export interface DomainMemory {
  domain: Domain;
  retention: number;
  stabilityDays: number;
  lastPractice: string | null;
  recalls: number;
  forecast: number[];
  daysUntilDanger: number | null;
}

function retentionAt(lastAtMs: number, stabilityDays: number, atMs: number): number {
  const elapsedDays = Math.max(0, atMs - lastAtMs) / DAY_MS;
  return Math.exp(-elapsedDays / Math.max(0.25, stabilityDays));
}

export function computeMemory(matrix: ICapabilityMatrix): DomainMemory[] {
  const now = Date.now();
  const result: DomainMemory[] = [];

  for (const domain of DOMAINS) {
    const traces = matrix.recalls.filter((r) => r.domain === domain);
    const diagTraces = matrix.history
      .filter((h) => h.domain === domain)
      .map((h) => ({ at: h.answeredAt.getTime(), success: h.correct }));
    const all = [...diagTraces, ...traces.map((t) => ({ at: t.at.getTime(), success: t.success }))].sort(
      (a, b) => a.at - b.at
    );
    if (all.length === 0) continue;

    const successes = all.filter((t) => t.success).length;
    const stabilityDays = Math.min(21, 1 + 0.8 * successes + 0.1 * all.length);
    const lastPractice = all[all.length - 1].at;
    const retention = retentionAt(lastPractice, stabilityDays, now);

    const forecast: number[] = [];
    let daysUntilDanger: number | null = null;
    for (let d = 0; d <= 14; d++) {
      const r = retentionAt(lastPractice, stabilityDays, now + d * DAY_MS);
      forecast.push(+r.toFixed(3));
      if (daysUntilDanger === null && r < 0.5) daysUntilDanger = d;
    }

    result.push({
      domain,
      retention: +retention.toFixed(3),
      stabilityDays: +stabilityDays.toFixed(1),
      lastPractice: new Date(lastPractice).toISOString(),
      recalls: all.length,
      forecast,
      daysUntilDanger,
    });
  }

  return result.sort((a, b) => a.retention - b.retention);
}

export function weakestDomain(memory: DomainMemory[]): DomainMemory | null {
  return memory[0] ?? null;
}

export async function startRescue(matrix: ICapabilityMatrix) {
  const memory = computeMemory(matrix);
  const target = weakestDomain(memory);
  if (!target) {
    throw new ApiError(409, "NO_MEMORY_DATA", "Complete the diagnostic first to build your Memory Twin");
  }

  const questions = [];
  for (let i = 0; i < RESCUE_LENGTH; i++) {
    const q = await generateQuestionForDomain(matrix, target.domain, 3);
    questions.push(q);
  }
  matrix.activeRescue = {
    domain: target.domain,
    questions: questions as unknown as Record<string, unknown>[],
  };
  await matrix.save();

  return {
    domain: target.domain,
    retention: target.retention,
    daysUntilDanger: target.daysUntilDanger,
    totalQuestions: RESCUE_LENGTH,
    questionIndex: 0,
    question: publicQuestion(questions[0]),
  };
}

export async function answerRescue(matrix: ICapabilityMatrix, selectedIndex: number) {
  const rescue = matrix.activeRescue;
  if (!rescue || !rescue.questions.length) {
    throw new ApiError(409, "NO_ACTIVE_RESCUE", "Start a Rescue Review first");
  }

  const question = rescue.questions[0] as unknown as {
    correctIndex: number;
    domain: Domain;
    rationale?: string;
  };
  const wasCorrect = selectedIndex === question.correctIndex;

  matrix.recalls = [
    ...matrix.recalls,
    { domain: question.domain, at: new Date(), success: wasCorrect },
  ].slice(-400);

  const remaining = rescue.questions.slice(1);
  if (remaining.length === 0) {
    matrix.activeRescue = null;
    await matrix.save();
    const memory = computeMemory(matrix);
    const domainState = memory.find((m) => m.domain === question.domain);
    return {
      completed: true,
      wasCorrect,
      rationale: question.rationale ?? "",
      domain: question.domain,
      newRetention: domainState?.retention ?? null,
      stabilityDays: domainState?.stabilityDays ?? null,
      message: wasCorrect
        ? "Memory reinforced — stability increased for this domain."
        : "Review recorded — schedule another rescue soon to rebuild this memory.",
    };
  }

  matrix.activeRescue = { domain: rescue.domain, questions: remaining };
  await matrix.save();
  return {
    completed: false,
    wasCorrect,
    rationale: question.rationale ?? "",
    questionIndex: RESCUE_LENGTH - remaining.length,
    totalQuestions: RESCUE_LENGTH,
    question: publicQuestion(remaining[0]),
  };
}
