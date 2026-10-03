import "./mockAiEnv.js"; // must run before src/config/env.ts is pulled in — forces mock AI
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { interviewScriptSchema } from "@edu/shared";
import { createApp } from "../src/app.js";
import { User, hashPassword } from "../src/models/User.js";
import { CapabilityMatrix } from "../src/models/CapabilityMatrix.js";
import { signAccessToken } from "../src/utils/jwt.js";

let mongod: MongoMemoryServer;
let app: ReturnType<typeof createApp>;
let adminToken: string;
let studentToken: string;
let studentId: string;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri("test"));
  app = createApp();

  const admin = await User.create({
    name: "Admin",
    email: "admin@test.io",
    passwordHash: await hashPassword("Password123!"),
    role: "admin",
  });
  const student = await User.create({
    name: "Student",
    email: "student@test.io",
    passwordHash: await hashPassword("Password123!"),
    role: "student",
  });
  studentId = student._id.toString();
  await CapabilityMatrix.create({ userId: student._id });
  adminToken = signAccessToken(admin._id.toString(), "admin");
  studentToken = signAccessToken(student._id.toString(), "student");
}, 60_000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe("auth", () => {
  it("registers a student and returns a JWT", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ name: "New", email: "new@test.io", password: "Password123!" });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.role).toBe("student");
  });

  it("rejects duplicate email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ name: "Dup", email: "new@test.io", password: "Password123!" });
    expect(res.status).toBe(409);
  });

  it("rejects invalid credentials", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "student@test.io", password: "wrong" });
    expect(res.status).toBe(401);
  });
});

