import "./mockAiEnv.js"; // must run before src/config/env.ts is pulled in — forces mock AI
import { describe, expect, it } from "vitest";
import mongoose from "mongoose";
import {
  assessmentSuiteSchema,
  interviewScriptSchema,
  type ApplicationStage,
  type AutopilotAnalysis,
} from "@edu/shared";
import {
  buildLearningPath,
  build90DayPlan,
  computeGap,
  deriveTier,
  hydrateGapReport,
  skillKind,
  type GapReport,
} from "../src/services/autopilotService.js";
import { generateAssessment, suiteMinutes } from "../src/services/assessmentService.js";
import { buildInterviewScript, computeScorecard, scriptQuestionCount } from "../src/services/interviewService.js";
import { computePipelineStats, toApplicationDto } from "../src/services/pipelineService.js";
import type { IApplication } from "../src/models/Application.js";
import {
  AREA_QUESTIONS,
  BEHAVIORAL_QUESTIONS,
  DEFAULT_QUESTION,
  DESIGN_QUESTIONS,
  SCREENING_QUESTIONS,
  SKILL_QUESTIONS,
} from "../src/data/interviewQuestions.js";
import { AREA_PROBES, SKILL_PROBES, probeFor } from "../src/data/assessmentBank.js";
import type { DomainStat } from "../src/models/CapabilityMatrix.js";

// ---------- fixtures ----------

const NOW = new Date("2026-09-05T12:00:00Z");

function stat(score: number, attempts = 5): DomainStat {
  return { score, confidence: 0.8, attempts, correct: Math.round(score * attempts) };
}

/** A matrix where algorithms are strong and data structures are weak. */
const MATRIX: Record<string, DomainStat> = {
  syntax: stat(0.82),
  oop: stat(0.6),
  data_structures: stat(0.2),
  algorithms: stat(0.9),
  debugging: stat(0.0, 0), // never attempted → unmeasured
};

const ANALYSIS: AutopilotAnalysis = {
  role: "Frontend Engineer",
  summary: "React-heavy product role with an accessibility focus and a design-system ownership expectation.",
  skills: [
    { name: "Algorithms", area: "cs_fundamentals", importance: 3, coreDomain: "algorithms" },
    { name: "Data Structures", area: "cs_fundamentals", importance: 5, coreDomain: "data_structures" },
    { name: "Debugging & Profiling", area: "cs_fundamentals", importance: 4, coreDomain: "debugging" },
    { name: "React & Frontend Frameworks", area: "web", importance: 5 },
    { name: "HTML, CSS & Accessibility", area: "web", importance: 4 },
    { name: "Communication & Mentorship", area: "soft_skills", importance: 5 },
  ],
};

const REPORT: GapReport = computeGap(ANALYSIS, MATRIX);

function makeApplication(overrides: Partial<IApplication> = {}): IApplication {
  return {
    _id: new mongoose.Types.ObjectId(),
    userId: new mongoose.Types.ObjectId(),
    company: "Acme",
    role: "Backend Engineer",
    stage: "applied",
    location: "",
    url: "",
    salaryBand: "",
    notes: "",
    nextActionAt: null,
    stageHistory: [{ stage: "applied", at: NOW }],
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  } as unknown as IApplication;
}

// ---------- Skill Match & Fit Percentage ----------

