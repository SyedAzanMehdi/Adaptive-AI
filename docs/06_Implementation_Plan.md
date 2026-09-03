# Implementation Plan

## AI-Driven Adaptive Learning Platform

| Field | Detail |
|---|---|
| **Document ID** | 06_Implementation_Plan |
| **Version** | 1.0 |
| **Date** | 2026-08-29 |
| **Author** | Syed Azan Mehdi Shah |
| **Companion Docs** | 01_PRD, 02_Technical_Documentation, 03_Manual_Guide |
| **Target Duration** | 10 weeks (6 phases) |

---

## 1. Plan Overview

This plan delivers the full platform: **React frontend**, **Express backend**, **MongoDB database**, and the **AI services layer** — using the latest stable versions of the MERN stack plus current AI tooling. Architecture constraints from the technical documentation are preserved: strict MVC, a dedicated `/services` layer for all AI orchestration, JSON Structured Outputs, and JWT + RBAC security.

```
Phase 0  Repo scaffold & tooling           (Week 1)
Phase 1  Backend core: MVC + Auth + RBAC   (Weeks 1-2)
Phase 2  Database layer: models & indexes  (Week 2)
Phase 3  AI services layer                 (Weeks 3-5)
Phase 4  Frontend: student experience      (Weeks 4-7)
Phase 5  Frontend: admin dashboard         (Weeks 6-8)
Phase 6  Hardening, testing, deployment    (Weeks 9-10)
```

---

## 2. Technology Stack (Latest Versions)

### 2.1 Frontend

| Technology | Version | Role |
|---|---|---|
| React | 19.x | UI library (Server Components awareness, Actions) |
| Vite | 7.x | Build tool + dev server |
| TypeScript | 5.9.x | Type safety across the client |
| React Router | 7.x | Routing, loader/action data layer |
| TanStack Query | 5.x | Server-state, caching, retries |
| Zustand | 5.x | Lightweight client state (auth session, UI) |
| Tailwind CSS | 4.x | Styling system |
| Monaco Editor | latest | In-browser code editor |
| Recharts | 3.x | Mastery & analytics charts |
| Vitest + Playwright | latest | Unit + E2E testing |

### 2.2 Backend

| Technology | Version | Role |
|---|---|---|
| Node.js | 24.x LTS | Runtime |
| Express | 5.x | HTTP framework (native async errors) |
| TypeScript | 5.9.x | Type safety shared with client via shared types package |
| Mongoose | 8.x | ODM for MongoDB |
| `@google/genai` | latest | Official Gemini SDK (structured outputs) |
| Zod | 4.x | Request validation + AI output schema validation |
| jsonwebtoken | 9.x | JWT signing/verification |
| bcryptjs / argon2 | latest | Password hashing |
| express-rate-limit | 8.x | Rate limiting on AI endpoints |
| Helmet + CORS | latest | HTTP security headers |
| Vitest + Supertest | latest | Unit + integration tests |

### 2.3 Database

| Technology | Version | Role |
|---|---|---|
| MongoDB | 8.x (Atlas or local) | Document store |
| MongoDB Atlas Search | optional | Lesson content search |
| Compound indexes | — | `userId`, `lessonId`, timestamps on hot paths |

### 2.4 Tooling & DevOps

| Technology | Role |
|---|---|
| ESLint 9 (flat config) + Prettier | Lint/format |
| npm workspaces (monorepo) | `client/`, `server/`, `shared/` |
| GitHub Actions | CI: lint → test → build |
| Docker + docker-compose | Local MongoDB + API for consistent dev |
| Render / Railway / Vercel | Deployment targets (API stateless, SPA static) |

---

## 3. Monorepo Structure

