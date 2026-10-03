import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { interviewScriptRequestSchema, interviewScorecardRequestSchema } from "@edu/shared";
import { ApiError } from "../utils/errors.js";
import { validateBody } from "../utils/validate.js";
import { AutopilotPlan } from "../models/AutopilotPlan.js";
import { InterviewSession } from "../models/InterviewSession.js";
import { hydrateGapReport } from "../services/autopilotService.js";
import {
  buildInterviewScript,
  computeScorecard,
  scriptMinutes,
  scriptQuestionCount,
  type InterviewScorecard,
  type ScoreEntry,
} from "../services/interviewService.js";
import { interviewPrepResources } from "../data/learningResources.js";
import type { InterviewScript } from "@edu/shared";

export const validateInterviewScript = validateBody(interviewScriptRequestSchema);
export const validateInterviewScorecard = validateBody(interviewScorecardRequestSchema);

/** The student's stored gap report, or null when they have no Autopilot plan. */
async function loadReport(userId: string) {
  const stored = await AutopilotPlan.findOne({ userId }).limit(1);
  return stored ? hydrateGapReport(stored.report) : null;
}

async function loadOwnedSession(sessionId: string | string[], userId: string, role: string) {
  // Express 5 types route params as `string | string[]`.
  const raw = Array.isArray(sessionId) ? sessionId[0] : sessionId;
  if (!raw || !mongoose.isValidObjectId(raw)) {
    throw new ApiError(404, "NOT_FOUND", "Rehearsal session not found");
  }
  const session = await InterviewSession.findById(raw);
  if (!session) throw new ApiError(404, "NOT_FOUND", "Rehearsal session not found");
  if (role !== "admin" && session.userId.toString() !== userId) {
    throw new ApiError(403, "FORBIDDEN_OWNER", "You do not own this rehearsal session");
  }
  return session;
}

export async function createScript(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const role = typeof req.body?.role === "string" ? req.body.role.trim() : undefined;

    const report = await loadReport(userId);
    const { script, source } = await buildInterviewScript(report, role || undefined);

    const session = await InterviewSession.create({
      userId,
      role: script.role,
      source,
      script,
    });

    res.status(201).json({
      sessionId: session._id.toString(),
      source,
      generatedAt: session.createdAt.toISOString(),
      script,
      minutes: scriptMinutes(script),
      questionCount: scriptQuestionCount(script),
      hasGapReport: report !== null,
    });
  } catch (err) {
    next(err);
  }
}

export async function getSession(req: Request, res: Response, next: NextFunction) {
  try {
    const requester = (req as any).user;
    const session = await loadOwnedSession(req.params.sessionId, requester.id, requester.role);
    const script = session.script as unknown as InterviewScript;
    res.json({
      sessionId: session._id.toString(),
      source: session.source,
      generatedAt: session.createdAt.toISOString(),
      script,
      minutes: scriptMinutes(script),
      questionCount: scriptQuestionCount(script),
      scorecard: session.scorecard,
      scoredAt: session.scoredAt,
    });
  } catch (err) {
    next(err);
  }
}

export async function submitScorecard(req: Request, res: Response, next: NextFunction) {
  try {
    const requester = (req as any).user;
    const { sessionId, entries } = req.body as { sessionId: string; entries: ScoreEntry[] };

    const session = await loadOwnedSession(sessionId, requester.id, requester.role);
    const script = session.script as unknown as InterviewScript;

    // Trend against the most recent *scored* session, excluding this one, so
    // re-scoring the same rehearsal does not compare a session with itself.
    const previous = await InterviewSession.findOne({
      userId: session.userId,
      _id: { $ne: session._id },
      overall: { $ne: null },
    })
      .sort({ scoredAt: -1 })
      .limit(1);

    const scorecard = computeScorecard(
      script,
      entries,
      typeof previous?.overall === "number" ? previous.overall : null
    );

    session.scorecard = scorecard as unknown as Record<string, unknown>;
    session.overall = scorecard.overall;
    session.scoredAt = new Date();
    await session.save();

    res.json({
      sessionId: session._id.toString(),
      scoredAt: session.scoredAt.toISOString(),
      scorecard,
      resources: interviewPrepResources(),
    });
  } catch (err) {
    next(err);
  }
}

export async function history(req: Request, res: Response, next: NextFunction) {
  try {
    const sessions = await InterviewSession.find({ userId: (req as any).user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    const scored = sessions
      .filter((s) => s.overall !== null)
      .sort((a, b) => (a.scoredAt?.getTime() ?? 0) - (b.scoredAt?.getTime() ?? 0))
      .map((s) => ({
        sessionId: s._id.toString(),
        role: s.role,
        overall: s.overall as number,
        verdict: (s.scorecard as unknown as InterviewScorecard | null)?.verdict ?? "",
        focusRound: (s.scorecard as unknown as InterviewScorecard | null)?.focusRound ?? null,
        scoredAt: s.scoredAt?.toISOString() ?? null,
      }));

    res.json({
      total: sessions.length,
      scoredCount: scored.length,
      sessions: sessions.map((s) => ({
        sessionId: s._id.toString(),
        role: s.role,
        source: s.source,
        createdAt: s.createdAt.toISOString(),
        overall: s.overall,
        scored: s.scorecard !== null,
      })),
      // Oldest-first so the client can plot it directly.
      trend: scored,
    });
  } catch (err) {
    next(err);
  }
}
