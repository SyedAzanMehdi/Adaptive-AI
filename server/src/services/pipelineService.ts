import { APPLICATION_STAGES, type ApplicationStage } from "@edu/shared";
import type { IApplication } from "../models/Application.js";

// Application Pipeline™ — deterministic tracker maths.
//
// Lives in a service rather than the controller because the conversion and
// time-in-stage figures are the actual product value of the tracker, and the
// client must never recompute them differently.

export const STAGE_ORDER: ApplicationStage[] = [...APPLICATION_STAGES];

export const STAGE_LABEL: Record<ApplicationStage, string> = {
  saved: "Saved",
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  rejected: "Closed — rejected",
};

/** Stages that still need the student to do something. */
const OPEN_STAGES: ApplicationStage[] = ["saved", "applied", "screening", "interview"];
/** Stages that count as the company having responded. */
const PROGRESS_STAGES: ApplicationStage[] = ["screening", "interview", "offer"];
const CLOSED_STAGES: ApplicationStage[] = ["offer", "rejected"];

export interface ApplicationDto {
  id: string;
  company: string;
  role: string;
  stage: ApplicationStage;
  stageLabel: string;
  location: string;
  url: string;
  salaryBand: string;
  notes: string;
  nextActionAt: string | null;
  daysInStage: number;
  daysInPipeline: number;
  overdue: boolean;
  stageChanges: number;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStats {
  total: number;
  byStage: Record<ApplicationStage, number>;
  active: number;
  submitted: number;
  progressed: number;
  responseRate: number;
  overdue: number;
  avgDaysToClose: number | null;
  headline: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function daysSince(from: Date, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - from.getTime()) / DAY_MS));
}

export function isOpenStage(stage: ApplicationStage): boolean {
  return OPEN_STAGES.includes(stage);
}

export function isOverdue(doc: IApplication, now: Date): boolean {
  return (
    doc.nextActionAt !== null &&
    doc.nextActionAt.getTime() < now.getTime() &&
    isOpenStage(doc.stage)
  );
}

export function toApplicationDto(doc: IApplication, now = new Date()): ApplicationDto {
  const lastChange = doc.stageHistory.length > 0
    ? doc.stageHistory[doc.stageHistory.length - 1].at
    : doc.createdAt;
  const overdue = isOverdue(doc, now);

  return {
    id: doc._id.toString(),
    company: doc.company,
    role: doc.role,
    stage: doc.stage,
    stageLabel: STAGE_LABEL[doc.stage],
    location: doc.location,
    url: doc.url,
    salaryBand: doc.salaryBand,
    notes: doc.notes,
    nextActionAt: doc.nextActionAt ? doc.nextActionAt.toISOString() : null,
    daysInStage: daysSince(lastChange, now),
    daysInPipeline: daysSince(doc.createdAt, now),
    overdue,
    stageChanges: doc.stageHistory.length,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function computePipelineStats(
  applications: IApplication[],
  now = new Date()
): PipelineStats {
  const byStage = Object.fromEntries(
    STAGE_ORDER.map((s) => [s, 0])
  ) as Record<ApplicationStage, number>;

  for (const app of applications) byStage[app.stage] += 1;

  const total = applications.length;
  const active = applications.filter((a) => isOpenStage(a.stage)).length;
  // "Saved" rows were never sent, so they must not dilute the response rate.
  const submitted = total - byStage.saved;
  const progressed = PROGRESS_STAGES.reduce((acc, s) => acc + byStage[s], 0);
  const responseRate = submitted > 0 ? Math.round((progressed / submitted) * 100) : 0;
  const overdue = applications.filter((a) => isOverdue(a, now)).length;

  const closed = applications.filter((a) => CLOSED_STAGES.includes(a.stage));
  const avgDaysToClose = closed.length > 0
    ? Math.round(
        closed.reduce((acc, a) => {
          // Notes and reminders can be edited after closure. Use the stage
          // transition timestamp so those edits do not inflate time to close.
          const closedAt = [...a.stageHistory].reverse().find((entry) => entry.stage === a.stage)?.at
            ?? a.updatedAt;
          return acc + Math.max(0, closedAt.getTime() - a.createdAt.getTime());
        }, 0) /
          closed.length /
          DAY_MS
      )
    : null;

  const headline =
    total === 0
      ? "Nothing tracked yet. Add the first role you are eyeing — even before you apply — so the pipeline measures your whole search, not just the rejections."
      : submitted === 0
        ? `${total} role${total === 1 ? "" : "s"} saved, none submitted yet. The clock starts when you apply.`
        : overdue > 0
          ? `${active} live application${active === 1 ? "" : "s"}, ${overdue} with an overdue next step. Clear those before adding new roles.`
          : byStage.offer > 0
            ? `${byStage.offer} offer${byStage.offer === 1 ? "" : "s"} at a ${responseRate}% response rate — well above the typical 2-5% for cold applications.`
            : `${submitted} submitted, ${responseRate}% reached screening or beyond. Average closed loop: ${avgDaysToClose ?? "—"} days.`;

  return {
    total,
    byStage,
    active,
    submitted,
    progressed,
    responseRate,
    overdue,
    avgDaysToClose,
    headline,
  };
}
