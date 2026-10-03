# Manual Guide (Setup & Development)

## AI-Driven Adaptive Learning Platform

| Field | Detail |
|---|---|
| **Document ID** | 03_Manual_Guide |
| **Version** | 1.4 |
| **Date** | 2026-09-05 |
| **Author** | Syed Azan Mehdi Shah |
| **Audience** | Developers and technical operators |

---

## 1. Prerequisites

| Requirement | Version |
|---|---|
| Node.js | ≥ 20.x (LTS) |
| npm | ≥ 10.x |
| MongoDB | **Atlas cluster is configured** — the project reads `MONGO_URI` from `server/.env` and connects to MongoDB Atlas (`cluster0`, database `adaptive_learning`). No local install needed. If `MONGO_URI` is blank, an embedded MongoDB runs automatically and persists to `server/mongo-data/` (delete that folder for a clean slate) |
| Gemini API key | From Google AI Studio (server-side only) |
| Git | ≥ 2.40 |

---

## 2. Getting Started

### 2.1 Clone and install

```bash
git clone <repository-url> adaptive-learning-platform
cd adaptive-learning-platform
npm install            # installs all workspaces: shared/, server/, client/
```

### 2.2 Environment configuration

Create `server/.env` (never commit this file):

```env
PORT=5000
MONGO_URI=mongodb+srv://<db_user>:<db_password>@<cluster>.mongodb.net/adaptive_learning?retryWrites=true&w=majority
JWT_SECRET=<strong-random-secret>
JWT_EXPIRES_IN=15m
GEMINI_API_KEY=<your-google-ai-studio-key>
GEMINI_API_KEY_2=<optional second key — the bulk AI features spend this one>
GEMINI_MODEL=gemini-3.5-flash-lite
GEMINI_FALLBACK_MODELS=gemini-flash-lite-latest,gemini-3-flash-preview
AI_TIMEOUT_MS=12000
NODE_ENV=development
```

> **Two Atlas gotchas.** (1) Include the database name in the path (`/adaptive_learning`) — without it Mongoose silently writes to a `test` database. (2) `db.ts` sets `serverSelectionTimeoutMS: 30_000`, not 10s: a cold Atlas connection measured **4–10s** here (SRV discovery + TLS handshakes to all three shard members), and a 10s ceiling intermittently crashed boot with `MongooseServerSelectionError` / `ReplicaSetNoPrimary`. That bound only governs how long the driver waits to find a usable server before erroring; it adds no latency to queries once connected.

The AI layer walks **key × model** in order: on quota errors (429 /
RESOURCE_EXHAUSTED) it waits out Google's retry hint once, on transient
overload/timeouts it rolls to the next model, and only when every
combination fails does it serve the deterministic fallback provider.
Free-tier quotas are per key **and** per model, so a second key and a
short model list keep AI-backed features live during bursts.

The two keys are also **partitioned by feature**: `GEMINI_API_KEY` pays for
Ask AI (the most latency-sensitive, user-facing path), and
`GEMINI_API_KEY_2` pays for everything heavier — the adaptive diagnostic and
its prefetch, lesson adaptation, code evaluation, Dojo critique, Career
Autopilot and Freelance Launchpad. This stops bulk generation from starving
the chat. It is a *preference*, not a hard wall: each feature still tries the
other key before falling back to the deterministic provider, so leaving
`GEMINI_API_KEY_2` unset simply routes everything through the first key.
Every AI success is logged with the credential that served it
(`… ok via key 2`), which is how you confirm the split at runtime.

`client/.env` is **optional** — leave `VITE_API_URL` unset. The SPA defaults to
the same-origin relative path `/api/v1`, which the Vite dev proxy forwards to
`http://localhost:5000` in development and the Vercel rewrite forwards to the
serverless function in production, so one default works in both.

```env
# client/.env — only needed for a split-origin setup
# VITE_API_URL=https://api.your-domain.com/api/v1
```

> **Do not set `VITE_API_URL=http://localhost:5000/api/v1`.** Vite inlines
> `VITE_*` values into the bundle at build time, so that string ships to
> production and makes the deployed SPA call **each visitor's own machine**.
> It appears to work locally, which is exactly why it goes unnoticed.
>
> The dev proxy target reads `BACKEND_URL` from the **shell** environment
> (`BACKEND_URL=http://localhost:5000 npm run dev:client`) and defaults to
> `http://localhost:5000`. Vite never loads `server/.env`, so a variable
> defined only there is `undefined` in `vite.config.ts`.

### 2.3 Run in development

```bash
# Terminal 1 — API server (Express, MVC)
npm run dev:server

# Terminal 2 — React client
npm run dev:client
```

