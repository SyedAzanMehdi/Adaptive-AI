import {
  DOMAINS,
  diagnosticQuestionSchema,
  type DiagnosticQuestion,
  type Domain,
} from "@edu/shared";
import { aiMode, generateStructured } from "./aiService.js";
import { mockDiagnosticQuestion } from "./mockAi.js";
import { CapabilityMatrix, type ICapabilityMatrix, type DomainStat, type DiagnosticHistoryItem } from "../models/CapabilityMatrix.js";
import { getSettings } from "../models/Settings.js";
import { ApiError } from "../utils/errors.js";

const QUESTION_JSON_SCHEMA = {
  type: "OBJECT",
  properties: {
    prompt: { type: "STRING" },
    code: { type: "STRING" },
    choices: { type: "ARRAY", items: { type: "STRING" } },
    correctIndex: { type: "NUMBER" },
    rationale: { type: "STRING" },
    domain: { type: "STRING", enum: [...DOMAINS] },
    difficulty: { type: "NUMBER", minimum: 1, maximum: 5 },
  },
  required: ["prompt", "choices", "correctIndex", "domain", "difficulty"],
};

function pickNextDomain(matrix: ICapabilityMatrix): Domain {
  let best: Domain = DOMAINS[0];
  let bestAttempts = Infinity;
  let bestScore = Infinity;
  for (const d of DOMAINS) {
    const stat = matrix.domains[d];
    const attempts = stat?.attempts ?? 0;
    const score = stat?.score ?? 0.5;
    if (attempts < bestAttempts || (attempts === bestAttempts && score < bestScore)) {
      best = d;
      bestAttempts = attempts;
      bestScore = score;
    }
  }
  return best;
}

export async function generateQuestionForDomain(
  matrix: ICapabilityMatrix,
  domain: Domain,
  difficulty?: number
): Promise<DiagnosticQuestion> {
  const level = difficulty ?? matrix.currentDifficulty;
  const prompt =
    `You are an adaptive assessment engine. Generate exactly ONE multiple-choice ` +
    `question for domain "${domain}" at difficulty ${level}/5 for a computer-science ` +
    `student. Prefer short code-reading questions. Provide 4 plausible choices with exactly ` +
    `one correct.`;
  const { result } = await generateStructured({
    prompt,
    schema: diagnosticQuestionSchema,
    responseSchema: QUESTION_JSON_SCHEMA,
    mock: () => mockDiagnosticQuestion(domain, level, matrix.history.length),
  });
  return { ...result, domain, difficulty: level };
}

async function generateNextQuestion(matrix: ICapabilityMatrix): Promise<DiagnosticQuestion> {
  return generateQuestionForDomain(matrix, pickNextDomain(matrix));
}

interface MatrixSnapshot {
  domains: Record<string, DomainStat>;
  history: DiagnosticHistoryItem[];
  currentDifficulty: number;
  question: DiagnosticQuestion;
}

function branchTarget(snap: MatrixSnapshot, wasCorrect: boolean) {
  const domains = {
    ...snap.domains,
    [snap.question.domain]: updateStat(snap.domains[snap.question.domain], wasCorrect),
  };
  const history: DiagnosticHistoryItem[] = [
    ...snap.history,
    {
      domain: snap.question.domain,
      difficulty: snap.question.difficulty,
      correct: wasCorrect,
      answeredAt: new Date(),
    },
  ];
  return {
    domain: pickNextDomain({ domains } as unknown as ICapabilityMatrix),
    difficulty: nextDifficulty(history, snap.currentDifficulty, wasCorrect),
  };
}

// Tracks a still-generating prefetch per user so the answer path can await the
// SAME in-flight call instead of firing a duplicate that contends for the tiny
// free-tier quota (which is what turned a miss into a 17-45s stall).
const inFlightPrefetch = new Map<
  string,
  { index: number; correctP: Promise<DiagnosticQuestion>; incorrectP: Promise<DiagnosticQuestion> }
>();

/**
 * Pre-generates both possible next questions while the learner is still
 * reading/thinking, so answering serves a ready question with no AI wait.
 * Best-effort: any failure simply falls back to live generation on answer.
 */
