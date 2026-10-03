import type { Domain } from "@edu/shared";

// AI-Resilience Score™ — a curated, periodically-updated view of how exposed
// each measured competency domain is to current-generation AI automation.
// `exposure` (0-100) is how much of the domain's day-to-day work an AI
// coding assistant can already do unsupervised; `resilience` is its inverse.
// This is the one dataset an admin/maintainer re-tunes as AI capability
// advances, which is what makes the forecast evolve with AI rather than
// just with the student.
export interface FrontierEntry {
  domain: Domain;
  label: string;
  exposure: number;
  rationale: string;
  pivotHint: string;
}

export const AI_FRONTIER: FrontierEntry[] = [
  {
    domain: "syntax",
    label: "Syntax & Language Fundamentals",
    exposure: 85,
    rationale:
      "Boilerplate, language syntax, and idiomatic one-liners are exactly what code-completion models are trained hardest on — this is the most automatable layer of software work today.",
    pivotHint: "Treat syntax fluency as a baseline, not a differentiator — invest the hours it frees up into judgment-heavy skills instead.",
  },
  {
    domain: "data_structures",
    label: "Data Structures",
    exposure: 65,
    rationale:
      "Standard structures and their canonical operations are well-represented in training data, so AI assists strongly here — but picking the right structure for a novel, resource-constrained problem still takes judgment.",
    pivotHint: "Push past textbook structures into the trade-off reasoning (memory vs. speed vs. concurrency) that AI still gets wrong under constraints.",
  },
  {
    domain: "algorithms",
    label: "Algorithms",
    exposure: 55,
    rationale:
      "AI reproduces known algorithms reliably but still struggles to design or correctly adapt one for a genuinely novel constraint set without human-checked reasoning.",
    pivotHint: "Novel algorithmic design and complexity trade-off analysis age well; rote implementation of known algorithms does not.",
  },
  {
    domain: "oop",
    label: "Object-Oriented Design",
    exposure: 50,
    rationale:
      "AI writes individual classes fluently, but coherent system-level architecture decisions — the ones that hold up as a codebase grows — still need a human owning the judgment call.",
    pivotHint: "Shift focus from writing classes to architecting systems: the decisions that span files and teams are where the durable value sits.",
  },
  {
    domain: "debugging",
    label: "Debugging",
    exposure: 40,
    rationale:
      "AI is strong at spotting textbook bugs but weak at reasoning through novel, multi-system failures with incomplete information — exactly the kind of debugging senior engineers are paid for.",
    pivotHint: "This is your most future-proof measured skill today — lean into deep, cross-system debugging as a specialization.",
  },
];

export function frontierFor(domain: string): FrontierEntry | undefined {
  return AI_FRONTIER.find((f) => f.domain === domain);
}