describe("skill match and fit percentage", () => {
  it("reports a weighted overall fit and keeps readiness in sync", () => {
    expect(REPORT.fit.overall).toBeGreaterThan(0);
    expect(REPORT.fit.overall).toBeLessThan(100);
    expect(REPORT.readiness).toBe(REPORT.fit.overall);
  });

  it("splits fit across tiers and skill kinds", () => {
    for (const key of ["overall", "primary", "secondary", "technical", "soft"] as const) {
      expect(REPORT.fit[key]).toBeGreaterThanOrEqual(0);
      expect(REPORT.fit[key]).toBeLessThanOrEqual(100);
    }
    expect(REPORT.fit.soft).toBeGreaterThan(0);
  });

  it("weights a weak must-have more heavily than a weak nice-to-have", () => {
    const weakPrimary = computeGap(
      {
        role: "A",
        summary: "s",
        skills: [
          { name: "Algorithms", area: "cs_fundamentals", importance: 5, coreDomain: "algorithms" },
          { name: "Data Structures", area: "cs_fundamentals", importance: 5, coreDomain: "data_structures" },
        ],
      },
      MATRIX
    );
    const weakSecondary = computeGap(
      {
        role: "A",
        summary: "s",
        skills: [
          { name: "Algorithms", area: "cs_fundamentals", importance: 5, coreDomain: "algorithms" },
          { name: "Data Structures", area: "cs_fundamentals", importance: 1, coreDomain: "data_structures" },
        ],
      },
      MATRIX
    );
    // Same weak skill, but demoted to secondary: the overall fit must improve.
    expect(weakSecondary.fit.overall).toBeGreaterThan(weakPrimary.fit.overall);
  });

  it("derives tier from importance but honours an explicit tier", () => {
    expect(deriveTier({ name: "x", area: "web", importance: 5 })).toBe("primary");
    expect(deriveTier({ name: "x", area: "web", importance: 4 })).toBe("primary");
    expect(deriveTier({ name: "x", area: "web", importance: 3 })).toBe("secondary");
    expect(deriveTier({ name: "x", area: "web", importance: 5, tier: "secondary" })).toBe("secondary");
  });

  it("classifies soft skills by area", () => {
    expect(skillKind("soft_skills")).toBe("soft");
    expect(skillKind("web")).toBe("technical");
    expect(skillKind("anything_else")).toBe("technical");
  });
});

// ---------- Gap Analysis ----------

describe("gap analysis", () => {
  it("names every missing skill, split by kind", () => {
    // Data Structures is measured weak; Debugging has zero attempts; React,
    // Accessibility and Communication have no matrix signal at all.
    expect(REPORT.missing.technical).toContain("Data Structures");
    expect(REPORT.missing.technical).toContain("Debugging & Profiling");
    expect(REPORT.missing.technical).toContain("React & Frontend Frameworks");
    expect(REPORT.missing.soft).toEqual(["Communication & Mentorship"]);
    expect(REPORT.missing.technical).not.toContain("Algorithms");
  });

  it("keeps per-kind counts consistent with the overall counts", () => {
    const sum = (kind: "technical" | "soft") =>
      Object.values(REPORT.kindCounts[kind]).reduce((a, b) => a + b, 0);
    expect(sum("technical") + sum("soft")).toBe(REPORT.skills.length);
    for (const status of ["strong", "developing", "gap", "unmeasured"] as const) {
      expect(REPORT.kindCounts.technical[status] + REPORT.kindCounts.soft[status]).toBe(
        REPORT.counts[status]
      );
    }
  });

  it("marks a never-attempted domain as unmeasured, not as a gap", () => {
    const debugging = REPORT.skills.find((s) => s.name === "Debugging & Profiling")!;
    expect(debugging.status).toBe("unmeasured");
    expect(debugging.score).toBeNull();
  });
});

// ---------- Recruiter Lens ----------

describe("recruiter lens", () => {
  it("names the worst must-have as the screen-out risk and the single fix", () => {
    // Data Structures is the only primary requirement with a measured gap.
    expect(REPORT.recruiterLens.screenOutRisk).toContain("Data Structures");
    expect(REPORT.recruiterLens.singleFix).toContain("Data Structures");
    expect(REPORT.recruiterLens.firstImpression).toContain(`${REPORT.fit.overall}%`);
  });

  it("reports no screen-out risk when every requirement is strong", () => {
    const strong = computeGap(
      {
        role: "A",
        summary: "s",
        skills: [{ name: "Algorithms", area: "cs_fundamentals", importance: 5, coreDomain: "algorithms" }],
      },
      MATRIX
    );
    expect(strong.counts.strong).toBe(1);
    expect(strong.recruiterLens.screenOutRisk).toContain("No screen-out risk");
  });
});

