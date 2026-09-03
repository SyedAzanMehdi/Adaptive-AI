import type { Request, Response, NextFunction } from "express";
import { Lesson } from "../models/Lesson.js";
import { User } from "../models/User.js";
import { getOrCreateMatrix } from "../services/diagnosticService.js";
import { getAdaptedLesson } from "../services/adaptationService.js";
import { getSettings } from "../models/Settings.js";
import { ApiError } from "../utils/errors.js";
import type { Tier, Style } from "@edu/shared";

export async function listLessons(_req: Request, res: Response, next: NextFunction) {
  try {
    const lessons = await Lesson.find({}, { conceptId: 1, title: 1, domain: 1, objectives: 1 });
    res.json({ lessons });
  } catch (err) {
    next(err);
  }
}

export async function getLesson(req: Request, res: Response, next: NextFunction) {
  try {
    const lesson = await Lesson.findOne({ conceptId: req.params.conceptId });
    if (!lesson) throw new ApiError(404, "NOT_FOUND", "Lesson not found");

    const requester = (req as any).user;
    const settings = await getSettings();
    const matrix = await getOrCreateMatrix(requester.id);
    const domainStat = matrix.domains[lesson.domain];

    const struggling =
      requester.role === "student" &&
      matrix.diagnosticStatus !== "not_started" &&
      domainStat !== undefined &&
      domainStat.score < settings.masteryThreshold;

    if (struggling) {
      const profile = await User.findById(requester.id);
      const tier = (profile?.profile.levelTier ?? "beginner") as Tier;
      const style = (profile?.profile.learningStyle ?? "analogical") as Style;
      const adaptation = await getAdaptedLesson(lesson, tier, style, settings);
      return res.json({
        lesson: {
          conceptId: lesson.conceptId,
          title: lesson.title,
          domain: lesson.domain,
          objectives: lesson.objectives,
        },
        content: adaptation.content,
        adaptation: {
          used: true,
          tier,
          style,
          cached: adaptation.cached,
          source: adaptation.source,
          reason: `Mastery in "${lesson.domain}" (${domainStat!.score.toFixed(2)}) is below threshold ${settings.masteryThreshold}`,
        },
      });
    }

    res.json({
      lesson: {
        conceptId: lesson.conceptId,
        title: lesson.title,
        domain: lesson.domain,
        objectives: lesson.objectives,
      },
      content: lesson.canonicalContent,
      adaptation: { used: false },
    });
  } catch (err) {
    next(err);
  }
}
