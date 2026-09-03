import { DOMAINS, evaluationSchema, type Evaluation, type Tier } from "@edu/shared";
import { generateStructured } from "./aiService.js";
import { mockEvaluation } from "./mockAi.js";
import type { ExerciseDef } from "../data/exercises.js";

const EVALUATION_JSON_SCHEMA = {
  type: "OBJECT",
  properties: {
    correct: { type: "BOOLEAN" },
    scores: {
      type: "OBJECT",
      properties: {
        correctness: { type: "NUMBER", minimum: 0, maximum: 100 },
        style: { type: "NUMBER", minimum: 0, maximum: 100 },
        edgeCases: { type: "NUMBER", minimum: 0, maximum: 100 },
        optimization: { type: "NUMBER", minimum: 0, maximum: 100 },
      },
      required: ["correctness", "style", "edgeCases", "optimization"],
    },
    summary: { type: "STRING" },
    tieredGuidance: { type: "ARRAY", items: { type: "STRING" } },
    improvements: { type: "ARRAY", items: { type: "STRING" } },
    matrixDeltas: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          domain: { type: "STRING", enum: [...DOMAINS] },
          delta: { type: "NUMBER", minimum: -1, maximum: 1 },
        },
        required: ["domain", "delta"],
      },
    },
  },
  required: ["correct", "scores", "summary", "tieredGuidance", "improvements", "matrixDeltas"],
};

export async function evaluateCode(
  code: string,
  exercise: ExerciseDef,
  tier: Tier
): Promise<{ evaluation: Evaluation; source: "ai" | "mock" }> {
  const tone =
    tier === "beginner"
      ? "Use encouraging, guided language with small hints."
      : tier === "intermediate"
        ? "Give targeted corrections tied to concepts."
        : "Give design- and optimization-level critique.";

  const prompt =
    `Evaluate this student code for exercise "${exercise.title}".\n` +
    `Exercise: ${exercise.prompt}\n` +
    `Checks: ${exercise.checks.map((c) => c.description).join("; ")}\n` +
    `Student tier: ${tier}. ${tone}\n` +
    `Code:\n${code}`;

  const { result, source } = await generateStructured({
    prompt,
    schema: evaluationSchema,
    responseSchema: EVALUATION_JSON_SCHEMA,
    mock: () => mockEvaluation(code, exercise.checks, tier),
  });
  return { evaluation: result, source };
}