// ---------- Automated Assessment Generator ----------

describe("automated assessment generator", () => {
  it("produces one valid probe per targeted gap skill", async () => {
    const { suite, source } = await generateAssessment(REPORT, 8);
    expect(source).toBe("mock");
    expect(() => assessmentSuiteSchema.parse(suite)).not.toThrow();
    expect(suite.items.length).toBeGreaterThanOrEqual(3);

    const skills = suite.items.map((i) => i.skill.toLowerCase());
    expect(new Set(skills).size).toBe(skills.length);
    expect(suiteMinutes(suite)).toBeGreaterThan(0);
    // Every gap skill, not just measured ones, gets probed.
    expect(skills).toContain("data structures");
  }, 30_000);

  it("never targets a skill the student is already strong in", async () => {
    const { suite } = await generateAssessment(REPORT, 12);
    const targeted = suite.items.map((i) => i.skill);
    expect(targeted).not.toContain("Algorithms");
  }, 30_000);

  it("caps the suite at the requested size", async () => {
    const { suite } = await generateAssessment(REPORT, 3);
    expect(suite.items.length).toBe(3);
  }, 30_000);

  // A posting that matches one taxonomy skill used to yield a one-item suite,
  // which fails items.min(3) and reached the student as a 500.
  it("pads a thin report up to the schema minimum", async () => {
    const thin: AutopilotAnalysis = {
      role: "React Developer",
      summary: "Narrow posting naming a single framework.",
      skills: [{ name: "React & Frontend Frameworks", area: "web", importance: 5 }],
    };
    const { suite } = await generateAssessment(computeGap(thin, MATRIX), 8);
    expect(() => assessmentSuiteSchema.parse(suite)).not.toThrow();
    expect(suite.items.length).toBeGreaterThanOrEqual(3);
    expect(suite.items[0].skill).toBe("React & Frontend Frameworks");
    expect(new Set(suite.items.map((i) => i.skill)).size).toBe(suite.items.length);
  }, 30_000);

  it("keeps every bank probe inside the item schema at maximum skill length", () => {
    const LONG = "S".repeat(80);
    for (const [skill, probe] of Object.entries(SKILL_PROBES)) {
      const parsed = assessmentSuiteSchema.shape.items.element.safeParse({ skill, ...probe });
      expect(parsed.success, `${skill}: ${JSON.stringify(parsed.error?.issues)}`).toBe(true);
    }
    for (const area of Object.keys(AREA_PROBES)) {
      const parsed = assessmentSuiteSchema.shape.items.element.safeParse({
        skill: LONG,
        ...probeFor(LONG, area),
      });
      expect(parsed.success, `area ${area}`).toBe(true);
    }
    const fallback = assessmentSuiteSchema.shape.items.element.safeParse({
      skill: LONG,
      ...probeFor(LONG, "no_such_area"),
    });
    expect(fallback.success).toBe(true);
  });

  // A bank whose quiz answers all sit in the same position is passable by
  // always choosing option A, which measures nothing.
  it("spreads quiz answers across option positions", () => {
    const positions = Object.values(SKILL_PROBES)
      .filter((p) => p.type === "quiz")
      .map((p) => p.correctIndex);
    expect(positions.length).toBeGreaterThan(0);
    expect(new Set(positions).size).toBeGreaterThan(1);
    for (const [skill, probe] of Object.entries(SKILL_PROBES)) {
      if (probe.type !== "quiz") continue;
      expect(probe.options, skill).toBeDefined();
      expect(probe.correctIndex, skill).toBeLessThan(probe.options!.length);
      expect(probe.options!.length).toBeGreaterThanOrEqual(4);
    }
  });
});

