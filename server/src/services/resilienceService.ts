import type { DomainStat } from "../models/CapabilityMatrix.js";
import { AI_FRONTIER, frontierFor } from "../data/aiFrontier.js";

// AI-Resilience Score™ — personal automation-exposure forecast.
//
// Unlike Domain Compass™ (generic, field-level demand trends for everyone),
// this is computed from the student's own measured Capability Matrix: it
// weights each domain's AI-automation exposure by how much of the student's
// actual demonstrated strength sits there, so the score reflects *their*
// exposure, not the industry's. Re-running it after `AI_FRONTIER` is
// re-tuned (as AI capability advances) changes the forecast without the
// student doing anything — the forecast evolves with AI, not just with them.

export interface DomainResilience {
  domain: string;
  label: string;
  mastery: number;
  exposure: number;
  resilience: number;
  rationale: string;
  measured: boolean;
}

export interface ResilienceReport {
  overallExposure: number;
  overallResilience: number;
  confidence: "low" | "medium" | "high";
  domains: DomainResilience[];
  mostExposed: DomainResilience | null;
  pivot: {
    domain: string;
    label: string;
    resilience: number;
    rationale: string;
    nextStep: string;
  } | null;
}

const MEASURED_THRESHOLD = 1; // attempts

export function computeResilience(domains: Record<string, DomainStat>): ResilienceReport {
  const rows: DomainResilience[] = AI_FRONTIER.map((f) => {
    const stat = domains[f.domain];
    const measured = (stat?.attempts ?? 0) >= MEASURED_THRESHOLD;
    const mastery = measured ? Math.round(stat.score * 100) : 0;
    return {
      domain: f.domain,
      label: f.label,
      mastery,
      exposure: f.exposure,
      resilience: 100 - f.exposure,
      rationale: f.rationale,
      measured,
    };
  });

  const measuredRows = rows.filter((r) => r.measured);

  if (measuredRows.length === 0) {
    return {
      overallExposure: 0,
      overallResilience: 0,
      confidence: "low",
      domains: rows,
      mostExposed: null,
      pivot: null,
    };
  }

  const weightSum = measuredRows.reduce((acc, r) => acc + r.mastery, 0);
  const overallExposure =
    weightSum > 0
      ? Math.round(measuredRows.reduce((acc, r) => acc + r.mastery * r.exposure, 0) / weightSum)
      : Math.round(measuredRows.reduce((acc, r) => acc + r.exposure, 0) / measuredRows.length);
  const overallResilience = 100 - overallExposure;

  const confidence: ResilienceReport["confidence"] =
    measuredRows.length >= AI_FRONTIER.length
      ? "high"
      : measuredRows.length >= Math.ceil(AI_FRONTIER.length / 2)
        ? "medium"
        : "low";

  const mostExposed = [...measuredRows].sort((a, b) => b.exposure * b.mastery - a.exposure * a.mastery)[0] ?? null;

  // Pivot target: the domain with the best resilience that the student has
  // NOT yet mastered — the lowest-automation-risk place with real headroom.
  // If every measured domain is already strong, recommend doubling down on
  // the strongest low-exposure one instead of inventing a gap.
  const underdeveloped = rows
    .filter((r) => r.mastery < 60)
    .sort((a, b) => a.exposure - b.exposure || a.mastery - b.mastery);
  const pivotRow = underdeveloped[0] ?? [...rows].sort((a, b) => a.exposure - b.exposure)[0];
  const pivotFrontier = frontierFor(pivotRow.domain);

  return {
    overallExposure,
    overallResilience,
    confidence,
    domains: rows.sort((a, b) => b.exposure - a.exposure),
    mostExposed,
    pivot: pivotFrontier
      ? {
          domain: pivotRow.domain,
          label: pivotRow.label,
          resilience: pivotRow.resilience,
          rationale: pivotFrontier.rationale,
          nextStep: pivotFrontier.pivotHint,
        }
      : null,
  };
}
