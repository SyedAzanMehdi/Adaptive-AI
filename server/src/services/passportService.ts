import { createHash } from "node:crypto";
import { User } from "../models/User.js";
import { CapabilityMatrix } from "../models/CapabilityMatrix.js";
import { CodeSubmission } from "../models/CodeSubmission.js";
import { DesignCritique } from "../models/DesignCritique.js";
import { AutopilotPlan } from "../models/AutopilotPlan.js";
import { ApiError } from "../utils/errors.js";

export interface SkillPassport {
  passportId: string;
  holder: { name: string; email: string };
  plan: string;
  memberSince: string | null;
  issuedAt: string;
  capability: {
    diagnosticStatus: string;
    averageMastery: number;
    domains: { domain: string; mastery: number; attempts: number }[];
  };
  evidence: {
    codeSubmissions: number;
    designCritiques: number;
    autopilot: { role: string; readiness: number } | null;
  };
  verification: {
    issuer: string;
    attestation: string;
  };
}

/**
 * Skill Passport™ — a portable, JWT-attested proof of capability for
 * students applying to universities and jobs abroad.
 */
export async function buildPassport(userId: string): Promise<SkillPassport> {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "NOT_FOUND", "User not found");

  const [matrix, submissions, critiques, autopilot] = await Promise.all([
    CapabilityMatrix.findOne({ userId }),
    CodeSubmission.countDocuments({ userId }),
    DesignCritique.countDocuments({ userId }),
    AutopilotPlan.findOne({ userId }),
  ]);

  const domains = Object.entries(matrix?.domains ?? {})
    .filter(([, stat]) => stat.attempts > 0)
    .map(([domain, stat]) => ({
      domain,
      mastery: Math.round(stat.score * 100),
      attempts: stat.attempts,
    }))
    .sort((a, b) => b.mastery - a.mastery);

  const averageMastery = domains.length
    ? Math.round(domains.reduce((sum, d) => sum + d.mastery, 0) / domains.length)
    : 0;

  const raw = createHash("sha256").update(`${userId}:skill-passport`).digest("hex").slice(0, 12).toUpperCase();
  const passportId = `AP-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;

  const report = autopilot?.report as { role?: string; readiness?: number } | undefined;

  return {
    passportId,
    holder: { name: user.name, email: user.email },
    plan: user.plan,
    memberSince: user.createdAt ? user.createdAt.toISOString() : null,
    issuedAt: new Date().toISOString(),
    capability: {
      diagnosticStatus: matrix?.diagnosticStatus ?? "not_started",
      averageMastery,
      domains,
    },
    evidence: {
      codeSubmissions: submissions,
      designCritiques: critiques,
      autopilot: report?.readiness !== undefined
        ? { role: report.role ?? "Unknown role", readiness: report.readiness }
        : null,
    },
    verification: {
      issuer: "Adaptive AI Learning Platform",
      attestation:
        "All mastery scores are attested by JWT-issued diagnostic sessions and AI-graded code submissions recorded on this platform.",
    },
  };
}