// ---------- Customized Learning Path + Time-to-Ready ETA ----------

describe("customized learning path", () => {
  const path = buildLearningPath(REPORT, 10);

  it("orders steps so a primary gap comes first", () => {
    expect(path.steps[0].skill).toBe("Data Structures");
    expect(path.steps[0].tier).toBe("primary");
    expect(path.steps.map((s) => s.order)).toEqual(path.steps.map((_, i) => i + 1));
  });

  it("never recommends studying a skill that is already strong", () => {
    expect(path.steps.map((s) => s.skill)).not.toContain("Algorithms");
  });

  it("attaches at least one on-platform resource to every step", () => {
    for (const step of path.steps) {
      expect(step.resources.length).toBeGreaterThan(0);
      expect(step.resources.some((r) => r.kind === "platform"), step.skill).toBe(true);
      expect(step.hours).toBeGreaterThanOrEqual(2);
      expect(step.doneWhen.length).toBeGreaterThan(0);
    }
  });

  it("totals the hours it lists and projects a future ready date", () => {
    expect(path.totalHours).toBeGreaterThanOrEqual(path.steps.reduce((a, s) => a + s.hours, 0));
    expect(path.eta.weeks).toBe(Math.ceil(path.eta.totalHours / path.eta.weeklyHours));
    expect(new Date(path.eta.readyDate).getTime()).toBeGreaterThan(Date.now());
    expect(path.eta.label).toContain("Job-ready by");
    expect(path.eta.assumptions.length).toBeGreaterThan(0);
  });

  it("halves the timeline when the student doubles their weekly hours", () => {
    const slow = buildLearningPath(REPORT, 5);
    const fast = buildLearningPath(REPORT, 10);
    expect(slow.eta.totalHours).toBe(fast.eta.totalHours);
    expect(slow.eta.weeks).toBeGreaterThan(fast.eta.weeks);
  });

  it("drops confidence when most requirements are unmeasured", () => {
    const mostlyUnmeasured = computeGap(
      {
        role: "A",
        summary: "s",
        skills: [
          { name: "React & Frontend Frameworks", area: "web", importance: 5 },
          { name: "HTML, CSS & Accessibility", area: "web", importance: 4 },
          { name: "Cloud Platforms", area: "cloud_devops", importance: 4 },
          { name: "Algorithms", area: "cs_fundamentals", importance: 3, coreDomain: "algorithms" },
        ],
      },
      MATRIX
    );
    expect(buildLearningPath(mostlyUnmeasured, 10).eta.confidence).toBe("low");
  });

  it("caps the visible path at twelve steps", () => {
    const wide: AutopilotAnalysis = {
      role: "Generalist",
      summary: "s",
      skills: Array.from({ length: 20 }, (_, i) => ({
        name: `Unmeasured Skill ${i}`,
        area: "web",
        importance: 3,
      })),
    };
    const widePath = buildLearningPath(computeGap(wide, MATRIX), 10);
    expect(widePath.steps.length).toBe(12);
    expect(widePath.eta.assumptions.join(" ")).toContain("deferred");
  });

  it("still builds a 90-day plan from the same report", () => {
    const plan = build90DayPlan(REPORT);
    expect(plan.phases.length).toBe(3);
    expect(plan.phases[0].weeks[0].focus.length).toBeGreaterThan(0);
    expect(plan.dailyRhythm.length).toBeGreaterThan(0);
  });
});

// ---------- Interview Rehearsal Studio ----------