The API listens on `http://localhost:5000`, the SPA on `http://localhost:5173`.

### 2.4 Seed an admin account

```bash
npm run seed:admin -- --email admin@example.com --password '<strong-password>'
```

> Students register through the UI; admins are provisioned only via seed or by another admin.

---

## 3. Working with the Codebase

### 3.1 Where things live

| Concern | Location |
|---|---|
| HTTP route definitions | `server/src/routes/` |
| Request handling / validation | `server/src/controllers/` |
| All Gemini calls | `server/src/services/` (**never** in controllers) |
| Chat / Memory Twin / Struggle DNA | `server/src/services/chatService.ts`, `memoryService.ts`, `dnaService.ts` |
| Autopilot / Dojo / AI-Resilience | `server/src/services/autopilotService.ts`, `dojoService.ts`, `resilienceService.ts` |
| Assessment Generator / Learning Path | `server/src/services/assessmentService.ts` (Autopilot's gap report is its input) |
| Interview Rehearsal / Application Pipeline | `server/src/services/interviewService.ts`, `pipelineService.ts` |
| Freelance Launchpad | `server/src/services/freelanceService.ts` |
| AI-Resilience frontier data | `server/src/data/aiFrontier.ts` (the dataset to re-tune as AI capability advances) |
| Curated fallback banks (skills, probes, interview questions, resources) | `server/src/data/skillTaxonomy.ts`, `assessmentBank.ts`, `interviewQuestions.ts`, `learningResources.ts` |
| Mongoose schemas | `server/src/models/` |
| Auth, RBAC & plan gating | `server/src/middleware/authMiddleware.ts` |
| Helmet CSP, CORS, rate limits | `server/src/config/security.ts` (only place to change them) |
| AI JSON output + request schemas | `shared/src/schemas.ts` |
| Chat fallback knowledge base | `server/src/data/knowledgeBase.ts` |

### 3.2 Golden rules

1. **Controllers never import `@google/genai`.** They call a service; the service owns the AI interaction.
2. **Every AI call declares a response schema** and the result is validated before it touches MongoDB.
3. **Every new admin route gets `requireRole('admin')`** and an audit-log entry for mutating actions.
4. **Every student resource route checks ownership** — never trust `req.params.userId` alone; compare against the JWT subject.

### 3.3 Adding a new AI feature (checklist)

1. Define the request schema **and** the JSON output schema in `shared/src/schemas.ts`.
2. Implement the orchestration in a `server/src/services/*Service.ts` function.
3. Add a fallback path (cached or canonical content) for timeout/schema failure. When the
   feature needs a bank to degrade to, put it in `server/src/data/` — every career feature
   ships with one so it still answers with no API key at all.
4. Expose it via a controller + route with the correct auth/RBAC middleware.
5. Add a rate limit in `server/src/config/security.ts` if the endpoint is user-triggered.
6. Add tests: mocked Gemini client, plus an RBAC-matrix entry for the route.
7. If the response carries a derived field (a duration, a total, a percentage), return it on
   **every** handler that serves the resource — `POST` *and* `GET`. The client renders from
   whichever response it happens to hold, so a field missing from the reload path silently
   blanks the UI. Type-checking will not catch it, because the client mirrors APIs with its
   own local interfaces.

---

## 4. NPM Scripts

| Script | Purpose |
|---|---|
| `npm run dev:server` | Start Express API with hot reload (workspace `@edu/server`) |
| `npm run dev:client` | Start the Vite React SPA (workspace `@edu/client`) |
| `npm start` | Production server |
| `npm run seed:admin` | Provision an admin user |
| `npm run seed:lessons` | Load the curated lesson + exercise bank |
| `npm test` | Run the server suite — 112 Vitest + Supertest tests across `tests/rbac.test.ts` (72) and `tests/careerStack.test.ts` (40) |
| `npm run build` | Build the React SPA to `client/dist` |
| `bash scripts/qa_api.sh` | 52-check live end-to-end API QA against the running server |

There is no root typecheck script. Run it per workspace:

```bash
cd server && npx tsc --noEmit
cd client && npx tsc --noEmit
```

> These are the only seven root scripts. `npm run dev` and `npm run test:ai` do **not**
> exist — older notes that mention them are stale.

---

## 5. Testing Strategy

| Layer | Approach |
|---|---|
| Unit | Services tested with a mocked `@google/genai` client; schemas validated with fixtures |
| Integration | Supertest against Express app with in-memory MongoDB |
| RBAC | Matrix tests: student/admin × every route (expect 200/403) |
| AI contract | Assert structured-output parsing and fallback on malformed responses |
| Career stack | `tests/careerStack.test.ts` (40 tests) pins the deterministic maths across eight groups: skill match and fit percentage, gap analysis, recruiter lens, automated assessment generator, customized learning path, interview rehearsal studio, application pipeline, and hydrating a stored gap report (so Autopilot plans saved before these fields existed still load) |
| E2E | Diagnostic → lesson adaptation → code submission loop in a seeded environment |

---

## Adaptive study experience (2026-10-02)

The dashboard's **Your next best move** panel recommends completing an unfinished
diagnostic or focusing on a competency. Only attempted domains count toward average
mastery; unmeasured competencies are shown as exploration, not failure.

**Adaptive Lessons** sorts the visible catalog by mastery gaps and confidence.
Each lesson explains whether to build foundations, confirm progress, or stretch
your skills. Your domain filter still controls which lessons are visible.

In **PathFinder**, adjust the daily time budget from 10 to 60 minutes. Short
sessions focus on an example and recall; longer sessions include practice and
reflection. The plan revisits the three highest priorities on a 3/2/1 schedule
over six days, then uses day 7 to re-baseline. With no measured evidence, it uses
a balanced rotation. The slider applies to the current visit; it does not record
study completion or promise a readiness date.

Choose a **Mentored exercise** to open its challenge and starter code directly.
New diagnostic answers and code feedback refresh the matrix, cached lesson
responses, and resilience report. Recommendations use existing signals and remain
available when Gemini falls back to the deterministic provider.

## 6. Deployment

1. Build client: `cd client && npm run build` (served statically or via CDN).
2. Set production env vars on the host (do not reuse dev `JWT_SECRET`).
3. Run `npm start` behind a load balancer; scale horizontally — the API is stateless.
4. Enable MongoDB Atlas network allow-listing and TLS.
5. Verify: register → diagnostic → submission flow works; admin routes return 403 for student tokens.

### Rollback

The API is stateless: redeploy the previous build; MongoDB schema changes must be backward-compatible (expand → migrate → contract).

---

## 7. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `401 TOKEN_INVALID` on every request | Clock skew or wrong `JWT_SECRET` | Sync clock; verify secret matches signing side |
| `401` on login for an account that worked before a restart | Dev database was reset (accounts vanished) | No longer applies on Atlas — accounts persist in the cloud cluster. On the embedded fallback, the DB persists to `server/mongo-data/`; to intentionally reset, stop the server and delete that folder |
| Boot dies with `MongooseServerSelectionError` / `ReplicaSetNoPrimary` | Atlas unreachable: either the server-selection timeout is shorter than the WAN handshake, or this machine's IP is not in the Atlas allowlist | `serverSelectionTimeoutMS` is 30s in `db.ts` (cold Atlas connect measured 4–10s here). In Atlas → Network Access, confirm the current public IP is allowed (or `0.0.0.0/0` for development) |
| AI calls time out | Latency spike or bad key | Check fallback serving; verify `GEMINI_API_KEY` and model name |
| Admin route returns 403 for admin | Role claim missing | Re-login (old token predates role claim); check seed script |
| Structured output rejected | Schema mismatch | Compare AI response against `shared/src/schemas.ts`; lower temperature |
| Cross-user data visible | Missing ownership guard | Add object-level check in controller; review RBAC matrix tests |
| 402 PREMIUM_REQUIRED | Free token hitting a gated route | Expected behavior; upgrade flow or admin grant sets the plan claim (requires re-login/token refresh) |
| 429 on a user-triggered route | Rate limiter tripped. Budgets: global 300/15min, login 10/15min, register 20/hr, `/premium/autopilot` 20/15min (**prefix-matched**, so it also covers the assessment route and every page-load read), assessment 8/15min, `/interview/script` 8/15min, `/dojo/critique` 10/15min, `/freelance/generate` 10/15min, chat 60/15min | Window resets automatically; tune limits in `src/config/security.ts` — **except** the chat limiter, which is declared locally in `routes/chatRoutes.ts`. All limiters are disabled when `NODE_ENV === "test"` |
| 409 when saving an application | `{ userId, company, role }` carries a unique index | Edit the existing row instead of adding a second one; the constraint is what stops the pipeline filling with duplicates |
| Embedded-MongoDB boot dies after ~8s with a lock error | `server/mongo-data/mongod.lock` names a PID that no longer exists but cannot be probed (`EPERM`), and `isPidAlive()` treats `EPERM` as *alive*, so `clearStaleLock` never clears it | Point `EMBEDDED_DB_PATH` at a fresh directory, or set a real `MONGO_URI` and skip the embedded path entirely. Do not delete the lock file by hand |
| Asset blocked in production | CSP too strict | Check the Network tab for the violated directive; adjust allow-list in `config/security.ts` |

---

*End of Document — 03_Manual_Guide.md*