```
adaptive-learning-platform/
├── package.json              # npm workspaces root
├── AGENTS.md
├── docs/
├── shared/                   # Shared TypeScript types & Zod schemas
│   └── src/
│       ├── types.ts          # User, CapabilityMatrix, Feedback DTOs
│       └── schemas.ts        # Zod schemas reused by API + AI validation
├── client/                   # React 19 + Vite 7 + TS
│   └── src/
│       ├── api/              # TanStack Query hooks + axios client
│       ├── components/
│       ├── pages/
│       │   ├── student/      # diagnostic, lesson, playground, dashboard
│       │   └── admin/        # users, curriculum, analytics, audit
│       ├── routes/           # React Router 7 route definitions
│       └── stores/           # Zustand stores
└── server/                   # Express 5 + TS (strict MVC)
    ├── src/
    │   ├── config/           # db, env, gemini client
    │   ├── routes/
    │   ├── controllers/
    │   ├── middleware/       # auth, rbac, ownership, rate-limit, errors
    │   ├── models/
    │   ├── services/         # ★ AI orchestration layer
    │   └── utils/
    └── tests/
```

**Key rule (carried from AGENTS.md):** controllers never import `@google/genai`; all AI orchestration lives in `server/src/services/`.

---

## 4. Phase Breakdown

### Phase 0 — Repository Scaffold & Tooling (Week 1)

**Goal:** monorepo compiles, lints, and runs empty apps.

Tasks:
1. Initialize npm-workspaces monorepo: `client/`, `server/`, `shared/`.
2. Configure TypeScript project references; `shared` exports types + Zod schemas.
3. ESLint 9 flat config + Prettier; pre-commit hook (lint-staged).
4. Docker-compose with MongoDB 8 for local dev.
5. GitHub Actions CI skeleton (lint, typecheck, test).

**Exit criteria:** `npm run dev` boots API + SPA; CI green on empty suites.

### Phase 1 — Backend Core: MVC, Auth, RBAC (Weeks 1-2)

**Goal:** secure API skeleton with full auth and role enforcement.