describe("interview rehearsal studio", () => {
  it("keeps every bank question inside the schema", () => {
    const qSchema = interviewScriptSchema.shape.rounds.element.shape.questions.element;
    const banks: Array<[string, { prompt: string; skill: string; probes: string[]; goodAnswerSignals: string[] }]> = [
      ...Object.entries(SKILL_QUESTIONS).map(([k, v]) => [`SKILL_QUESTIONS[${k}]`, v] as [string, typeof v]),
      ...Object.entries(AREA_QUESTIONS).map(([k, v]) => [`AREA_QUESTIONS[${k}]`, v] as [string, typeof v]),
      ...BEHAVIORAL_QUESTIONS.map((v, i) => [`BEHAVIORAL[${i}]`, v] as [string, typeof v]),
      ...SCREENING_QUESTIONS.map((v, i) => [`SCREENING[${i}]`, v] as [string, typeof v]),
      ...DESIGN_QUESTIONS.map((v, i) => [`DESIGN[${i}]`, v] as [string, typeof v]),
      ["DEFAULT_QUESTION", DEFAULT_QUESTION] as [string, typeof DEFAULT_QUESTION],
    ];
    for (const [label, q] of banks) {
      const parsed = qSchema.safeParse(q);
      expect(parsed.success, `${label}: ${JSON.stringify(parsed.error?.issues)}`).toBe(true);
    }
  });

  it("builds a schema-valid script aimed at the student's weak skills", async () => {
    const { script, source } = await buildInterviewScript(REPORT);
    expect(source).toBe("mock");
    expect(() => interviewScriptSchema.parse(script)).not.toThrow();
    expect(script.rounds.length).toBeGreaterThanOrEqual(2);
    expect(script.rounds.length).toBeLessThanOrEqual(4);
    for (const round of script.rounds) {
      expect(round.questions.length).toBeGreaterThanOrEqual(2);
      expect(round.questions.length).toBeLessThanOrEqual(4);
      expect(round.minutes).toBeGreaterThanOrEqual(5);
      expect(round.minutes).toBeLessThanOrEqual(90);
    }
    const technical = script.rounds.find((r) => r.round === "technical");
    expect(technical).toBeDefined();
    expect(technical!.questions.some((q) => q.skill === "Data Structures")).toBe(true);
    expect(technical!.questions.some((q) => q.skill === "Algorithms")).toBe(false);
  }, 30_000);

  it("is deterministic for the same report and role", async () => {
    const a = await buildInterviewScript(REPORT);
    const b = await buildInterviewScript(REPORT);
    expect(JSON.stringify(a.script)).toBe(JSON.stringify(b.script));
  }, 30_000);

  it("still produces a usable script with no gap report at all", async () => {
    const { script } = await buildInterviewScript(null);
    expect(() => interviewScriptSchema.parse(script)).not.toThrow();
    expect(script.closingAdvice).toContain("Career Autopilot");
  }, 30_000);

  it("scores a perfect rehearsal at 100 and a blank one at 20", async () => {
    const { script } = await buildInterviewScript(REPORT);
    const all = script.rounds.flatMap((r) => r.questions.map((q) => ({ prompt: q.prompt, round: r.round })));

    const perfect = computeScorecard(script, all.map((e) => ({ ...e, selfScore: 5 })), null);
    expect(perfect.overall).toBe(100);
    expect(perfect.average).toBe(5);
    expect(perfect.answered).toBe(scriptQuestionCount(script));
    expect(perfect.rehearseNext.length).toBe(0);
    expect(perfect.focusRound).toBeNull();
    expect(perfect.trend).toBe("first");
    expect(perfect.delta).toBeNull();

    const weak = computeScorecard(script, all.map((e) => ({ ...e, selfScore: 1 })), null);
    expect(weak.overall).toBe(20);
    expect(weak.rehearseNext.length).toBe(6);
    expect(weak.gaps.length).toBeGreaterThan(0);
  }, 30_000);

  it("recovers the skill behind each scored answer from the script", async () => {
    const { script } = await buildInterviewScript(REPORT);
    const technical = script.rounds.find((r) => r.round === "technical")!;
    const target = technical.questions.find((q) => q.skill === "Data Structures")!;

    const card = computeScorecard(
      script,
      [{ prompt: target.prompt, round: "technical", selfScore: 2, note: "rambled" }],
      null
    );
    expect(card.rehearseNext[0].skill).toBe("Data Structures");
    expect(card.rehearseNext[0].goodAnswerSignals.length).toBeGreaterThan(0);
    const scored = card.rounds.find((r) => r.round === "technical");
    expect(scored?.answered).toBe(1);
    // The client renders "answered/total", so the denominator has to travel too.
    expect(scored?.total).toBe(technical.questions.length);
    expect(scored!.total).toBeGreaterThan(scored!.answered);
  }, 30_000);

  it("reports a trend against the previous session", async () => {
    const { script } = await buildInterviewScript(REPORT);
    const all = script.rounds.flatMap((r) => r.questions.map((q) => ({ prompt: q.prompt, round: r.round })));
    const entries = all.map((e) => ({ ...e, selfScore: 4 }));

    expect(computeScorecard(script, entries, 40).trend).toBe("improving");
    expect(computeScorecard(script, entries, 80).trend).toBe("flat");
    expect(computeScorecard(script, entries, 95).trend).toBe("declining");
    expect(computeScorecard(script, entries, 40).delta).toBe(40);
  }, 30_000);
});

