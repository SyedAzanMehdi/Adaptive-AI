import "./mockAiEnv.js"; // must run before src/config/env.ts is pulled in — forces mock AI
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
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

describe("system design dojo + skill passport + global access", () => {
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

  it("issues a Skill Passport with deterministic id and evidence", async () => {
    const res = await request(app)
      .get("/api/v1/student/passport")
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.passport.passportId).toMatch(/^AP-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/);
    expect(res.body.passport.holder.email).toBe("student@test.io");
    expect(res.body.passport.evidence.designCritiques).toBeGreaterThan(0);

    const again = await request(app)
      .get("/api/v1/student/passport")
      .set("Authorization", `Bearer ${studentToken}`);
    expect(again.body.passport.passportId).toBe(res.body.passport.passportId);
  });

  it("rejects unauthenticated passport access", async () => {
    const res = await request(app).get("/api/v1/student/passport");
    expect(res.status).toBe(401);
  });

  it("serves the Urdu dual-language glossary", async () => {
    const res = await request(app)
      .get("/api/v1/student/glossary")
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.glossary.length).toBeGreaterThanOrEqual(20);
    expect(res.body.glossary[0].urdu).toBeTruthy();
  });
});

describe("global opportunity layer (scholarships + freelance)", () => {
  it("rejects unauthenticated scholarship access", async () => {
    const res = await request(app).get("/api/v1/student/scholarships");
    expect(res.status).toBe(401);
  });

  it("lists the curated scholarship pool with match metadata", async () => {
    const res = await request(app)
      .get("/api/v1/student/scholarships")
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.scholarships.length).toBeGreaterThanOrEqual(15);
    expect(res.body.filters.levels.length).toBeGreaterThan(0);
    for (const s of res.body.scholarships) {
      expect(s.matchScore).toBeGreaterThanOrEqual(0);
      expect(s.matchScore).toBeLessThanOrEqual(100);
      expect(s.nextDeadline).toBeTruthy();
      expect(s.daysLeft).toBeGreaterThan(0);
    }
  });

  it("filters scholarships by level", async () => {
    const res = await request(app)
      .get("/api/v1/student/scholarships?level=phd")
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.scholarships.length).toBeGreaterThan(0);
    expect(res.body.scholarships.every((s: { level: string[] }) => s.level.includes("phd"))).toBe(true);
  });

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
