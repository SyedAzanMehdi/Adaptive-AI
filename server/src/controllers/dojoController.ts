import type { Request, Response, NextFunction } from "express";
import { validateBody } from "../utils/validate.js";
import { ApiError } from "../utils/errors.js";
import { dojoCritiqueRequestSchema } from "@edu/shared";
import { DOJO_CHALLENGES, DOJO_FRAMEWORK, findChallenge } from "../data/dojoChallenges.js";
import { critiqueDesign } from "../services/dojoService.js";
import { DesignCritique } from "../models/DesignCritique.js";

export const validateDojoCritique = validateBody(dojoCritiqueRequestSchema);

export async function listChallenges(_req: Request, res: Response) {
  res.json({ framework: DOJO_FRAMEWORK, challenges: DOJO_CHALLENGES });
}

export async function critique(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const { challengeId, notes } = req.body as { challengeId: string; notes: string };

    const challenge = findChallenge(challengeId);
    if (!challenge) throw new ApiError(404, "NO_CHALLENGE", "Unknown Dojo challenge");

    const { critique: result, source } = await critiqueDesign(challenge, notes);

    await DesignCritique.create({
      userId,
      challengeId,
      notesExcerpt: notes.slice(0, 280),
      critique: result,
      source,
    });

    res.status(201).json({
      source,
      generatedAt: new Date().toISOString(),
      challenge: { id: challenge.id, title: challenge.title, difficulty: challenge.difficulty },
      critique: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function history(req: Request, res: Response, next: NextFunction) {
  try {
    const critiques = await DesignCritique.find({ userId: (req as any).user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ critiques });
  } catch (err) {
    next(err);
  }
}
