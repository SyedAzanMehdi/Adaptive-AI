import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import {
  APPLICATION_STAGES,
  applicationRequestSchema,
  applicationUpdateSchema,
  type ApplicationStage,
} from "@edu/shared";
import { ApiError } from "../utils/errors.js";
import { validateBody } from "../utils/validate.js";
import { Application, type IApplication } from "../models/Application.js";
import {
  STAGE_LABEL,
  STAGE_ORDER,
  computePipelineStats,
  toApplicationDto,
} from "../services/pipelineService.js";

export const validateApplication = validateBody(applicationRequestSchema);
export const validateApplicationUpdate = validateBody(applicationUpdateSchema);

type NewApplication = z.infer<typeof applicationRequestSchema>;
type ApplicationPatch = z.infer<typeof applicationUpdateSchema>;

function isDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: number }).code === 11000
  );
}

function toDate(value: string | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function loadOwned(
  id: string | string[] | undefined,
  userId: string,
  role: string
): Promise<IApplication> {
  // Express 5 types route params as `string | string[]`.
  const raw = Array.isArray(id) ? id[0] : id;
  if (!raw || !mongoose.isValidObjectId(raw)) {
    throw new ApiError(404, "NOT_FOUND", "Application not found");
  }
  const doc = await Application.findById(raw);
  if (!doc) throw new ApiError(404, "NOT_FOUND", "Application not found");
  if (role !== "admin" && doc.userId.toString() !== userId) {
    throw new ApiError(403, "FORBIDDEN_OWNER", "You do not own this application");
  }
  return doc;
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const stageParam = req.query.stage;

    let stage: ApplicationStage | null = null;
    if (typeof stageParam === "string" && stageParam.length > 0) {
      if (!(APPLICATION_STAGES as readonly string[]).includes(stageParam)) {
        throw new ApiError(400, "VALIDATION_ERROR", `stage must be one of: ${APPLICATION_STAGES.join(", ")}`);
      }
      stage = stageParam as ApplicationStage;
    }

    // One query for the whole pipeline: the stats must describe every stage
    // even when the caller filtered the list down to one.
    const docs = await Application.find({ userId }).sort({ updatedAt: -1 }).limit(200);
    const now = new Date();
    const visible = stage ? docs.filter((d) => d.stage === stage) : docs;

    res.json({
      stages: STAGE_ORDER.map((s) => ({ stage: s, label: STAGE_LABEL[s] })),
      stats: computePipelineStats(docs, now),
      applications: visible.map((d) => toApplicationDto(d, now)),
    });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const body = req.body as NewApplication;

    try {
      const doc = await Application.create({
        userId,
        company: body.company.trim(),
        role: body.role.trim(),
        stage: body.stage,
        location: body.location?.trim() ?? "",
        url: body.url ?? "",
        salaryBand: body.salaryBand?.trim() ?? "",
        notes: body.notes ?? "",
        nextActionAt: toDate(body.nextActionAt),
        stageHistory: [{ stage: body.stage, at: new Date() }],
      });
      res.status(201).json({ application: toApplicationDto(doc) });
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        throw new ApiError(
          409,
          "DUPLICATE_APPLICATION",
          `You are already tracking ${body.role.trim()} at ${body.company.trim()}.`
        );
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const requester = (req as any).user;
    const body = req.body as ApplicationPatch;
    const doc = await loadOwned(req.params.id, requester.id, requester.role);

    const stageChanged = body.stage !== undefined && body.stage !== doc.stage;

    if (body.company !== undefined) doc.company = body.company.trim();
    if (body.role !== undefined) doc.role = body.role.trim();
    if (body.location !== undefined) doc.location = body.location.trim();
    if (body.url !== undefined) doc.url = body.url;
    if (body.salaryBand !== undefined) doc.salaryBand = body.salaryBand.trim();
    if (body.notes !== undefined) doc.notes = body.notes;
    if (body.nextActionAt !== undefined) doc.nextActionAt = toDate(body.nextActionAt);
    if (stageChanged) {
      doc.stage = body.stage as ApplicationStage;
      doc.stageHistory.push({ stage: doc.stage, at: new Date() });
    }

    try {
      await doc.save();
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        throw new ApiError(409, "DUPLICATE_APPLICATION", `You are already tracking ${doc.role} at ${doc.company}.`);
      }
      throw err;
    }

    res.json({ application: toApplicationDto(doc) });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const requester = (req as any).user;
    const doc = await loadOwned(req.params.id, requester.id, requester.role);
    await doc.deleteOne();
    res.json({ message: "Application removed", id: doc._id.toString() });
  } catch (err) {
    next(err);
  }
}
