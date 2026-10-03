import "./mockAiEnv.js";
import { describe, expect, it } from "vitest";
import type { InterviewScript } from "@edu/shared";
import { computeScorecard } from "../src/services/interviewService.js";

// Regression test for a real bug: findQuestion's paraphrase fallback used to
// scan every round for a 40-char prompt-prefix match, so two unrelated
// questions that happen to open with the same long phrase (common with
// templated/AI-generated prompts) could cross-attribute an answer to the
// wrong round and skill. The fix scopes the fallback match to the round the
// client actually reported.
describe("interview scorecard question matching", () => {
  const sharedPrefix =
    "Walk me through how you would approach this situation in detail";

  const script: InterviewScript = {
    role: "Backend Engineer",
    rounds: [
      {
        round: "technical",
        minutes: 45,
        questions: [
          {
            prompt: `${sharedPrefix} when designing a URL shortener for millions of daily users.`,
            skill: "System Design Fundamentals",
            probes: ["What about hot keys?"],
            goodAnswerSignals: ["Mentions sharding"],
          },
          {
            prompt: "Explain how a hash map resolves collisions.",
            skill: "Data Structures",
            probes: ["What is the average-case lookup time?"],
            goodAnswerSignals: ["Mentions open addressing or chaining"],
          },
        ],
      },
      {
        round: "behavioral",
        minutes: 30,
        questions: [
          {
            prompt: `${sharedPrefix} when you disagreed with a teammate under a tight deadline.`,
            skill: "Conflict Resolution",
            probes: ["How did you follow up afterward?"],
            goodAnswerSignals: ["Names a concrete resolution"],
          },
          {
            prompt: "Tell me about a time you mentored a junior engineer.",
            skill: "Mentorship",
            probes: ["What did they struggle with?"],
            goodAnswerSignals: ["Describes a specific, measurable outcome"],
          },
        ],
      },
    ],
    closingAdvice: "Rehearse out loud.",
  };

  it("scopes the paraphrase fallback to the reported round instead of matching across rounds", () => {
    // Paraphrased (not an exact match) version of the behavioral question,
    // sharing the same long opening as the technical question above.
    const paraphrasedBehavioral = `${sharedPrefix} after a disagreement with a colleague near a deadline.`;

    const scorecard = computeScorecard(
      script,
      [{ prompt: paraphrasedBehavioral, round: "behavioral", selfScore: 2 }],
      null
    );

    // Before the fix, the fallback scanned every round in script order and
    // would have matched the technical question first, attributing the
    // answer (and the round itself) to "System Design Fundamentals" instead
    // of the actual behavioral skill being rehearsed.
    expect(scorecard.rounds).toHaveLength(1);
    expect(scorecard.rounds[0].round).toBe("behavioral");
    expect(scorecard.rehearseNext).toHaveLength(1);
    expect(scorecard.rehearseNext[0].skill).toBe("Conflict Resolution");
    expect(scorecard.rehearseNext[0].round).toBe("behavioral");
  });
});
