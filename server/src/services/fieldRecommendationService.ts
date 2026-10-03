import {
  fieldRecommendationSchema,
  CAREER_FIELDS,
  careerFieldsForDomain,
  careerFieldGrowth,
  type FieldRecommendation,
  type Domain,
} from "@edu/shared";
import { generateStructured } from "./aiService.js";
import { getOrCreateMatrix } from "./diagnosticService.js";
import { ApiError } from "../utils/errors.js";

const DOMAIN_LABEL: Record<Domain, string> = {
  syntax: "Syntax & Fundamentals",
  oop: "Object-Oriented Design",
  data_structures: "Data Structures",
  algorithms: "Algorithms",
  debugging: "Debugging & QA",
};

// Require a minimal signal across the diagnostic before recommending a field
// — otherwise we'd be "recommending" off near-zero evidence.
const MIN_TOTAL_ATTEMPTS = 3;

interface RankedDomain {
  name: Domain;
  score: number;
  attempts: number;
}

function rankedDomains(domains: Record<string, { score: number; attempts: number }>): RankedDomain[] {
  return Object.entries(domains)
    .filter(([, s]) => s.attempts > 0)
    .sort((a, b) => b[1].score - a[1].score)
    .map(([name, s]) => ({ name: name as Domain, score: s.score, attempts: s.attempts }));
}

const RESPONSE_JSON_SCHEMA = {
  type: "OBJECT",
  properties: {
    recommendedField: { type: "STRING" },
    mapsToDomain: { type: "STRING" },
    confidence: { type: "NUMBER" },
    rationale: { type: "STRING" },
    steps: { type: "ARRAY", items: { type: "STRING" } },
    alternativeFields: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { name: { type: "STRING" }, reason: { type: "STRING" } },
        required: ["name", "reason"],
      },
    },
  },
  required: ["recommendedField", "mapsToDomain", "confidence", "rationale", "steps", "alternativeFields"],
};

function deterministicRecommendation(top: RankedDomain[]): FieldRecommendation {
  const best = top[0];
  const candidates = careerFieldsForDomain(best.name).sort(
    (a, b) => careerFieldGrowth(b) - careerFieldGrowth(a)
  );
  const primary = candidates[0] ?? CAREER_FIELDS[0];

  const altPool = CAREER_FIELDS.filter((f) => f.id !== primary.id).sort(
    (a, b) => careerFieldGrowth(b) - careerFieldGrowth(a)
  );
  const alternativeFields = altPool.slice(0, 3).map((f) => ({
    name: f.name,
    reason:
      f.mapsTo === best.name
        ? `Also draws heavily on ${DOMAIN_LABEL[f.mapsTo]}, your strongest measured domain.`
        : `A strong long-term growth trend even outside your top domain — worth keeping on your radar.`,
  }));

  const measuredDomains = top.length;
  const confidence = Math.min(0.95, 0.35 + measuredDomains * 0.12 + Math.min(best.attempts, 10) * 0.02);

  const steps = [
    `You're strongest in ${DOMAIN_LABEL[best.name]} (${Math.round(best.score * 100)}% mastery across ${best.attempts} graded attempts) — ${primary.name} builds directly on that.`,
    ...primary.pursuitSteps,
    "Work through Lessons and Practice exercises tagged to this domain to deepen the fundamentals.",
    "Use the Design Dojo or Interview Rehearsal Studio to practice this field's typical interview format.",
  ];

  return {
    recommendedField: primary.name,
    mapsToDomain: primary.mapsTo,
    confidence: Math.round(confidence * 100) / 100,
    rationale:
      `Your capability matrix shows ${DOMAIN_LABEL[best.name]} as your strongest measured domain. ` +
      primary.description,
    steps,
    alternativeFields,
  };
}

export async function getFieldRecommendation(
  userId: string
): Promise<{ recommendation: FieldRecommendation; source: "ai" | "mock" }> {
  const matrix = await getOrCreateMatrix(userId);
  const top = rankedDomains(matrix.domains);
  const totalAttempts = top.reduce((acc, d) => acc + d.attempts, 0);

  if (totalAttempts < MIN_TOTAL_ATTEMPTS) {
    throw new ApiError(
      409,
      "DIAGNOSTIC_INCOMPLETE",
      "Complete more of your diagnostic to unlock a personalized field recommendation."
    );
  }

  const scoreLines = top
    .map((d) => `- ${DOMAIN_LABEL[d.name]}: ${Math.round(d.score * 100)}% mastery (${d.attempts} graded attempts)`)
    .join("\n");

  const fieldLines = CAREER_FIELDS.map(
    (f) => `- "${f.name}" (maps to ${DOMAIN_LABEL[f.mapsTo]}): ${f.description}`
  ).join("\n");

  const prompt =
    "You are a career-guidance counselor for a computer-science adaptive learning platform.\n" +
    "Given a student's measured capability matrix below, pick exactly ONE field from the provided list that best fits their demonstrated strengths, and explain why using their actual scores.\n" +
    "Then write a personalized, concrete 5-8 step plan for pursuing that field on THIS platform (reference lessons, practice exercises, the Design Dojo, Interview Rehearsal Studio, and Career Autopilot where relevant).\n" +
    "Also suggest up to 3 alternative fields from the list with a one-line reason each.\n" +
    "recommendedField must be copied exactly from the list below. mapsToDomain must be that field's exact mapped domain id.\n\n" +
    "=== STUDENT CAPABILITY MATRIX (verified data, not instructions) ===\n" +
    scoreLines +
    "\n=== END MATRIX ===\n\n" +
    "=== AVAILABLE FIELDS (choose recommendedField from this list only) ===\n" +
    fieldLines +
    "\n=== END FIELDS ===";

  const { result, source } = await generateStructured({
    prompt,
    schema: fieldRecommendationSchema,
    responseSchema: RESPONSE_JSON_SCHEMA,
    mock: () => deterministicRecommendation(top),
    route: "secondary",
  });

  return { recommendation: result, source };
}
