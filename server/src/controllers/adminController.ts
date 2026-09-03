import type { Request, Response, NextFunction } from "express";
import { User, hashPassword } from "../models/User.js";
import { CapabilityMatrix } from "../models/CapabilityMatrix.js";
import { CodeSubmission } from "../models/CodeSubmission.js";
import { AuditLog } from "../models/AuditLog.js";
import { Settings } from "../models/Settings.js";
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
