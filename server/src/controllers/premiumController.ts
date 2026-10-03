import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { autopilotRequestSchema, assessmentRequestSchema, type AssessmentSuite } from "@edu/shared";
import { User } from "../models/User.js";
import { CodeSubmission } from "../models/CodeSubmission.js";
import { getOrCreateMatrix } from "../services/diagnosticService.js";
import { computeMemory, startRescue, answerRescue } from "../services/memoryService.js";
import { computeDna } from "../services/dnaService.js";
import {
  analyzeJobPosting,
  build90DayPlan,
  buildLearningPath,
  computeGap,
  hydrateGapReport,
  type LearningPath,
} from "../services/autopilotService.js";
import { generateAssessment, suiteMinutes } from "../services/assessmentService.js";
import { AutopilotPlan } from "../models/AutopilotPlan.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";
import { validateBody } from "../utils/validate.js";
import { ApiError } from "../utils/errors.js";

// ---------- Subscription (mock billing) ----------

const upgradeSchema = z.object({
  plan: z.enum(["premium"]).default("premium"),
});

export const validateUpgrade = validateBody(upgradeSchema);

export async function upgrade(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById((req as any).user.id);
    if (!user) throw new ApiError(404, "NOT_FOUND", "User not found");
    if (user.plan === "premium") {
      throw new ApiError(409, "ALREADY_PREMIUM", "This account already has Adaptive+ Premium");
    }
    // Mock billing: production would create a Stripe subscription here.
    user.plan = "premium";
    user.premiumSince = new Date();
    await user.save();
    res.json({
      message: "Welcome to Adaptive+ Premium",
      token: signAccessToken(user._id.toString(), user.role, user.plan),
      refreshToken: signRefreshToken(user._id.toString(), user.role, user.plan),
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        profile: user.profile,
        status: user.status,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function planInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById((req as any).user.id);
    if (!user) throw new ApiError(404, "NOT_FOUND", "User not found");
    res.json({
      plan: user.plan,
      premiumSince: user.premiumSince,
      features:
        user.plan === "premium"
          ? [
              "memory-twin",
              "rescue-reviews",
              "struggle-dna-full",
              "career-autopilot",
              "skill-fit-percentage",
              "recruiter-lens",
              "assessment-generator",
              "learning-path-eta",
              "priority-adaptation",
            ]
          : ["diagnostic", "adaptive-lessons", "code-mentorship", "chat"],
    });
  } catch (err) {
    next(err);
  }
}

// ---------- Memory Twin™ ----------

export async function memory(req: Request, res: Response, next: NextFunction) {
  try {
    const matrix = await getOrCreateMatrix((req as any).user.id);
    const domains = computeMemory(matrix);
    const atRisk = domains.filter(
      (d) => d.daysUntilDanger !== null && d.daysUntilDanger <= 7 && d.retention < 0.95
    );
    res.json({ domains, atRisk, generatedAt: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
}

export async function rescueStart(req: Request, res: Response, next: NextFunction) {
  try {
    const matrix = await getOrCreateMatrix((req as any).user.id);
    res.json(await startRescue(matrix));
  } catch (err) {
    next(err);
  }
}

const rescueAnswerSchema = z.object({ selectedIndex: z.number().int().min(0) });
export const validateRescueAnswer = validateBody(rescueAnswerSchema);

export async function rescueAnswer(req: Request, res: Response, next: NextFunction) {
  try {
    const matrix = await getOrCreateMatrix((req as any).user.id);
    res.json(await answerRescue(matrix, req.body.selectedIndex));
  } catch (err) {
    next(err);
  }
}

// ---------- Struggle DNA™ ----------

export async function dna(req: Request, res: Response, next: NextFunction) {
  try {
    const requester = (req as any).user;
    const matrix = await getOrCreateMatrix(requester.id);
    const submissions = await CodeSubmission.find({ userId: requester.id }).limit(100);
    const report = computeDna(matrix, submissions);

    if (requester.plan !== "premium" && requester.role !== "admin") {
      // Free tier: archetype teaser only.
      return res.json({
        tier: "free",
        archetype: report.archetype,
        tagline: report.tagline,
        locked: true,
        message: "Unlock your full Struggle DNA report with Adaptive+ Premium.",
      });
    }

    res.json({ tier: "premium", locked: false, ...report });
  } catch (err) {
    next(err);
  }
}

// ---------- Career Autopilot™ (JD gap analysis + 90-day plan + learning path) ----------

export const validateAutopilot = validateBody(autopilotRequestSchema);
export const validateAssessment = validateBody(assessmentRequestSchema);

/** The student's persisted gap report, restored into the current shape. */
async function loadStoredPlan(userId: string) {
  const stored = await AutopilotPlan.findOne({ userId });
  if (!stored) {
    throw new ApiError(404, "NO_AUTOPILOT", "No Career Autopilot plan yet — generate one from a job description.");
  }
  const report = hydrateGapReport(stored.report);
  if (!report) {
    throw new ApiError(
      409,
      "STALE_AUTOPILOT",
      "Your stored plan predates the current gap model. Paste the job description again to regenerate it."
    );
  }
  return { stored, report };
}

export async function createAutopilot(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const { jobDescription, targetRole, weeklyHours } = req.body as z.infer<typeof autopilotRequestSchema>;
    const hours = weeklyHours ?? 10;

    const matrix = await getOrCreateMatrix(userId);
    const { analysis, source } = await analyzeJobPosting(jobDescription, targetRole);
    const report = computeGap(analysis, matrix.domains);
    const plan = build90DayPlan(report);
    const path = buildLearningPath(report, hours);

    await AutopilotPlan.findOneAndUpdate(
      { userId },
      {
        userId,
        targetRole: report.role,
        jobExcerpt: jobDescription.slice(0, 280),
        source,
        report,
        plan,
        path,
        weeklyHours: hours,
        // Probes aimed at the previous gaps no longer describe this role.
        assessment: null,
        assessmentSource: null,
        assessedAt: null,
        createdAt: new Date(),
      },
      { upsert: true }
    );

    res.json({ source, generatedAt: new Date().toISOString(), report, plan, path });
  } catch (err) {
    next(err);
  }
}

export async function getAutopilot(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const { stored, report } = await loadStoredPlan(userId);
    const hours = stored.weeklyHours || 10;
    // Documents written before the learning path existed get one on read.
    const path = (stored.path as unknown as LearningPath | null) ?? buildLearningPath(report, hours);

    res.json({
      source: stored.source,
      generatedAt: stored.createdAt.toISOString(),
      report,
      plan: stored.plan,
      path,
      hasAssessment: stored.assessment !== null,
    });
  } catch (err) {
    next(err);
  }
}

// ---------- Automated Assessment Generator™ ----------

export async function createAssessment(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const { maxItems } = req.body as z.infer<typeof assessmentRequestSchema>;
    const { stored, report } = await loadStoredPlan(userId);

    const { suite, source } = await generateAssessment(report, maxItems ?? 8);

    stored.assessment = suite as unknown as Record<string, unknown>;
    stored.assessmentSource = source;
    stored.assessedAt = new Date();
    await stored.save();

    res.status(201).json({
      source,
      generatedAt: stored.assessedAt.toISOString(),
      suite,
      minutes: suiteMinutes(suite),
    });
  } catch (err) {
    next(err);
  }
}

export async function getAssessment(req: Request, res: Response, next: NextFunction) {
  try {
    const { stored } = await loadStoredPlan((req as any).user.id);
    if (!stored.assessment) {
      throw new ApiError(404, "NO_ASSESSMENT", "No assessment generated yet — build one from your current gap report.");
    }
    const suite = stored.assessment as unknown as AssessmentSuite;
    res.json({
      source: stored.assessmentSource,
      generatedAt: stored.assessedAt ? stored.assessedAt.toISOString() : null,
      suite,
      minutes: suiteMinutes(suite),
    });
  } catch (err) {
    next(err);
  }
}