describe("RBAC matrix", () => {
  it("student is blocked from admin routes (403)", async () => {
    for (const path of ["/api/v1/admin/users", "/api/v1/admin/analytics", "/api/v1/admin/audit-log"]) {
      const res = await request(app).get(path).set("Authorization", `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
    }
  });

  it("admin can access admin routes", async () => {
    const res = await request(app).get("/api/v1/admin/users").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  it("unauthenticated requests are rejected (401)", async () => {
    const res = await request(app).get("/api/v1/student/me");
    expect(res.status).toBe(401);
  });

  it("tampered tokens are rejected (401)", async () => {
    const tampered = studentToken.slice(0, -2) + "xx";
    const res = await request(app).get("/api/v1/student/me").set("Authorization", `Bearer ${tampered}`);
    expect(res.status).toBe(401);
  });

  it("student cannot start diagnostic for admin-only flow control", async () => {
    const res = await request(app)
      .post("/api/v1/student/diagnostic/start")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(403);
  });
});

describe("cross-user object authorization", () => {
  it("student cannot read another student's submission feedback", async () => {
    const other = await User.create({
      name: "Other",
      email: "other@test.io",
      passwordHash: await hashPassword("Password123!"),
      role: "student",
    });
    const { CodeSubmission } = await import("../src/models/CodeSubmission.js");
    const sub = await CodeSubmission.create({
      userId: other._id,
      exerciseId: "sum-array",
      code: "function sumArray(a){return 0}",
      evaluation: {},
    });
    const res = await request(app)
      .get(`/api/v1/submissions/${sub._id}/feedback`)
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
  });

  it("owner can read their own feedback", async () => {
    const { CodeSubmission } = await import("../src/models/CodeSubmission.js");
    const sub = await CodeSubmission.create({
      userId: studentId,
      exerciseId: "sum-array",
      code: "function sumArray(a){return 0}",
      evaluation: {},
    });
    const res = await request(app)
      .get(`/api/v1/submissions/${sub._id}/feedback`)
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
  });
});

describe("learning loop (mock AI)", () => {
  it(
    "runs diagnostic start -> answer -> submission -> matrix update",
    async () => {
    const start = await request(app)
      .post("/api/v1/student/diagnostic/start")
      .set("Authorization", `Bearer ${studentToken}`);
    expect(start.status).toBe(200);
    expect(start.body.question.choices.length).toBeGreaterThanOrEqual(2);
    expect(start.body.question.correctIndex).toBeUndefined();

    const answer = await request(app)
      .post("/api/v1/student/diagnostic/answer")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ selectedIndex: 0 });
    expect(answer.status).toBe(200);
    expect(typeof answer.body.wasCorrect).toBe("boolean");

    const submission = await request(app)
      .post("/api/v1/submissions")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        exerciseId: "sum-array",
        code: "function sumArray(arr){ let total = 0; for (const n of arr) { total += n; } if (arr.length === 0) return 0; return total; }",
        language: "javascript",
      });
    expect(submission.status).toBe(201);
    expect(submission.body.evaluation.scores.correctness).toBeGreaterThan(0);

    const matrix = await request(app)
      .get("/api/v1/student/matrix")
      .set("Authorization", `Bearer ${studentToken}`);
    expect(matrix.status).toBe(200);
    expect(Object.keys(matrix.body.domains).length).toBeGreaterThan(0);
    },
    30_000
  );
});

describe("general chatbot", () => {
  it("rejects unauthenticated chat", async () => {
    const res = await request(app).post("/api/v1/chat").send({ message: "hi" });
    expect(res.status).toBe(401);
  });

  it("degrades to the knowledge base when Gemini is not configured (never errors)", async () => {
    const { env } = await import("../src/config/env.js");
    const originalKey = env.GEMINI_API_KEY;
    const originalKey2 = env.GEMINI_API_KEY_2;
    env.GEMINI_API_KEY = "";
    env.GEMINI_API_KEY_2 = "";
    try {
      const res = await request(app)
        .post("/api/v1/chat")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ message: "What is recursion?" });
      expect(res.status).toBe(201);
      expect(res.body.reply.content).toBeTruthy();
      expect(res.body.source).toBe("knowledge");
      expect(res.body.degraded).toBe(true);
    } finally {
      env.GEMINI_API_KEY = originalKey;
      env.GEMINI_API_KEY_2 = originalKey2;
    }
  });

  it("keeps history isolated per user", async () => {
    const history = await request(app)
      .get("/api/v1/chat/history")
      .set("Authorization", `Bearer ${studentToken}`);
    expect(history.status).toBe(200);
    expect(Array.isArray(history.body.messages)).toBe(true);
    const firstUserCount = history.body.messages.length;

    const { signAccessToken: sign } = await import("../src/utils/jwt.js");
    const { User: U, hashPassword: hp } = await import("../src/models/User.js");
    const other = await U.create({
      name: "Solo",
      email: "solo@test.io",
      passwordHash: await hp("Password123!"),
      role: "student",
    });
    const otherToken = sign(other._id.toString(), "student");
    const otherHistory = await request(app)
      .get("/api/v1/chat/history")
      .set("Authorization", `Bearer ${otherToken}`);
    // Fresh user must see zero messages even if the first user has some — no cross-user leak.
    expect(otherHistory.body.messages.length).toBe(0);
    expect(firstUserCount).toBeGreaterThanOrEqual(0);
  });

  it(
    "always returns a useful chat reply — real Gemini or a flagged knowledge fallback",
    async () => {
      const { env } = await import("../src/config/env.js");
      if (!env.GEMINI_API_KEY) return; // covered by the no-key test above
      const res = await request(app)
        .post("/api/v1/chat")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ message: "What is recursion?" });
      expect(res.status).toBe(201);
      expect(res.body.reply.content).toBeTruthy();
      expect(["ai", "knowledge"]).toContain(res.body.source);
      // Fallbacks must be transparent, never silent.
      if (res.body.source === "knowledge") expect(res.body.degraded).toBe(true);
    },
    30_000
  );
});

describe("premium subscription (Memory Twin + Struggle DNA)", () => {
  let premiumToken: string;

  it("gates Memory Twin for free users with 402", async () => {
    const res = await request(app)
      .get("/api/v1/premium/memory")
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.status).toBe(402);
    expect(res.body.error.code).toBe("PREMIUM_REQUIRED");
  });

  it("serves a locked DNA teaser to free users", async () => {
    const res = await request(app)
      .get("/api/v1/premium/dna")
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.locked).toBe(true);
    expect(typeof res.body.archetype).toBe("string");
  });

  it("upgrades to premium and unlocks Memory Twin", async () => {
    const upgrade = await request(app)
      .post("/api/v1/premium/upgrade")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ plan: "premium" });
    expect(upgrade.status).toBe(200);
    expect(upgrade.body.user.plan).toBe("premium");
    premiumToken = upgrade.body.token;

    const memory = await request(app)
      .get("/api/v1/premium/memory")
      .set("Authorization", `Bearer ${premiumToken}`);
    expect(memory.status).toBe(200);
    expect(Array.isArray(memory.body.domains)).toBe(true);

    const again = await request(app)
      .post("/api/v1/premium/upgrade")
      .set("Authorization", `Bearer ${premiumToken}`)
      .send({ plan: "premium" });
    expect(again.status).toBe(409);
  });

  it(
    "runs a rescue review that reinforces memory stability",
    async () => {
    const start = await request(app)
      .post("/api/v1/premium/memory/rescue")
      .set("Authorization", `Bearer ${premiumToken}`);
    expect(start.status).toBe(200);
    expect(start.body.question.correctIndex).toBeUndefined();

    const a1 = await request(app)
      .post("/api/v1/premium/memory/rescue/answer")
      .set("Authorization", `Bearer ${premiumToken}`)
      .send({ selectedIndex: 0 });
    expect(a1.status).toBe(200);

    const a2 = await request(app)
      .post("/api/v1/premium/memory/rescue/answer")
      .set("Authorization", `Bearer ${premiumToken}`)
      .send({ selectedIndex: 0 });
    expect(a2.status).toBe(200);
    expect(a2.body.completed).toBe(true);
    expect(a2.body.stabilityDays).toBeGreaterThan(0);
    },
    30_000
  );

  it("returns the full DNA report for premium users", async () => {
    const res = await request(app)
      .get("/api/v1/premium/dna")
      .set("Authorization", `Bearer ${premiumToken}`);
    expect(res.status).toBe(200);
    expect(res.body.locked).toBe(false);
    expect(res.body.axes.length).toBe(4);
    expect(res.body.countermeasures.length).toBeGreaterThan(0);
  });
});

describe("system design dojo", () => {
  const DESIGN_NOTES =
    "Functional requirements: shorten a URL and redirect aliases. Non-functional: high availability and low latency for users. " +
    "Estimate: 500 million URLs, roughly 200 requests per second, storage in GB. " +
    "Data model: a key-value store table mapping short code to long URL in a NoSQL database with an index. " +
    "Scalability: add a cache layer, shard the store, and put a load balancer in front with a read replica.";

  it("lists all six dojo challenges for students", async () => {
    const res = await request(app)
      .get("/api/v1/dojo/challenges")
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.challenges.length).toBe(6);
    expect(res.body.framework.length).toBe(5);
  });

  it("rejects unauthenticated dojo critique", async () => {
    const res = await request(app)
      .post("/api/v1/dojo/critique")
      .send({ challengeId: "url-shortener", notes: DESIGN_NOTES });
    expect(res.status).toBe(401);
  });

  it(
    "critiques a design draft on the 4-axis rubric",
    async () => {
    const res = await request(app)
      .post("/api/v1/dojo/critique")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ challengeId: "url-shortener", notes: DESIGN_NOTES });
    expect(res.status).toBe(201);
    expect(["ai", "mock"]).toContain(res.body.source);
    for (const axis of ["requirements", "estimation", "dataModeling", "scalability"]) {
      expect(res.body.critique.scores[axis]).toBeGreaterThanOrEqual(1);
      expect(res.body.critique.scores[axis]).toBeLessThanOrEqual(5);
    }
    expect(res.body.critique.nextSteps.length).toBeGreaterThan(0);
    },
    30_000
  );

  it("rejects too-short design notes with 400", async () => {
    const res = await request(app)
      .post("/api/v1/dojo/critique")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ challengeId: "url-shortener", notes: "a cache, I guess" });
    expect(res.status).toBe(400);
  });

  it("keeps dojo history per user and records the critique", async () => {
    const res = await request(app)
      .get("/api/v1/dojo/history")
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.critiques.length).toBeGreaterThan(0);
    expect(res.body.critiques[0].challengeId).toBe("url-shortener");
  });

});

describe("AI-Resilience Score", () => {
  it("rejects unauthenticated access", async () => {
    const res = await request(app).get("/api/v1/student/resilience");
    expect(res.status).toBe(401);
  });

  it("computes a weighted resilience report from the student's own matrix", async () => {
    const res = await request(app)
      .get("/api/v1/student/resilience")
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.overallExposure).toBeGreaterThanOrEqual(0);
    expect(res.body.overallExposure).toBeLessThanOrEqual(100);
    expect(res.body.overallResilience).toBe(100 - res.body.overallExposure);
    expect(["low", "medium", "high"]).toContain(res.body.confidence);
    expect(res.body.domains.length).toBe(5);
    for (const d of res.body.domains) {
      expect(d.resilience).toBe(100 - d.exposure);
    }
  });
});

describe("freelance launchpad", () => {
  it("rejects unauthenticated freelance profile generation", async () => {
    const res = await request(app).post("/api/v1/freelance/generate").send({});
    expect(res.status).toBe(401);
  });

  it("returns 404 for latest freelance profile before any generation", async () => {
    const res = await request(app)
      .get("/api/v1/freelance/latest")
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.status).toBe(404);
  });

  it(
    "generates a matrix-driven freelance profile",
    async () => {
    const res = await request(app)
      .post("/api/v1/freelance/generate")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ focus: "backend automation scripts" });
    expect(res.status).toBe(201);
    expect(["ai", "mock"]).toContain(res.body.source);
    expect(res.body.profile.headline.length).toBeGreaterThan(0);
    expect(res.body.profile.skills.length).toBeGreaterThanOrEqual(3);
    expect(res.body.profile.gigs.length).toBeGreaterThanOrEqual(2);
    expect(res.body.profile.hourlyRateUsd).toBeGreaterThanOrEqual(3);
    },
    30_000
  );

  it("serves the latest generated freelance profile afterwards", async () => {
    const res = await request(app)
      .get("/api/v1/freelance/latest")
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.profile.headline.length).toBeGreaterThan(0);
  });

  it("rejects an oversized freelance focus with 400", async () => {
    const res = await request(app)
      .post("/api/v1/freelance/generate")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ focus: "x".repeat(300) });
    expect(res.status).toBe(400);
  });
});

describe("backend hardening", () => {
  it("returns 400 INVALID_JSON for malformed bodies", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .set("Content-Type", "application/json")
      .send('{"email": broken');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_JSON");
  });

  it("ignores NoSQL operator injection in admin user filters", async () => {
    const injected = await request(app)
      .get("/api/v1/admin/users?role[$ne]=student")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(injected.status).toBe(200);
    const all = await request(app)
      .get("/api/v1/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(injected.body.users.length).toBe(all.body.users.length);
  });

  it("filters users by a valid role", async () => {
    const res = await request(app)
      .get("/api/v1/admin/users?role=student")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.users.length).toBeGreaterThan(0);
    expect(res.body.users.every((u: { role: string }) => u.role === "student")).toBe(true);
  });

  it("health reports db readiness", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.db).toBe("up");
    expect(res.body.aiMode).toBeTruthy();
  });
});

describe("career stack (autopilot fit, assessment, rehearsal, pipeline)", () => {
  const JOB_DESCRIPTION =
    "We are hiring a Frontend Engineer to own our React dashboard. You will build accessible interfaces in " +
    "TypeScript, consume REST APIs written in Node.js and Express, and query SQL data stores. We expect unit " +
    "tests, code review, familiarity with CI/CD, and clear written communication with designers and PMs.";

  let careerId: string;
  let careerFreeToken: string;
  let careerPremiumToken: string;
  let rivalToken: string;
  let sessionId: string;
  let firstPrompt: string;
  let applicationId: string;

  beforeAll(async () => {
    const career = await User.create({
      name: "Career",
      email: "career@test.io",
      passwordHash: await hashPassword("Password123!"),
      role: "student",
    });
    const rival = await User.create({
      name: "Rival",
      email: "rival@test.io",
      passwordHash: await hashPassword("Password123!"),
      role: "student",
    });
    careerId = career._id.toString();
    await CapabilityMatrix.create({ userId: career._id });
    await CapabilityMatrix.create({ userId: rival._id });
    // The plan is read from the verified JWT claim, never from the database or
    // the request body, so the same user yields both a free and a premium token.
    careerFreeToken = signAccessToken(careerId, "student");
    careerPremiumToken = signAccessToken(careerId, "student", "premium");
    rivalToken = signAccessToken(rival._id.toString(), "student");
  }, 60_000);

  describe("skill match, gap analysis and the assessment generator", () => {
    it("rejects unauthenticated autopilot access", async () => {
      const res = await request(app).get("/api/v1/premium/autopilot");
      expect(res.status).toBe(401);
    });

    it("gates the gap report for free users with 402", async () => {
      const res = await request(app)
        .get("/api/v1/premium/autopilot")
        .set("Authorization", `Bearer ${careerFreeToken}`);
      expect(res.status).toBe(402);
      expect(res.body.error.code).toBe("PREMIUM_REQUIRED");
    });

    it("returns a fit percentage, tiered gaps and a recruiter lens for premium users", async () => {
      const res = await request(app)
        .post("/api/v1/premium/autopilot")
        .set("Authorization", `Bearer ${careerPremiumToken}`)
        .send({ jobDescription: JOB_DESCRIPTION, targetRole: "Frontend Engineer", weeklyHours: 10 });
      expect(res.status).toBe(200);
      expect(["ai", "mock"]).toContain(res.body.source);

      const { report, path } = res.body;
      for (const key of ["overall", "primary", "secondary", "technical", "soft"]) {
        expect(report.fit[key]).toBeGreaterThanOrEqual(0);
        expect(report.fit[key]).toBeLessThanOrEqual(100);
      }
      expect(report.readiness).toBe(report.fit.overall);
      expect(report.skills.length).toBeGreaterThan(0);
      for (const skill of report.skills) {
        expect(["primary", "secondary"]).toContain(skill.tier);
        expect(["technical", "soft"]).toContain(skill.kind);
        expect(["strong", "developing", "gap", "unmeasured"]).toContain(skill.status);
      }
      expect(report.missing.technical.length + report.missing.soft.length).toBeGreaterThan(0);
      expect(report.recruiterLens.firstImpression.length).toBeGreaterThan(0);
      expect(report.recruiterLens.screenOutRisk.length).toBeGreaterThan(0);
      expect(report.recruiterLens.singleFix.length).toBeGreaterThan(0);

      // Customized Learning Path + Time-to-Ready ETA ship with the report.
      expect(path.steps.length).toBeGreaterThan(0);
      expect(path.totalHours).toBeGreaterThan(0);
      expect(path.eta.weeklyHours).toBe(10);
      expect(path.eta.weeks).toBeGreaterThan(0);
      expect(path.steps[0].resources.length).toBeGreaterThan(0);
    }, 30_000);

    it("rejects a job description that is too short to analyse", async () => {
      const res = await request(app)
        .post("/api/v1/premium/autopilot")
        .set("Authorization", `Bearer ${careerPremiumToken}`)
        .send({ jobDescription: "hiring a dev" });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("serves the stored plan and reports that no assessment exists yet", async () => {
      const res = await request(app)
        .get("/api/v1/premium/autopilot")
        .set("Authorization", `Bearer ${careerPremiumToken}`);
      expect(res.status).toBe(200);
      expect(res.body.report.fit.overall).toBeGreaterThanOrEqual(0);
      expect(res.body.path.steps.length).toBeGreaterThan(0);
      expect(res.body.hasAssessment).toBe(false);
    });

    it("gates the assessment generator behind premium", async () => {
      const res = await request(app)
        .post("/api/v1/premium/autopilot/assessment")
        .set("Authorization", `Bearer ${careerFreeToken}`)
        .send({ maxItems: 6 });
      expect(res.status).toBe(402);
      expect(res.body.error.code).toBe("PREMIUM_REQUIRED");
    });

    it("returns 404 for the assessment before one is generated", async () => {
      const res = await request(app)
        .get("/api/v1/premium/autopilot/assessment")
        .set("Authorization", `Bearer ${careerPremiumToken}`);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NO_ASSESSMENT");
    });

    it("generates probes aimed at the weak requirements", async () => {
      const res = await request(app)
        .post("/api/v1/premium/autopilot/assessment")
        .set("Authorization", `Bearer ${careerPremiumToken}`)
        .send({ maxItems: 6 });
      expect(res.status).toBe(201);
      expect(["ai", "mock"]).toContain(res.body.source);
      expect(res.body.suite.items.length).toBeGreaterThanOrEqual(3);
      expect(res.body.suite.items.length).toBeLessThanOrEqual(6);
      expect(res.body.minutes).toBeGreaterThan(0);

      for (const item of res.body.suite.items) {
        expect(["quiz", "coding", "interview"]).toContain(item.type);
        if (item.type === "quiz") {
          expect(item.options.length).toBeGreaterThanOrEqual(2);
          expect(item.correctIndex).toBeLessThan(item.options.length);
        } else {
          expect(item.rubric.length).toBeGreaterThan(0);
        }
      }
    }, 30_000);

    it("rejects an out-of-range item count", async () => {
      const res = await request(app)
        .post("/api/v1/premium/autopilot/assessment")
        .set("Authorization", `Bearer ${careerPremiumToken}`)
        .send({ maxItems: 99 });
      expect(res.status).toBe(400);
    });

    it("serves the stored assessment and flags it on the plan", async () => {
      const suite = await request(app)
        .get("/api/v1/premium/autopilot/assessment")
        .set("Authorization", `Bearer ${careerPremiumToken}`);
      expect(suite.status).toBe(200);
      expect(suite.body.suite.items.length).toBeGreaterThan(0);
      // POST and GET must describe the suite identically — the client renders
      // the duration badge from whichever response it happens to hold.
      expect(suite.body.minutes).toBe(
        suite.body.suite.items.reduce((sum: number, item: { minutes: number }) => sum + item.minutes, 0)
      );

      const plan = await request(app)
        .get("/api/v1/premium/autopilot")
        .set("Authorization", `Bearer ${careerPremiumToken}`);
      expect(plan.body.hasAssessment).toBe(true);
    });

    it("clears a stale assessment when the target role changes", async () => {
      const regenerated = await request(app)
        .post("/api/v1/premium/autopilot")
        .set("Authorization", `Bearer ${careerPremiumToken}`)
        .send({ jobDescription: JOB_DESCRIPTION, targetRole: "Backend Engineer" });
      expect(regenerated.status).toBe(200);

      const stale = await request(app)
        .get("/api/v1/premium/autopilot/assessment")
        .set("Authorization", `Bearer ${careerPremiumToken}`);
      // Probes aimed at the previous gaps no longer describe this role.
      expect(stale.status).toBe(404);
      expect(stale.body.error.code).toBe("NO_ASSESSMENT");
    }, 30_000);
  });

  describe("interview rehearsal studio", () => {
    it("rejects unauthenticated script generation", async () => {
      const res = await request(app).post("/api/v1/interview/script").send({});
      expect(res.status).toBe(401);
    });

    it("builds a script for any student with no premium gate", async () => {
      const res = await request(app)
        .post("/api/v1/interview/script")
        .set("Authorization", `Bearer ${careerFreeToken}`)
        .send({});
      expect(res.status).toBe(201);
      expect(["ai", "mock"]).toContain(res.body.source);
      expect(res.body.script.rounds.length).toBeGreaterThanOrEqual(2);
      expect(res.body.minutes).toBeGreaterThan(0);
      expect(res.body.questionCount).toBeGreaterThan(0);
      expect(typeof res.body.hasGapReport).toBe("boolean");
      expect(() =>
        interviewScriptSchema.parse(res.body.script)
      ).not.toThrow();

      sessionId = res.body.sessionId;
      firstPrompt = res.body.script.rounds[0].questions[0].prompt;
    }, 30_000);

    it("honours an explicit target role", async () => {
      const res = await request(app)
        .post("/api/v1/interview/script")
        .set("Authorization", `Bearer ${careerFreeToken}`)
        .send({ role: "Site Reliability Engineer" });
      expect(res.status).toBe(201);
      expect(res.body.script.role.length).toBeGreaterThan(0);
    }, 30_000);

    it("returns 404 for an unknown session", async () => {
      const res = await request(app)
        .get("/api/v1/interview/session/000000000000000000000000")
        .set("Authorization", `Bearer ${careerFreeToken}`);
      expect(res.status).toBe(404);
    });

    it("blocks reading another student's rehearsal", async () => {
      const res = await request(app)
        .get(`/api/v1/interview/session/${sessionId}`)
        .set("Authorization", `Bearer ${rivalToken}`);
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN_OWNER");
    });

    it("lets the owner read their own rehearsal", async () => {
      const res = await request(app)
        .get(`/api/v1/interview/session/${sessionId}`)
        .set("Authorization", `Bearer ${careerFreeToken}`);
      expect(res.status).toBe(200);
      expect(res.body.scorecard).toBeNull();
      expect(res.body.script.rounds.length).toBeGreaterThanOrEqual(2);
    });

    it("rejects a scorecard for a session the caller does not own", async () => {
      const res = await request(app)
        .post("/api/v1/interview/scorecard")
        .set("Authorization", `Bearer ${rivalToken}`)
        .send({ sessionId, entries: [{ prompt: firstPrompt, round: "screening", selfScore: 4 }] });
      expect(res.status).toBe(403);
    });

    it("rejects an out-of-range self score", async () => {
      const res = await request(app)
        .post("/api/v1/interview/scorecard")
        .set("Authorization", `Bearer ${careerFreeToken}`)
        .send({ sessionId, entries: [{ prompt: firstPrompt, round: "screening", selfScore: 9 }] });
      expect(res.status).toBe(400);
    });

    it("scores the rehearsal and returns prep resources", async () => {
      const res = await request(app)
        .post("/api/v1/interview/scorecard")
        .set("Authorization", `Bearer ${careerFreeToken}`)
        .send({
          sessionId,
          entries: [
            { prompt: firstPrompt, round: "screening", selfScore: 4, note: "Rambled on the intro" },
          ],
        });
      expect(res.status).toBe(200);
      expect(res.body.scorecard.overall).toBeGreaterThanOrEqual(0);
      expect(res.body.scorecard.overall).toBeLessThanOrEqual(100);
      expect(res.body.scorecard.answered).toBe(1);
      expect(res.body.scorecard.verdict.length).toBeGreaterThan(0);
      expect(res.body.scorecard.trend).toBe("first");
      expect(Array.isArray(res.body.resources)).toBe(true);

      // Re-scoring must compare against a different session, never itself.
      const again = await request(app)
        .post("/api/v1/interview/scorecard")
        .set("Authorization", `Bearer ${careerFreeToken}`)
        .send({ sessionId, entries: [{ prompt: firstPrompt, round: "screening", selfScore: 5 }] });
      expect(again.status).toBe(200);
      expect(again.body.scorecard.delta).not.toBe(0);
    }, 30_000);

    it("lists the student's rehearsals with a scorecard trend", async () => {
      const res = await request(app)
        .get("/api/v1/interview/history")
        .set("Authorization", `Bearer ${careerFreeToken}`);
      expect(res.status).toBe(200);
      expect(res.body.sessions.length).toBeGreaterThan(0);
      expect(res.body.scoredCount).toBeGreaterThan(0);
      expect(Array.isArray(res.body.trend)).toBe(true);

      const rival = await request(app)
        .get("/api/v1/interview/history")
        .set("Authorization", `Bearer ${rivalToken}`);
      expect(rival.body.sessions.length).toBe(0);
    });
  });

  describe("application pipeline", () => {
    it("rejects unauthenticated pipeline access", async () => {
      const res = await request(app).get("/api/v1/applications");
      expect(res.status).toBe(401);
    });

    it("keeps the student tracker away from admins", async () => {
      const res = await request(app)
        .get("/api/v1/applications")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(403);
    });

    it("creates an application and reports pipeline stats", async () => {
      const res = await request(app)
        .post("/api/v1/applications")
        .set("Authorization", `Bearer ${careerFreeToken}`)
        .send({
          company: "Acme Corp",
          role: "Frontend Engineer",
          stage: "applied",
          location: "Remote",
          url: "https://acme.example/jobs/1",
          salaryBand: "$90k-$120k",
        });
      expect(res.status).toBe(201);
      expect(res.body.application.stageLabel).toBe("Applied");
      expect(res.body.application.daysInStage).toBe(0);
      applicationId = res.body.application.id;

      const list = await request(app)
        .get("/api/v1/applications")
        .set("Authorization", `Bearer ${careerFreeToken}`);
      expect(list.status).toBe(200);
      expect(list.body.applications.length).toBe(1);
      expect(list.body.stats.total).toBe(1);
      expect(list.body.stats.submitted).toBe(1);
      expect(list.body.stages.length).toBe(6);
    });

    it("rejects a duplicate company and role with 409", async () => {
      const res = await request(app)
        .post("/api/v1/applications")
        .set("Authorization", `Bearer ${careerFreeToken}`)
        .send({ company: "Acme Corp", role: "Frontend Engineer" });
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("DUPLICATE_APPLICATION");
    });

    it("rejects a javascript: URL rather than storing it as an href", async () => {
      const res = await request(app)
        .post("/api/v1/applications")
        .set("Authorization", `Bearer ${careerFreeToken}`)
        .send({ company: "XSS Co", role: "Engineer", url: "javascript:alert(document.cookie)" });
      expect(res.status).toBe(400);
    });

    it("rejects an unknown stage and an unparseable date", async () => {
      const badStage = await request(app)
        .post("/api/v1/applications")
        .set("Authorization", `Bearer ${careerFreeToken}`)
        .send({ company: "Stage Co", role: "Engineer", stage: "hired" });
      expect(badStage.status).toBe(400);

      const badDate = await request(app)
        .post("/api/v1/applications")
        .set("Authorization", `Bearer ${careerFreeToken}`)
        .send({ company: "Date Co", role: "Engineer", nextActionAt: "not-a-date" });
      expect(badDate.status).toBe(400);
    });

    it("filters the list by stage without narrowing the stats", async () => {
      const filtered = await request(app)
        .get("/api/v1/applications?stage=saved")
        .set("Authorization", `Bearer ${careerFreeToken}`);
      expect(filtered.status).toBe(200);
      expect(filtered.body.applications.length).toBe(0);
      expect(filtered.body.stats.total).toBe(1);

      const invalid = await request(app)
        .get("/api/v1/applications?stage=hired")
        .set("Authorization", `Bearer ${careerFreeToken}`);
      expect(invalid.status).toBe(400);
    });

    it("advances the stage and appends to the history", async () => {
      const futureActionAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const res = await request(app)
        .patch(`/api/v1/applications/${applicationId}`)
        .set("Authorization", `Bearer ${careerFreeToken}`)
        .send({ stage: "interview", nextActionAt: futureActionAt });
      expect(res.status).toBe(200);
      expect(res.body.application.stage).toBe("interview");
      expect(res.body.application.stageChanges).toBe(2);
      expect(res.body.application.overdue).toBe(false);
    });

    it("blocks updating and deleting another student's application", async () => {
      const patch = await request(app)
        .patch(`/api/v1/applications/${applicationId}`)
        .set("Authorization", `Bearer ${rivalToken}`)
        .send({ stage: "rejected" });
      expect(patch.status).toBe(403);
      expect(patch.body.error.code).toBe("FORBIDDEN_OWNER");

      const del = await request(app)
        .delete(`/api/v1/applications/${applicationId}`)
        .set("Authorization", `Bearer ${rivalToken}`);
      expect(del.status).toBe(403);

      const stillThere = await request(app)
        .get("/api/v1/applications")
        .set("Authorization", `Bearer ${careerFreeToken}`);
      expect(stillThere.body.applications.length).toBe(1);
      expect(stillThere.body.applications[0].stage).toBe("interview");
    });

    it("returns 404 for another user's id and for a malformed id", async () => {
      const rivalRow = await request(app)
        .post("/api/v1/applications")
        .set("Authorization", `Bearer ${rivalToken}`)
        .send({ company: "Rival Co", role: "Backend Engineer" });
      expect(rivalRow.status).toBe(201);

      const crossed = await request(app)
        .get("/api/v1/applications")
        .set("Authorization", `Bearer ${careerFreeToken}`);
      expect(crossed.body.applications.some((a: { id: string }) => a.id === rivalRow.body.application.id)).toBe(false);

      const malformed = await request(app)
        .patch("/api/v1/applications/not-an-object-id")
        .set("Authorization", `Bearer ${careerFreeToken}`)
        .send({ stage: "offer" });
      expect(malformed.status).toBe(404);
    });

    it("deletes an application and confirms it is gone", async () => {
      const del = await request(app)
        .delete(`/api/v1/applications/${applicationId}`)
        .set("Authorization", `Bearer ${careerFreeToken}`);
      expect(del.status).toBe(200);
      expect(del.body.id).toBe(applicationId);

      const after = await request(app)
        .patch(`/api/v1/applications/${applicationId}`)
        .set("Authorization", `Bearer ${careerFreeToken}`)
        .send({ stage: "offer" });
      expect(after.status).toBe(404);
    });
  });
});