// ---------- Application Pipeline ----------

describe("application pipeline", () => {
  it("excludes saved roles from the response rate", () => {
    const apps = [
      makeApplication({ stage: "saved" }),
      makeApplication({ stage: "applied" }),
      makeApplication({ stage: "screening" }),
      makeApplication({ stage: "rejected" }),
    ];
    const stats = computePipelineStats(apps, NOW);
    expect(stats.total).toBe(4);
    expect(stats.submitted).toBe(3);
    expect(stats.progressed).toBe(1);
    expect(stats.responseRate).toBe(33);
    expect(stats.active).toBe(3);
    expect(stats.byStage.saved).toBe(1);
  });

  it("reports 0% rather than NaN on an empty or all-saved pipeline", () => {
    expect(computePipelineStats([], NOW).responseRate).toBe(0);
    expect(computePipelineStats([makeApplication({ stage: "saved" })], NOW).responseRate).toBe(0);
    expect(computePipelineStats([], NOW).avgDaysToClose).toBeNull();
  });

  it("flags an overdue next action only for open stages", () => {
    const past = new Date(NOW.getTime() - 2 * 24 * 60 * 60 * 1000);
    const open = makeApplication({ stage: "screening", nextActionAt: past });
    const closed = makeApplication({ stage: "rejected", nextActionAt: past });
    const future = makeApplication({ stage: "applied", nextActionAt: new Date(NOW.getTime() + 86_400_000) });

    expect(toApplicationDto(open, NOW).overdue).toBe(true);
    expect(toApplicationDto(closed, NOW).overdue).toBe(false);
    expect(toApplicationDto(future, NOW).overdue).toBe(false);
    expect(computePipelineStats([open, closed, future], NOW).overdue).toBe(1);
  });

  it("measures time in stage from the last stage change", () => {
    const app = makeApplication({
      stage: "interview",
      createdAt: new Date(NOW.getTime() - 20 * 86_400_000),
      stageHistory: [
        { stage: "applied", at: new Date(NOW.getTime() - 20 * 86_400_000) },
        { stage: "interview", at: new Date(NOW.getTime() - 3 * 86_400_000) },
      ],
    });
    const dto = toApplicationDto(app, NOW);
    expect(dto.daysInStage).toBe(3);
    expect(dto.daysInPipeline).toBe(20);
    expect(dto.stageChanges).toBe(2);
    expect(dto.stageLabel).toBe("Interview");
  });

  it("averages the closed loop only over finished applications", () => {
    const apps = [
      makeApplication({
        stage: "rejected",
        createdAt: new Date(NOW.getTime() - 10 * 86_400_000),
        updatedAt: NOW,
      }),
      makeApplication({
        stage: "offer",
        createdAt: new Date(NOW.getTime() - 30 * 86_400_000),
        updatedAt: NOW,
      }),
      makeApplication({ stage: "applied" }),
    ];
    expect(computePipelineStats(apps, NOW).avgDaysToClose).toBe(20);
  });

  it("serialises every stage with a label and an ISO next-action date", () => {
    const dto = toApplicationDto(
      makeApplication({ nextActionAt: new Date("2026-09-20T09:00:00Z") }),
      NOW
    );
    expect(dto.nextActionAt).toBe("2026-09-20T09:00:00.000Z");
    const stages: ApplicationStage[] = ["saved", "applied", "screening", "interview", "offer", "rejected"];
    expect(stages.map((s) => toApplicationDto(makeApplication({ stage: s }), NOW).stageLabel)).toEqual([
      "Saved",
      "Applied",
      "Screening",
      "Interview",
      "Offer",
      "Closed — rejected",
    ]);
  });

  it("keeps time to close stable when a closed application's notes are edited", () => {
    const app = makeApplication({
      stage: "offer",
      createdAt: new Date(NOW.getTime() - 30 * 86_400_000),
      updatedAt: NOW,
      stageHistory: [
        { stage: "applied", at: new Date(NOW.getTime() - 30 * 86_400_000) },
        { stage: "offer", at: new Date(NOW.getTime() - 10 * 86_400_000) },
      ],
    });
    expect(computePipelineStats([app], NOW).avgDaysToClose).toBe(20);
  });
});

