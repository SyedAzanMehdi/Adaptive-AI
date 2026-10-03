export interface SkillSignal {
  score: number;
  confidence: number;
  attempts: number;
}

export const CORE_SKILLS = ["syntax", "oop", "data_structures", "algorithms", "debugging"];

export function learningPriority(signal?: SkillSignal): number {
  if (!signal || signal.attempts === 0) return 0.7;
  return (1 - signal.score) * 0.8 + (1 - signal.confidence) * 0.2;
}

export function rankSkills(matrix: Record<string, SkillSignal>): string[] {
  return [...CORE_SKILLS].sort((a, b) => learningPriority(matrix[b]) - learningPriority(matrix[a]));
}

export function skillGuidance(signal?: SkillSignal): { label: string; reason: string } {
  if (!signal || signal.attempts === 0) {
    return { label: "Explore", reason: "No evidence yet. Try a short diagnostic before treating this as a skill gap." };
  }
  if (signal.score < 0.6) return { label: "Build foundations", reason: "Your measured mastery is below 60%. Review a worked example, then solve a small challenge." };
  if (signal.confidence < 0.6) return { label: "Confirm your progress", reason: "The evidence is still limited. Solve a fresh challenge to check whether this skill is secure." };
  return { label: "Stretch your skills", reason: "Your foundation is strong. Practice edge cases and explain the trade-offs in your solution." };
}

export function studyRotation(matrix: Record<string, SkillSignal>): string[] {
  const ranked = rankSkills(matrix);
  const measured = Object.values(matrix).some((signal) => signal.attempts > 0);
  if (!measured) return [...CORE_SKILLS, CORE_SKILLS[0]];
  // Revisit the top priority on days 1, 3, 6; second priority on days 2, 5.
  return [ranked[0], ranked[1], ranked[0], ranked[2], ranked[1], ranked[0]];
}
