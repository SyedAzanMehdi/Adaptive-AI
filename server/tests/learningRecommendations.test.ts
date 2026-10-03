import { describe, expect, it } from "vitest";
import { CORE_SKILLS, learningPriority, rankSkills, skillGuidance, studyRotation } from "../../client/src/lib/learning.js";

const strong = { score: 0.9, confidence: 0.9, attempts: 8 };
const matrix = Object.fromEntries(CORE_SKILLS.map((domain) => [domain, { ...strong }]));

describe("adaptive learning recommendations", () => {
  it("treats unmeasured skills as exploration rather than failed mastery", () => {
    expect(skillGuidance({ score: 0, confidence: 0, attempts: 0 }).label).toBe("Explore");
    expect(studyRotation({})).toEqual([...CORE_SKILLS, "syntax"]);
  });

  it("ranks a measured weak skill before an unmeasured skill", () => {
    const signals = { ...matrix, algorithms: { score: 0.1, confidence: 0.4, attempts: 3 } };
    delete signals.debugging;
    expect(rankSkills(signals)[0]).toBe("algorithms");
  });

  it("uses confidence to break ties and interleaves the priorities", () => {
    const signals = {
      ...matrix,
      oop: { score: 0.4, confidence: 0.3, attempts: 3 },
      syntax: { score: 0.4, confidence: 0.9, attempts: 8 },
      debugging: { score: 0.5, confidence: 0.9, attempts: 8 },
    };
    expect(learningPriority(signals.oop)).toBeGreaterThan(learningPriority(signals.syntax));
    expect(studyRotation(signals)).toEqual(["oop", "syntax", "oop", "debugging", "syntax", "oop"]);
  });

  it("asks for confirmation of high mastery when confidence is limited", () => {
    expect(skillGuidance({ score: 0.85, confidence: 0.2, attempts: 1 }).label).toBe("Confirm your progress");
    expect(skillGuidance(strong).label).toBe("Stretch your skills");
  });
});
