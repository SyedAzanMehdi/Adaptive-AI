import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { CodeSubmission } from "../models/CodeSubmission.js";
import { User } from "../models/User.js";
import { findExercise } from "../data/exercises.js";
import { evaluateCode } from "../services/evaluationService.js";
import { applyDeltas } from "../services/matrixService.js";
import { getSettings } from "../models/Settings.js";
import { ApiError } from "../utils/errors.js";
import type { Tier } from "@edu/shared";

export async function submitCode(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const { exerciseId, code, language } = req.body;

    const exercise = findExercise(exerciseId);
    if (!exercise) throw new ApiError(404, "EXERCISE_NOT_FOUND", `Unknown exercise: ${exerciseId}`);

    const settings = await getSettings();
    const oneHourAgo = new Date(Date.now() - 3_600_000);
    const recentCount = await CodeSubmission.countDocuments({ userId, createdAt: { $gte: oneHourAgo } });
    if (recentCount >= settings.submissionLimitPerHour) {
      throw new ApiError(429, "RATE_LIMITED", "Submission limit reached; please retry later");
    }

    const user = await User.findById(userId);
    const tier = (user?.profile.levelTier ?? "beginner") as Tier;

    const { evaluation, source } = await evaluateCode(code, exercise, tier);

    const attemptNumber =
      (await CodeSubmission.countDocuments({ userId, exerciseId })) + 1;
    const submission = await CodeSubmission.create({
      userId,
      exerciseId,
      code,
      language,
      evaluation,
      attemptNumber,
    });

    await applyDeltas(userId, evaluation.matrixDeltas);

    res.status(201).json({
      submissionId: submission._id.toString(),
      attemptNumber,
      evaluation,
      source,
      exercise: { exerciseId: exercise.exerciseId, title: exercise.title, domain: exercise.domain },
    });
  } catch (err) {
    next(err);
  }
}

export async function getFeedback(req: Request, res: Response, next: NextFunction) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw new ApiError(404, "NOT_FOUND", "Submission not found");
    }
    const submission = await CodeSubmission.findById(req.params.id);
    if (!submission) throw new ApiError(404, "NOT_FOUND", "Submission not found");
    const requester = (req as any).user;
    if (requester.role !== "admin" && submission.userId.toString() !== requester.id) {
      throw new ApiError(403, "FORBIDDEN_OWNER", "You do not own this submission");
    }
    res.json({
      submissionId: submission._id.toString(),
      exerciseId: submission.exerciseId,
      attemptNumber: submission.attemptNumber,
      createdAt: submission.createdAt,
      evaluation: submission.evaluation,
    });
  } catch (err) {
    next(err);
  }
}

export async function listExercises(_req: Request, res: Response, next: NextFunction) {
  try {
    const { EXERCISES } = await import("../data/exercises.js");
    res.json({
      exercises: EXERCISES.map(({ checks: _c, ...e }) => e),
    });
  } catch (err) {
    next(err);
  }
}