// ---------- Backwards compatibility ----------

describe("hydrating a stored gap report", () => {
  it("rebuilds the new derived fields on a pre-extension document", () => {
    const legacy = {
      role: "Frontend Engineer",
      summary: "Legacy plan written before tiers existed.",
      readiness: 62,
      skills: [
        { name: "Data Structures", area: "cs_fundamentals", importance: 5, coreDomain: "data_structures", status: "gap", score: 0.2 },
        { name: "Communication & Mentorship", area: "soft_skills", importance: 5, status: "unmeasured", score: null },
      ],
      counts: { strong: 0, developing: 0, gap: 1, unmeasured: 1 },
    };
    const hydrated = hydrateGapReport(legacy);
    expect(hydrated).not.toBeNull();
    expect(hydrated!.skills[0].tier).toBe("primary");
    expect(hydrated!.skills[0].kind).toBe("technical");
    expect(hydrated!.skills[1].kind).toBe("soft");
    expect(hydrated!.fit.overall).toBeGreaterThan(0);
    expect(hydrated!.recruiterLens.singleFix).toContain("Data Structures");
    expect(hydrated!.missing.soft).toEqual(["Communication & Mentorship"]);
    // The rebuilt readiness supersedes the stale stored value.
    expect(hydrated!.readiness).toBe(hydrated!.fit.overall);
  });

  it("tolerates junk values inside a stored skill", () => {
    const hydrated = hydrateGapReport({
      role: "R",
      summary: "s",
      skills: [
        { name: "A", area: "web", importance: 99, status: "not_a_status", score: "high" },
        { name: "B", area: "web" },
        null,
        "nonsense",
        { area: "web", importance: 3 },
      ],
    });
    expect(hydrated).not.toBeNull();
    expect(hydrated!.skills.length).toBe(2);
    expect(hydrated!.skills[0].importance).toBe(5);
    expect(hydrated!.skills[0].status).toBe("unmeasured");
    expect(hydrated!.skills[0].score).toBeNull();
    expect(hydrated!.skills[1].importance).toBe(3);
  });

  it("rejects shapes it cannot use", () => {
    expect(hydrateGapReport(null)).toBeNull();
    expect(hydrateGapReport("nope")).toBeNull();
    expect(hydrateGapReport({ role: "R" })).toBeNull();
    expect(hydrateGapReport({ role: "R", summary: "s", skills: [] })).toBeNull();
    expect(hydrateGapReport({ role: "R", summary: "s", skills: [{ name: "A" }] })).toBeNull();
  });
});
