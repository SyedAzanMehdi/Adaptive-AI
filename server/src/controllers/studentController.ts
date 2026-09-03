import type { Request, Response, NextFunction } from "express";
import { User } from "../models/User.js";
import { CodeSubmission } from "../models/CodeSubmission.js";
import {
  startDiagnostic,
  answerDiagnostic,
  getOrCreateMatrix,
} from "../services/diagnosticService.js";
import { buildPassport } from "../services/passportService.js";
import { matchScholarships, SCHOLARSHIP_FILTER_OPTIONS } from "../services/scholarshipService.js";
import { URDU_GLOSSARY } from "../data/urduGlossary.js";
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

export async function passport(req: Request, res: Response, next: NextFunction) {
  try {
    const passport = await buildPassport((req as any).user.id);
    res.json({ passport });
  } catch (err) {
    next(err);
  }
}

export async function glossary(_req: Request, res: Response) {
  res.json({ glossary: URDU_GLOSSARY });
}

export async function scholarships(req: Request, res: Response) {
  const { level, country, field } = req.query as Record<string, string | undefined>;
  const matched = matchScholarships({ level, country, field });
  res.json({
    scholarships: matched,
    filters: SCHOLARSHIP_FILTER_OPTIONS,
    total: matched.length,
  });
}
