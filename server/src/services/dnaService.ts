// Struggle DNA™ — profiles HOW a student fails, not just what they know.
// Mines diagnostic history and code submissions for error archetypes and turns
// them into a personal cognitive profile with targeted countermeasures.

import type { ICapabilityMatrix } from "../models/CapabilityMatrix.js";
import type { ICodeSubmission } from "../models/CodeSubmission.js";

export interface DnaAxis {
  axis: string;
  score: number;
  meaning: string;
}

export interface DnaReport {
  archetype: string;
  tagline: string;
  axes: DnaAxis[];
  countermeasures: string[];
  signals: Record<string, number>;
}

const COUNTERMEASURES: Record<string, string[]> = {
  "Depth Climber": [
    "Revisit fundamentals and rebuild them slowly — confidence at easy levels often masks shaky foundations.",
    "After solving an easy version, immediately attempt a harder variant of the same concept.",
  ],
  "Edge-Case Blind": [
    "Before submitting, ask: what happens with empty input, one element, duplicates, or very large values?",
    "Keep a personal edge-case checklist and run it on every submission.",
  ],
  "Momentum Loser": [
    "After a wrong answer, pause and re-read the question aloud before choosing again.",
    "Practice recovery drills: deliberately solve one easy question after each hard miss.",
  ],
  "Builder First": [
    "Your solutions work — now make them readable. Rename one vague variable per exercise.",
    "Add a one-line comment describing intent before writing code; it forces structure.",
  ],
  "Steady Climber": [
    "Keep spacing your practice — consistency is your superpower.",
    "Raise the difficulty ceiling: pick exercises one tier above your comfort zone.",
  ],
};

export function computeDna(matrix: ICapabilityMatrix, submissions: ICodeSubmission[]): DnaReport {
  const history = matrix.history;

  // Recovery: how often the student answers correctly right after a miss.
  let recoveries = 0;
  let missOpportunities = 0;
  for (let i = 1; i < history.length; i++) {
    if (!history[i - 1].correct) {
      missOpportunities++;
      if (history[i].correct) recoveries++;
    }
  }
  const resilience = missOpportunities === 0 ? 1 : recoveries / missOpportunities;

  // Difficulty cliff: accuracy on easy (<=2) vs hard (>=4) items.
  const easy = history.filter((h) => h.difficulty <= 2);
  const hard = history.filter((h) => h.difficulty >= 4);
  const acc = (items: typeof history) =>
    items.length === 0 ? null : items.filter((i) => i.correct).length / items.length;
  const easyAcc = acc(easy);
  const hardAcc = acc(hard);
  const cliffDrop = easyAcc !== null && hardAcc !== null ? Math.max(0, easyAcc - hardAcc) : 0;

  // Submission-derived signals.
  const evals = submissions
    .map((s) => s.evaluation as { scores?: { style?: number; edgeCases?: number } } | null)
    .filter((e): e is { scores: { style?: number; edgeCases?: number } } => !!e?.scores);
  const avg = (pick: (e: { scores: { style?: number; edgeCases?: number } }) => number | undefined) =>
    evals.length === 0
      ? null
      : evals.reduce((sum, e) => sum + (pick(e) ?? 0), 0) / evals.length;
  const edgeScore = avg((e) => e.scores.edgeCases);
  const styleScore = avg((e) => e.scores.style);

  const axes: DnaAxis[] = [
    {
      axis: "Resilience",
      score: Math.round(resilience * 100),
      meaning: "Recovery rate after a wrong answer",
    },
    {
      axis: "Depth Tolerance",
      score: Math.round((1 - cliffDrop) * 100),
      meaning: "Accuracy retention as difficulty rises",
    },
    {
      axis: "Edge Awareness",
      score: edgeScore === null ? 50 : Math.round(edgeScore),
      meaning: "Handling unusual inputs in code submissions",
    },
    {
      axis: "Craft",
      score: styleScore === null ? 50 : Math.round(styleScore),
      meaning: "Code clarity and structure discipline",
    },
  ];

  let archetype = "Steady Climber";
  if (cliffDrop >= 0.3 && easy.length >= 2 && hard.length >= 2) archetype = "Depth Climber";
  else if (edgeScore !== null && edgeScore < 60 && evals.length >= 1) archetype = "Edge-Case Blind";
  else if (resilience < 0.4 && missOpportunities >= 2) archetype = "Momentum Loser";
  else if (styleScore !== null && styleScore < 60 && evals.length >= 1) archetype = "Builder First";

  const taglines: Record<string, string> = {
    "Depth Climber": "Strong on the surface — the deep end is where the pattern breaks.",
    "Edge-Case Blind": "Core logic lands; the unusual inputs slip through.",
    "Momentum Loser": "One miss tends to cascade — recovery is the trainable skill.",
    "Builder First": "Working code first, polish later. The polish is the next level.",
    "Steady Climber": "Balanced, consistent growth across every dimension.",
  };

  return {
    archetype,
    tagline: taglines[archetype],
    axes,
    countermeasures: COUNTERMEASURES[archetype],
    signals: {
      resilience: +resilience.toFixed(2),
      cliffDrop: +cliffDrop.toFixed(2),
      edgeScore: edgeScore === null ? -1 : Math.round(edgeScore),
      styleScore: styleScore === null ? -1 : Math.round(styleScore),
      samples: history.length + submissions.length,
    },
  };
}
