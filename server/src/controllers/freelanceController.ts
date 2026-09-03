import type { Request, Response, NextFunction } from "express";
import { buildFreelanceProfile } from "../services/freelanceService.js";
import { FreelanceProfile } from "../models/FreelanceProfile.js";
import { ApiError } from "../utils/errors.js";

export async function generate(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const focus = typeof req.body?.focus === "string" ? req.body.focus : undefined;

    const { profile, source } = await buildFreelanceProfile(userId, focus);

    await FreelanceProfile.create({ userId, focus: focus?.trim() ?? "", profile, source });

    res.status(201).json({
      source,
      generatedAt: new Date().toISOString(),
      profile,
    });
  } catch (err) {
    next(err);
  }
}

export async function latest(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await FreelanceProfile.findOne({ userId: (req as any).user.id })
      .sort({ createdAt: -1 })
      .limit(1);
    if (!doc) throw new ApiError(404, "NO_PROFILE", "No freelance profile yet");
    res.json({ source: doc.source, generatedAt: doc.createdAt, profile: doc.profile });
  } catch (err) {
    next(err);
  }
}