function kickPrefetch(userId: string, snap: MatrixSnapshot, index: number) {
  if (aiMode() !== "gemini") return;
  const tCorrect = branchTarget(snap, true);
  const tIncorrect = branchTarget(snap, false);
  const asMatrix = snap as unknown as ICapabilityMatrix;
  // Sequential, not parallel: free-tier Gemini rate-limits per key/model, so
  // two concurrent calls trip 429/503 and cascade into 12s+ timeouts that also
  // starve the live answer. The correct branch is generated first (most answers
  // are correct, and an immediate answer then awaits a single call); the
  // incorrect branch is chained after it.
  const correctP = generateQuestionForDomain(asMatrix, tCorrect.domain, tCorrect.difficulty);
  const incorrectP = correctP.then(() =>
    generateQuestionForDomain(asMatrix, tIncorrect.domain, tIncorrect.difficulty)
  );
  inFlightPrefetch.set(userId, { index, correctP, incorrectP });
  void Promise.all([correctP, incorrectP])
    .then(([correct, incorrect]) =>
      CapabilityMatrix.updateOne(
        { userId, $expr: { $eq: [{ $size: "$history" }, index] } },
        { $set: { prefetch: { forIndex: index, correct, incorrect } } }
      )
    )
    .then((r) => console.log(`[prefetch] index=${index} persisted matched=${r.matchedCount}`))
    .catch((err) =>
      console.warn(`[prefetch] index=${index} failed:`, (err as Error).message.slice(0, 120))
    )
    .finally(() => {
      const cur = inFlightPrefetch.get(userId);
      if (cur && cur.index === index) inFlightPrefetch.delete(userId);
    });
}

/**
 * Resolves the question to serve after an answer, fastest path first:
 * (1) a prefetch already persisted for this index → instant;
 * (2) a prefetch still generating for this index → await that same call
 *     (only the branch the learner actually took) rather than firing a
 *     duplicate that would contend for the same free-tier quota;
 * (3) otherwise generate live.
 */
async function resolveNextQuestion(
  userId: string,
  matrix: ICapabilityMatrix,
  servedIndex: number,
  wasCorrect: boolean,
  prefetched: Record<string, unknown> | null
): Promise<DiagnosticQuestion> {
  if (prefetched) {
    const parsed = diagnosticQuestionSchema.safeParse(prefetched);
    if (parsed.success) return parsed.data;
  }
  const flight = inFlightPrefetch.get(userId);
  if (flight && flight.index === servedIndex) {
    try {
      const q = await (wasCorrect ? flight.correctP : flight.incorrectP);
      const parsed = diagnosticQuestionSchema.safeParse(q);
      if (parsed.success) return parsed.data;
    } catch {
      /* prefetch failed mid-flight; fall through to live generation */
    }
  }
  return generateNextQuestion(matrix);
}

export function publicQuestion(q: Record<string, unknown> | DiagnosticQuestion) {
  const { correctIndex: _ci, ...rest } = q as Record<string, unknown>;
  return rest;
}

export async function startDiagnostic(userId: string) {
  const settings = await getSettings();
  let matrix = await CapabilityMatrix.findOne({ userId });
  const fresh =
    !matrix ||
    matrix.diagnosticStatus === "not_started" ||
    matrix.history.length >= settings.maxDiagnosticItems;

  if (!matrix) {
    matrix = await CapabilityMatrix.create({ userId });
  }
  if (matrix.diagnosticStatus === "complete") {
    return {
      status: "complete" as const,
      matrix: matrix.domains,
      message: "Diagnostic already completed; matrix is being refined by your activity.",
    };
  }

  if (fresh) {
    matrix.domains = {};
    matrix.history = [];
    matrix.currentDifficulty = 3;
    matrix.startedAt = new Date();
    matrix.completedAt = null;
  }
  matrix.diagnosticStatus = "in_progress";
  const question = await generateNextQuestion(matrix);
  matrix.currentQuestion = question as unknown as Record<string, unknown>;
  await matrix.save();
  kickPrefetch(
    userId,
    {
      domains: matrix.domains,
      history: matrix.history,
      currentDifficulty: matrix.currentDifficulty,
      question,
    },
    matrix.history.length
  );

  return {
    status: "in_progress" as const,
    questionIndex: matrix.history.length,
    maxItems: settings.maxDiagnosticItems,
    question: publicQuestion(question),
  };
}

