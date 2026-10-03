import type { Request, Response, NextFunction } from "express";
import { User, hashPassword } from "../models/User.js";
import { CapabilityMatrix } from "../models/CapabilityMatrix.js";
import { CodeSubmission } from "../models/CodeSubmission.js";
import { ChatMessage } from "../models/ChatMessage.js";
import { AutopilotPlan } from "../models/AutopilotPlan.js";
import { Application } from "../models/Application.js";
import { InterviewSession } from "../models/InterviewSession.js";
import { FreelanceProfile } from "../models/FreelanceProfile.js";
import { DesignCritique } from "../models/DesignCritique.js";
import { AuditLog } from "../models/AuditLog.js";
import { Settings } from "../models/Settings.js";
import { SoftwareHouse } from "../models/SoftwareHouse.js";
import { ApiError } from "../utils/errors.js";

function audit(req: Request, action: string, targetType: string, targetId: string, meta: Record<string, unknown> = {}) {
  return AuditLog.create({ adminId: (req as any).user.id, action, targetType, targetId, meta });
}

function sanitize(user: InstanceType<typeof User>) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    plan: user.plan,
    status: user.status,
    profile: user.profile,
    createdAt: user.createdAt,
  };
}

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const ROLES = ["student", "admin"];
    const STATUSES = ["active", "suspended"];
    const filter: Record<string, unknown> = {};
    const role = req.query.role;
    const status = req.query.status;
    if (typeof role === "string" && ROLES.includes(role)) filter.role = role;
    if (typeof status === "string" && STATUSES.includes(status)) filter.status = status;
    const users = await User.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json({ users: users.map(sanitize) });
  } catch (err) {
    next(err);
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new ApiError(409, "EMAIL_EXISTS", "Email already registered");
    const user = await User.create({
      name,
      email,
      passwordHash: await hashPassword(password),
      role: role === "admin" ? "admin" : "student",
    });
    if (user.role === "student") await CapabilityMatrix.create({ userId: user._id });
    await audit(req, "user.create", "user", user._id.toString(), { role: user.role });
    res.status(201).json({ user: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, "NOT_FOUND", "User not found");

    const { status, role, plan, profile } = req.body ?? {};
    const changes: Record<string, unknown> = {};
    if (status && ["active", "suspended"].includes(status)) {
      user.status = status;
      changes.status = status;
    }
    if (role && ["student", "admin"].includes(role)) {
      user.role = role;
      changes.role = role;
    }
    if (plan && ["free", "premium"].includes(plan)) {
      user.plan = plan;
      user.premiumSince = plan === "premium" ? (user.premiumSince ?? new Date()) : null;
      changes.plan = plan;
    }
    if (profile && typeof profile === "object") {
      if (["beginner", "intermediate", "advanced"].includes(profile.levelTier)) {
        user.profile.levelTier = profile.levelTier;
        changes.levelTier = profile.levelTier;
      }
      if (["analogical", "diagrammatic", "conceptual"].includes(profile.learningStyle)) {
        user.profile.learningStyle = profile.learningStyle;
        changes.learningStyle = profile.learningStyle;
      }
    }
    await user.save();
    await audit(req, "user.update", "user", user._id.toString(), changes);
    res.json({ user: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const targetId = String(req.params.id);
    if (targetId === (req as any).user.id) {
      throw new ApiError(400, "CANNOT_DELETE_SELF", "You cannot delete the account you are signed in as");
    }
    const user = await User.findById(targetId);
    if (!user) throw new ApiError(404, "NOT_FOUND", "User not found");

    await Promise.all([
      CapabilityMatrix.deleteMany({ userId: user._id }),
      CodeSubmission.deleteMany({ userId: user._id }),
      ChatMessage.deleteMany({ userId: user._id }),
      AutopilotPlan.deleteMany({ userId: user._id }),
      Application.deleteMany({ userId: user._id }),
      InterviewSession.deleteMany({ userId: user._id }),
      FreelanceProfile.deleteMany({ userId: user._id }),
      DesignCritique.deleteMany({ userId: user._id }),
    ]);
    await user.deleteOne();
    await audit(req, "user.delete", "user", targetId, { email: user.email, role: user.role });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

function sanitizeHouse(doc: InstanceType<typeof SoftwareHouse>) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    region: doc.region,
    country: doc.country,
    city: doc.city,
    description: doc.description,
    hiringFocus: doc.hiringFocus,
    approved: doc.approved,
    addedBy: doc.addedBy?.toString() ?? null,
    createdAt: doc.createdAt,
  };
}

export async function listSoftwareHouses(req: Request, res: Response, next: NextFunction) {
  try {
    const status = req.query.status;
    const filter: Record<string, unknown> = {};
    if (status === "pending") filter.approved = false;
    else if (status === "approved") filter.approved = true;
    const docs = await SoftwareHouse.find(filter).sort({ createdAt: -1 }).limit(500);
    res.json({ softwareHouses: docs.map(sanitizeHouse) });
  } catch (err) {
    next(err);
  }
}

export async function createSoftwareHouse(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body;
    const doc = await SoftwareHouse.create({
      name: body.name.trim(),
      region: body.region,
      country: body.country.trim(),
      city: body.city?.trim() ?? "",
      description: body.description ?? "",
      hiringFocus: body.hiringFocus ?? [],
      addedBy: (req as any).user.id,
      approved: true,
    });
    await audit(req, "software_house.create", "software_house", doc._id.toString(), { name: doc.name });
    res.status(201).json({ softwareHouse: sanitizeHouse(doc) });
  } catch (err) {
    next(err);
  }
}

export async function updateSoftwareHouse(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await SoftwareHouse.findById(req.params.id);
    if (!doc) throw new ApiError(404, "NOT_FOUND", "Software house not found");

    const body = req.body ?? {};
    const changes: Record<string, unknown> = {};
    const fields = ["name", "region", "country", "city", "description"] as const;
    for (const f of fields) {
      if (body[f] !== undefined) {
        (doc as any)[f] = body[f];
        changes[f] = body[f];
      }
    }
    if (Array.isArray(body.hiringFocus)) {
      doc.hiringFocus = body.hiringFocus;
      changes.hiringFocus = body.hiringFocus;
    }
    if (typeof body.approved === "boolean") {
      doc.approved = body.approved;
      changes.approved = body.approved;
    }

    await doc.save();
    await audit(req, "software_house.update", "software_house", doc._id.toString(), changes);
    res.json({ softwareHouse: sanitizeHouse(doc) });
  } catch (err) {
    next(err);
  }
}