Tasks:
1. Express 5 app with MVC folders; typed error middleware producing the `{ error: { code, message, status } }` contract.
2. Mongoose connection (`config/db.ts`) with retry + graceful shutdown.
3. Auth endpoints: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh` — bcrypt hashing, JWT (access 15 min + refresh rotation).
4. `authMiddleware` (verify JWT, attach `req.user`) and `rbacMiddleware.requireRole('admin')`.
5. Ownership guard helper: compare resource owner vs JWT subject → 403/404.
6. Audit-log middleware for admin mutations.
7. Rate-limit middleware wired to AI-backed routes.

**Exit criteria:** RBAC matrix test passes (student × admin × every route); forged/tampered tokens rejected with 401; cross-user access denied.

### Phase 2 — Database Layer: Models & Indexes (Week 2)

**Goal:** complete persistence layer matching the technical documentation.

Tasks:
1. Models: `User`, `CapabilityMatrix`, `Lesson`, `CodeSubmission`, `Feedback`, `AuditLog`.
2. Zod schema per model input; Mongoose `pre('save')` password hashing.
3. Indexes: `users.email` unique; `capabilitymatrices.userId`; `codesubmissions { userId: 1, exerciseId: 1 }`; timestamps on feedback/audit.
4. Seed scripts: `seed:admin`, `seed:lessons` (canonical content with objectives).
5. Repository-style data access functions inside controllers' service calls (no raw queries in routes).

**Exit criteria:** seeds produce a working admin + lesson catalog; hot-path queries < 100 ms on sample data.

### Phase 3 — AI Services Layer (Weeks 3-5) ★ Core differentiator

**Goal:** all Gemini orchestration in `/services` with structured outputs and fallbacks.

Tasks:
1. `aiService.ts`: single `@google/genai` client; `generateStructured(prompt, schema)` with timeout (2 s budget), 1 retry on a Flash model, then fallback; usage/latency metrics emitted for admin analytics.
2. **Diagnostic service** — adaptive next-item generation from the running capability vector; completion logic (confidence threshold or max items); matrix computation (0-1 scores + confidence per domain).
3. **Adaptation service** — struggle detection input → tiered rewrite (beginner analogies / intermediate diagrams / advanced internals); objective-parity check; cache keyed `hash(conceptId + levelTier + style)` with TTL.
4. **Evaluation service** — four-dimension grading (correctness, style, edge cases, optimization); tiered constructive feedback; `matrixDeltas` output applied by `matrixService.ts`.
5. All output schemas live in `shared/schemas.ts`, enforced with Zod before any MongoDB write.
6. Fallback paths: canonical lesson on adaptation timeout; queued re-grade on evaluation timeout.

**Exit criteria:** mocked-Gemini service tests pass; schema-violation responses are rejected and fallbacks served; AI latency P95 < 2 s in load test against live API (cached path).

### Phase 4 — Frontend: Student Experience (Weeks 4-7)

**Goal:** full learner journey in the SPA.

Tasks:
1. React Router 7 with route guards driven by auth store (student/admin/public).
2. Auth pages (register/login) + Axios interceptor with silent token refresh.
3. **Diagnostic flow** — question renderer (code snippets with syntax highlighting), adaptive progression, pause/resume, completion screen showing the Capability Matrix.
4. **Lesson viewer** — canonical vs adapted rendering, style/level badge, "why was this rewritten?" explainer.
5. **Code playground** — Monaco editor, language selection, submit → structured feedback panel (score radar + tiered guidance), submission history list.
6. **Mastery dashboard** — Recharts radar/bar of domain scores, weak-area suggestions.
7. TanStack Query for all data access; optimistic UI where safe; skeleton loading states.

**Exit criteria (E2E, Playwright):** register → complete diagnostic → receive adapted lesson → submit code → see structured feedback → matrix updates.

### Phase 5 — Frontend: Admin Dashboard (Weeks 6-8)

**Goal:** protected admin console covering users, curriculum, analytics, audit.

Tasks:
1. Admin route tree guarded by `role === 'admin'`; student tokens never render admin UI.
2. **User management** — table with search/filter, create/suspend/re-role actions with confirmations (each hits audit-logged endpoints).
3. **Curriculum settings** — mastery thresholds, diagnostic length/confidence, difficulty bands, rate-limit & cache TTL tuning.
4. **Analytics** — diagnostic completion, mastery distribution, AI usage (latency, cache hit, fallback rate), submission volumes.
5. **Audit log viewer** — admin actions + security events, filterable.

**Exit criteria:** admin can create/suspend/re-role a user, adjust thresholds, and see analytics reflecting seeded activity; RBAC enforced end-to-end.

### Phase 6 — Hardening, Testing, Deployment (Weeks 9-10)

**Goal:** production-ready, secure, observable.

Tasks:
1. Security pass: Helmet, strict CORS, rate limits tuned, secret audit, prompt-injection review (student input only ever embedded as data).
2. Load test: 10k concurrent target for stateless API; verify AI decoupling (web traffic unaffected during simulated AI latency spikes).
3. Full test suites: unit (services w/ mocked Gemini), integration (Supertest + in-memory MongoDB), RBAC matrix, E2E golden paths.
4. Observability: structured JSON logs with request-id, AI metrics dashboard, security-event alerts.
5. Deployment: build SPA → static host; API → containerized stateless service behind load balancer; Atlas with TLS + allow-list.
6. Runbook: rollback (stateless redeploy), schema-change policy (expand → migrate → contract).

**Exit criteria:** all PRD acceptance scenarios pass; P95 budgets met; zero secrets in code; audit log captures all privileged actions.

---

## 5. Milestones & Deliverables

| Milestone | Week | Deliverable |
|---|---|---|
| M0 | 1 | Monorepo scaffold, CI green |
| M1 | 2 | Authenticated API with RBAC + full data layer |
| M2 | 5 | AI services passing contract tests with fallbacks |
| M3 | 7 | Student journey E2E complete |
| M4 | 8 | Admin dashboard complete |
| M5 | 10 | Hardened production deployment |

---

## 6. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Gemini latency spikes breach 2 s budget | Degraded UX | Flash models, caching, streaming, canonical fallback, strict timeouts |
| AI cost overrun from submissions | Budget blowout | Per-user rate limits, cached adaptations, batch evaluation |
| Schema drift between AI output and DB | Corrupt data | Single source of truth in `shared/schemas.ts`; Zod validation before every write |
| Prompt injection via student input | Data leakage | Server-built prompts; input as data only; no student-controlled system instructions |
| RBAC gaps on new routes | Privilege escalation | Mandatory RBAC matrix test entry for every new route (AGENTS.md definition of done) |

---

*End of Document — 06_Implementation_Plan.md*