function updateStat(stat: DomainStat | undefined, correct: boolean): DomainStat {
  const attempts = (stat?.attempts ?? 0) + 1;
  const correctCount = (stat?.correct ?? 0) + (correct ? 1 : 0);
  return {
    attempts,
    correct: correctCount,
    score: (correctCount + 1) / (attempts + 2),
    confidence: Math.min(1, attempts / 4),
  };
}

function nextDifficulty(
  history: DiagnosticHistoryItem[],
  current: number,
  wasCorrect: boolean
): number {
  const last = history[history.length - 1];
  const prev = history[history.length - 2];
  if (wasCorrect && last?.correct && prev?.correct) return Math.min(5, current + 1);
  if (!wasCorrect) return Math.max(1, current - 1);
  return current;
}

function adjustDifficulty(matrix: ICapabilityMatrix, wasCorrect: boolean) {
  matrix.currentDifficulty = nextDifficulty(matrix.history, matrix.currentDifficulty, wasCorrect);
}

async function isComplete(matrix: ICapabilityMatrix): Promise<boolean> {
  const settings = await getSettings();
  if (matrix.history.length >= settings.maxDiagnosticItems) return true;
  return DOMAINS.every((d) => (matrix.domains[d]?.attempts ?? 0) >= settings.minAttemptsPerDomain);
}

export async function answerDiagnostic(userId: string, selectedIndex: number) {
  const matrix = await CapabilityMatrix.findOne({ userId });
  if (!matrix || matrix.diagnosticStatus !== "in_progress" || !matrix.currentQuestion) {
    throw new ApiError(409, "NO_ACTIVE_DIAGNOSTIC", "Start the diagnostic first");
  }
  const question = matrix.currentQuestion as unknown as DiagnosticQuestion;
  const wasCorrect = selectedIndex === question.correctIndex;
  const servedIndex = matrix.history.length;
  const pf = matrix.prefetch;
  const prefetched =
    pf && pf.forIndex === servedIndex ? (wasCorrect ? pf.correct : pf.incorrect) : null;

  matrix.domains = {
    ...matrix.domains,
    [question.domain]: updateStat(matrix.domains[question.domain], wasCorrect),
  };
  matrix.recalls = [
    ...matrix.recalls,
    { domain: question.domain, at: new Date(), success: wasCorrect },
  ].slice(-400);
  matrix.history.push({
    domain: question.domain,
    difficulty: question.difficulty,
    correct: wasCorrect,
    answeredAt: new Date(),
  });
  if (matrix.history.length > 600) matrix.history = matrix.history.slice(-600);
  adjustDifficulty(matrix, wasCorrect);

  const complete = await isComplete(matrix);
  if (complete) {
    matrix.diagnosticStatus = "complete";
    matrix.completedAt = new Date();
    matrix.currentQuestion = null;
    matrix.prefetch = null;
    await matrix.save();
    return {
      completed: true,
      wasCorrect,
      rationale: question.rationale ?? "",
      matrix: matrix.domains,
    };
  }

  const next = await resolveNextQuestion(userId, matrix, servedIndex, wasCorrect, prefetched);
  matrix.currentQuestion = next as unknown as Record<string, unknown>;
  matrix.prefetch = null;
  await matrix.save();
  kickPrefetch(
    userId,
    {
      domains: matrix.domains,
      history: matrix.history,
      currentDifficulty: matrix.currentDifficulty,
      question: next,
    },
    matrix.history.length
  );

  return {
    completed: false,
    wasCorrect,
    rationale: question.rationale ?? "",
    questionIndex: matrix.history.length,
    question: publicQuestion(next),
  };
}

export async function getOrCreateMatrix(userId: string) {
  return (
    (await CapabilityMatrix.findOne({ userId })) ??
    (await CapabilityMatrix.create({ userId }))
  );
}