export async function deleteSoftwareHouse(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await SoftwareHouse.findById(req.params.id);
    if (!doc) throw new ApiError(404, "NOT_FOUND", "Software house not found");
    await doc.deleteOne();
    await audit(req, "software_house.delete", "software_house", req.params.id as string, { name: doc.name });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function getCurriculum(_req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await Settings.findById("global");
    res.json({ curriculum: settings });
  } catch (err) {
    next(err);
  }
}

export async function updateCurriculum(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = (await Settings.findById("global")) ?? (await Settings.create({ _id: "global" }));
    const fields = ["masteryThreshold", "maxDiagnosticItems", "minAttemptsPerDomain", "cacheTtlHours", "submissionLimitPerHour"] as const;
    const changes: Record<string, unknown> = {};
    for (const f of fields) {
      const value = req.body?.[f];
      if (typeof value === "number" && Number.isFinite(value)) {
        (settings as any)[f] = value;
        changes[f] = value;
      }
    }
    await settings.save();
    await audit(req, "curriculum.update", "settings", "global", changes);
    res.json({ curriculum: settings });
  } catch (err) {
    next(err);
  }
}

export async function analytics(_req: Request, res: Response, next: NextFunction) {
  try {
    const [students, admins, suspended, matrices, submissions] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ status: "suspended" }),
      CapabilityMatrix.find({}),
      CodeSubmission.countDocuments({}),
    ]);
    const complete = matrices.filter((m) => m.diagnosticStatus === "complete").length;
    const inProgress = matrices.filter((m) => m.diagnosticStatus === "in_progress").length;

    const domainTotals: Record<string, { total: number; count: number }> = {};
    for (const m of matrices) {
      for (const [domain, stat] of Object.entries(m.domains ?? {})) {
        domainTotals[domain] ??= { total: 0, count: 0 };
        domainTotals[domain].total += stat.score;
        domainTotals[domain].count += 1;
      }
    }
    const averageByDomain = Object.fromEntries(
      Object.entries(domainTotals).map(([d, t]) => [d, +(t.total / t.count).toFixed(3)])
    );

    res.json({
      users: { students, admins, suspended },
      diagnostic: { complete, inProgress, total: matrices.length },
      submissions,
      averageByDomain,
    });
  } catch (err) {
    next(err);
  }
}

export async function auditLog(_req: Request, res: Response, next: NextFunction) {
  try {
    const entries = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100);
    res.json({ entries });
  } catch (err) {
    next(err);
  }
}
