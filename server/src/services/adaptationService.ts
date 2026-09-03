import { adaptationSchema, styleSchema, tierSchema, type Tier, type Style } from "@edu/shared";
import { generateStructured } from "./aiService.js";
import { mockAdaptation } from "./mockAi.js";
import type { ILesson } from "../models/Lesson.js";
import type { ISettings } from "../models/Settings.js";

const ADAPTATION_JSON_SCHEMA = {
  type: "OBJECT",
  properties: {
    rewrittenContent: { type: "STRING" },
    objectivesCovered: { type: "ARRAY", items: { type: "STRING" } },
    style: { type: "STRING", enum: [...styleSchema.options] },
    tier: { type: "STRING", enum: [...tierSchema.options] },
  },
  required: ["rewrittenContent", "objectivesCovered", "style", "tier"],
};

export interface AdaptedLessonResult {
  content: string;
  adapted: boolean;
  cached: boolean;
  source: "ai" | "mock";
  tier: Tier;
  style: Style;
}

export async function getAdaptedLesson(
  lesson: ILesson,
  tier: Tier,
  style: Style,
  settings: ISettings
): Promise<AdaptedLessonResult> {
  const cacheKey = `${lesson.conceptId}:${tier}:${style}`;
  const existing = lesson.adaptations.find((a) => a.cacheKey === cacheKey);
  if (existing) {
    const ageHours = (Date.now() - existing.createdAt.getTime()) / 3_600_000;
    if (ageHours < settings.cacheTtlHours) {
      return { content: existing.content, adapted: true, cached: true, source: "mock", tier, style };
    }
  }

  const prompt =
    `Rewrite the lesson "${lesson.title}" for a ${tier} learner who prefers ${style} explanations. ` +
    `Keep the same learning objectives: ${lesson.objectives.join("; ")}. ` +
    (tier === "beginner"
      ? "Use concrete real-world analogies."
      : tier === "intermediate"
        ? "Use memory/execution diagrams and step-by-step traces."
        : "Focus on internals and design rationale.");

  const { result, source } = await generateStructured({
    prompt,
    schema: adaptationSchema,
    responseSchema: ADAPTATION_JSON_SCHEMA,
    mock: () => mockAdaptation(lesson.title, lesson.objectives, tier, style),
    route: "secondary",
  });

  lesson.adaptations = lesson.adaptations.filter((a) => a.cacheKey !== cacheKey);
  lesson.adaptations.push({
    levelTier: tier,
    style,
    content: result.rewrittenContent,
    cacheKey,
    createdAt: new Date(),
  });
  if (lesson.adaptations.length > 10) lesson.adaptations.shift();
  await lesson.save();

  return { content: result.rewrittenContent, adapted: true, cached: false, source, tier, style };
}
