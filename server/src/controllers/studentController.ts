import type { Request, Response, NextFunction } from "express";
import { User } from "../models/User.js";
import { CodeSubmission } from "../models/CodeSubmission.js";
import {
  startDiagnostic,
  answerDiagnostic,
  getOrCreateMatrix,
} from "../services/diagnosticService.js";
import { computeResilience } from "../services/resilienceService.js";
import { getFieldRecommendation } from "../services/fieldRecommendationService.js";
import { ApiError } from "../utils/errors.js";

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById((req as any).user.id);
    if (!user) throw new ApiError(404, "NOT_FOUND", "User not found");
    res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      plan: user.plan,
      profile: user.profile,
      status: user.status,
    });
  } catch (err) {
    next(err);
  }
}

export async function myMatrix(req: Request, res: Response, next: NextFunction) {
  try {
    const matrix = await getOrCreateMatrix((req as any).user.id);
    res.json({
      domains: matrix.domains,
      diagnosticStatus: matrix.diagnosticStatus,
      historyLength: matrix.history.length,
      completedAt: matrix.completedAt,
    });
  } catch (err) {
    next(err);
  }
}

export async function diagnosticStart(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await startDiagnostic((req as any).user.id));
  } catch (err) {
    next(err);
  }
}

export async function diagnosticAnswer(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await answerDiagnostic((req as any).user.id, req.body.selectedIndex));
  } catch (err) {
    next(err);
  }
}

export async function mySubmissions(req: Request, res: Response, next: NextFunction) {
  try {
    const submissions = await CodeSubmission.find({ userId: (req as any).user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("-code");
    res.json({ submissions });
  } catch (err) {
    next(err);
  }
}

export async function resilience(req: Request, res: Response, next: NextFunction) {
  try {
    const matrix = await getOrCreateMatrix((req as any).user.id);
    res.json(computeResilience(matrix.domains));
  } catch (err) {
    next(err);
  }
}

export async function fieldRecommendation(req: Request, res: Response, next: NextFunction) {
  try {
    const { recommendation, source } = await getFieldRecommendation((req as any).user.id);
    res.json({ recommendation, source });
  } catch (err) {
    next(err);
  }
}
