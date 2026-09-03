# Technical Documentation

## AI-Driven Adaptive Learning Platform

| Field | Detail |
|---|---|
| **Document ID** | 02_Technical_Documentation |
| **Version** | 1.3 |
| **Date** | 2026-08-31 |
| **Author** | Syed Azan Mehdi Shah |
| **Companion Docs** | 01_PRD.md, 03_Manual_Guide.md, 04_User_Manual.md |

---

## 1. System Overview

The platform is a personalized education system built on the **MERN stack** (MongoDB, Express.js, React.js, Node.js). It follows a strict **MVC architecture** with a dedicated **`/services` layer** so that AI orchestration (Gemini calls) is completely decoupled from standard web traffic.

### 1.1 High-Level Architecture

```
┌──────────────┐     HTTPS      ┌───────────────────────────────────────────┐
│ React SPA    │ ─────────────▶ │ Express.js API (MVC)                      │
│ (Client)     │ ◀───────────── │  ├─ routes/      (route definitions)      │
└──────────────┘    JSON        │  ├─ controllers/ (request handling)       │
                                │  ├─ middleware/  (auth, RBAC, validation) │
                                │  ├─ models/      (Mongoose schemas)       │
                                │  └─ services/    (AI orchestration layer) │
                                └───────────┬───────────────────┬───────────┘
                                            │                   │
                                  ┌─────────▼────────┐  ┌───────▼──────────┐
                                  │ MongoDB Atlas    │  │ @google/genai    │
                                  │ (users, lessons, │  │ Gemini 2.5/3.7   │
                                  │  matrices, code) │  │ Flash models     │
                                  └──────────────────┘  └──────────────────┘
```

### 1.2 Core Design Principles

1. **AI decoupling** — No controller calls the Gemini SDK directly. All AI access goes through `services/aiService.js`, keeping web traffic responsive even when AI latency spikes.
2. **Structured outputs everywhere** — Every AI call uses JSON Schema-constrained outputs (`@google/genai` response schemas) so results persist directly to MongoDB without ad-hoc parsing.
3. **Stateless auth** — JWTs carry `userId` + `role`; no server-side sessions.
4. **Defense in depth** — Auth middleware verifies the token; RBAC middleware checks the role; object-level guards check ownership.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React.js (Vite), React Router | SPA: lessons, code editor, dashboards |
| Backend | Node.js + Express.js | REST API, MVC structure |
| Database | MongoDB (Mongoose ODM) | Users, capability matrices, lessons, submissions, feedback |
| AI Engine | `@google/genai` SDK | Gemini 2.5 / 3.7 Flash for diagnostics, lesson rewrites, code grading |
| Auth | `jsonwebtoken` + `bcryptjs` | JWT signing/verification, password hashing |
| Code Editor | Monaco Editor (in-browser) | Student code authoring |
| Validation | `zod` / `express-validator` | Request + AI-output schema validation |

---

## 3. Project Structure (MVC)

```
project-root/                    # npm workspaces monorepo (TypeScript)
├── shared/                      # Shared package
│   └── src/schemas.ts           # Zod schemas: request bodies + AI output shapes
├── client/                      # React SPA (Vite, React 19)
│   └── src/
│       ├── components/          # Reusable UI (StudentLayout, Reveal, Guards…)
│       ├── pages/               # Route views: student/ and admin/
│       ├── stores/auth.ts       # Zustand auth store (persisted to localStorage)
│       └── lib/api.ts           # Axios instance with JWT interceptor
├── server/                      # Express 5 API
│   ├── src/config/              # env, db, bootstrap, security (helmet/CORS/rate limits)
│   ├── src/controllers/         # parse → validate → delegate → respond
│   ├── src/middleware/          # authenticate / requireRole / requirePlan, ownership, errors
│   ├── src/models/              # User, CapabilityMatrix, Lesson, CodeSubmission, ChatMessage,
│   │                            # AutopilotPlan, DesignCritique, FreelanceProfile, AuditLog, Settings
│   ├── src/routes/              # auth, student, lesson, submission, admin, chat, premium, dojo, freelance
│   ├── src/services/            # ★ AI orchestration layer (aiService, diagnostic, adaptation,
│   │                            #   evaluation, matrix, chat, memory, dna, autopilot, dojo,
│   │                            #   passport, scholarship, freelance, mockAi)
│   ├── src/data/                # Seed content: lessons, exercises, knowledgeBase, scholarships
│   └── tests/                   # vitest: RBAC matrix, AI services (mocked), hardening
└── docs/                        # PRD, technical docs, manuals, decks
```

---

## 4. AI Orchestration Layer (`/services`)

### 4.1 aiService.js

Single point of contact with `@google/genai`. Responsibilities:

- Initialize Gemini clients from `GEMINI_API_KEY` / `GEMINI_API_KEY_2` (env only; read live so config changes take effect without restart).
- Expose `generateStructured(prompt, schema, options)` which enforces a JSON response schema.
- Walk a **key × model cascade** (`GEMINI_MODEL` then `GEMINI_FALLBACK_MODELS`): quota errors (429 / RESOURCE_EXHAUSTED) wait out Google's retry hint once, transient overloads/timeouts roll to the next model, and the whole walk is bounded (~45s) before the deterministic fallback provider takes over.
- Apply temperature 0.4 and a per-attempt timeout (`AI_TIMEOUT_MS`, 12s default in dev) tuned for free-tier latency spikes.
- Log token usage and latency for admin analytics.

### 4.2 diagnosticService.js

- Generates the **next** diagnostic item based on the running capability vector (adaptive item selection).
- Prompt inputs: current domain coverage, difficulty level, recent answers.
- Output schema: `{ question, codeSnippet?, options?, domain, difficulty, rationale }`.
- On completion, computes the **User Capability Matrix**: per-domain strength scores 0–1 with confidence values.
- **Speculative prefetch (latency hiding):** while the learner reads/thinks, the service pre-generates *both* outcome branches (correct → next difficulty up, incorrect → next difficulty down) for the predicted next domain and stores them on the matrix. Answering then serves a ready item in ~10 ms instead of waiting on a live Gemini call. Branches are generated **sequentially** (never in parallel) and, if the learner answers before the prefetch lands, the answer **awaits the same in-flight call** rather than firing a duplicate — this keeps concurrency at one request so the free-tier per-key/per-model rate limit is never saturated (parallel prefetch was observed to cascade into 12–45 s timeouts). Persisted prefetches are guarded by `history` length so a stale branch is discarded, never served. On any prefetch failure the path degrades to normal live generation, then to the deterministic mock.

### 4.3 adaptationService.js

- Trigger: mastery score for a concept < threshold (e.g., 0.6) across recent signals.
- Inputs: canonical lesson, student level tier (`beginner | intermediate | advanced`), learning-style preference.
- Output schema: `{ rewrittenContent, styleUsed, objectivesCovered[], diagrams?[] }`.
- Cache key: `hash(conceptId + levelTier + style)` with TTL; on cache hit, no AI call.

### 4.4 evaluationService.js

- Inputs: exercise spec, canonical solution/test expectations, student code, student tier.
- Output schema:
```json
{
  "correct": true,
  "score": { "correctness": 0-100, "style": 0-100, "edgeCases": 0-100, "optimization": 0-100 },
  "feedback": { "summary": "", "tieredGuidance": [], "improvements": [] },
  "matrixDeltas": [ { "domain": "", "delta": 0.0 } ]
}
```
- `matrixDeltas` are applied by `matrixService.js` to close the feedback loop.

### 4.5 Failure Handling

- AI timeout or schema violation → serve cached/canonical fallback, log the event, never block the user.
- Retries: at most 1 retry with a faster model; then fallback.

### 4.6 chatService.js

- Domain-general mentor. Builds a transcript-aware prompt from the last 10 messages.
- Output schema: `{ reply, domain? }`. Mock mode matches against `data/knowledgeBase.ts`.
- Persisted per-user via the `ChatMessage` model; rate-limited at the route.

### 4.7 memoryService.js (Memory Twin™ — premium)

- Fits per-domain forgetting curves `R(t) = e^(-t/S)` to real recall events; stability `S` grows with successful recalls.
- `computeMemory` returns retention, stability, and a 14-day forecast with days-until-danger.
- `startRescue` / `answerRescue` run targeted micro-sessions that reinforce stability.

### 4.8 dnaService.js (Struggle DNA™ — premium)

- Mines diagnostic history + submissions into 4 axes: Resilience, Depth Tolerance, Edge Awareness, Craft.
- Classifies a struggle archetype and returns targeted countermeasures.

### 4.9 autopilotService.js (Career Autopilot™ — premium)

- Extracts required skills from a pasted job description via Gemini structured output, constrained to the platform taxonomy.
- Deterministic keyword-analyzer fallback keeps the feature alive without an API key.
- Diffs each extracted skill against the live Capability Matrix (strong / developing / gap / unmeasured) and produces an importance-weighted hire-readiness score plus a deterministic 90-day, three-phase plan.
- The JD is embedded as data, never as instructions (prompt-injection safe). Latest plan persisted per user.

### 4.10 dojoService.js (System Design Dojo™)

- Curated catalog of six system-design challenges plus a learnable 5-step framework (Clarify → Estimate → Model → Architect → Scale).
- Grades a student's written design on four interview axes — Requirements clarity, Estimation, Data modeling, Scalability — via Gemini structured output, with a deterministic keyword-rubric fallback.
- Returns verdict, per-axis scores (1–5), strengths, gaps, and next steps. Student notes are treated as untrusted data.

### 4.11 passportService.js (Skill Passport™)

- Pure read-model builder: compiles the learner's Capability Matrix, submission count, design-critique count, and Autopilot readiness into one portable document.
- Derives a deterministic passport ID (`AP-XXXX-XXXX-XXXX`) from the user record so it is stable across requests.
- No AI call — fully deterministic and offline-safe.

### 4.12 scholarshipService.js (Scholarship Radar™)

- Curated in-memory pool of 15 fully-funded international scholarships (`data/scholarships.ts`).
- Filters by level / country / field, then scores each match (0–100) rewarding filter alignment, full funding, and Pakistan popularity.
- Computes a rolling `nextDeadline` and `daysLeft` so the radar always shows the next open cycle. No persistence, no AI — deterministic and free.

### 4.13 freelanceService.js (Freelance Launchpad™)

- Reads the student's live Capability Matrix and drafts a marketplace-ready freelance profile via Gemini structured output.
- Output schema: `{ headline, niche, skills[3..8], positioning, gigs[2..3], hourlyRateUsd }`.
- Deterministic fallback composes the same shape from the learner's strongest measured domains so it never invents unsupported skills. Persisted per user; latest recalled via `GET /freelance/latest`.

---

## 5. Data Models (MongoDB / Mongoose)

### 5.1 User

| Field | Type | Notes |
|---|---|---|
| `name`, `email` | String | email unique |
| `passwordHash` | String | bcrypt, never returned in queries |
| `role` | String (enum) | `student` \| `admin` |
| `plan` | String (enum) | `free` \| `premium`; carried in the JWT `plan` claim |
| `premiumSince` | Date \| null | set when premium is granted |
| `profile.levelTier` | String | `beginner` \| `intermediate` \| `advanced` |
| `profile.learningStyle` | String | e.g., `analogical`, `visual`, `technical` |
| `status` | String | `active` \| `suspended` |

### 5.2 CapabilityMatrix

| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId | ref User, indexed |
| `domains` | Object | e.g., `{ syntax: {score, confidence}, oop: {...}, ... }` |
| `diagnosticStatus` | String | `in_progress` \| `complete` |
| `recalls` | [{ domain, at, success }] | recall event log feeding the Memory Twin |
| `activeRescue` | Object \| null | in-flight Rescue Review session |
| `updatedAt` | Date | versioned updates |

### 5.3 Lesson

| Field | Type | Notes |
|---|---|---|
| `conceptId`, `title` | String | canonical content |
| `objectives` | [String] | parity requirement for rewrites |
| `canonicalContent` | String | authored base version |
| `adaptations` | [{ levelTier, style, content, cacheKey }] | generated variants |

### 5.4 CodeSubmission

| Field | Type | Notes |
|---|---|---|
| `userId`, `exerciseId` | ObjectId | indexed together |
| `code`, `language` | String | student source |
| `evaluation` | Object | structured AI output |
| `attemptNumber` | Number | resubmission tracking |

### 5.5 AuditLog (Admin actions)

| Field | Type |
|---|---|
| `adminId`, `action`, `targetType`, `targetId`, `timestamp` | — |

### 5.6 ChatMessage

| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId | ref User, indexed with createdAt |
| `role` | String (enum) | `user` \| `assistant` |
| `content` | String | message text (max 20000) |
| `domain` | String \| null | optional topic tag on assistant replies |
| `createdAt` | Date | conversation ordering |

### 5.7 AutopilotPlan

| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId | ref User, indexed |
| `role`, `readiness` | String, Number | target role + hire-readiness score |
| `skills` | Object | per-skill gap analysis (strong/developing/gap/unmeasured) |
| `plan` | Object | 3-phase, 12-week deterministic schedule |
| `source` | String (enum) | `ai` \| `mock` |
| `createdAt` | Date | latest plan per user |

### 5.8 DesignCritique

| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId | ref User, indexed |
| `challengeId` | String | which Dojo challenge |
| `scores` | Object | per-axis 1–5 scores |
| `verdict`, `nextSteps` | String, [String] | rubric outcome |
| `source` | String (enum) | `ai` \| `mock` |
| `createdAt` | Date | per-user history |

### 5.9 FreelanceProfile

| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId | ref User, indexed |
| `focus` | String \| null | optional focus area supplied by the learner |
| `profile` | Object | headline, niche, skills, positioning, gigs, hourlyRateUsd |
| `source` | String (enum) | `ai` \| `mock` |
| `createdAt` | Date | latest profile per user |

---

## 6. API Design (REST)

Base URL: `/api/v1`. All protected routes require `Authorization: Bearer <JWT>`.

### 6.1 Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create student account |
| POST | `/auth/login` | Public | Returns JWT |
| POST | `/auth/refresh` | Authenticated | Rotate token |

### 6.2 Student

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/student/me` | Student | Own profile |
| POST | `/student/diagnostic/start` | Student | Begin/resume diagnostic |
| POST | `/student/diagnostic/answer` | Student | Submit answer → receive next dynamic item |
| GET | `/student/matrix` | Student (own) | Capability matrix |
| GET | `/student/passport` | Student (own) | Skill Passport (deterministic, portable JSON) |
| GET | `/student/glossary` | Student | Urdu dual-language glossary |
| GET | `/student/scholarships` | Student | Scholarship Radar matches (`?level=&country=&field=`) |
| GET | `/lessons/:conceptId` | Student | Lesson (auto-adapted version if triggered) |
| POST | `/submissions` | Student | Submit code |
| GET | `/submissions/:id/feedback` | Student (own) | Structured feedback |

### 6.3 Admin

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET/POST/PATCH | `/admin/users` | Admin | Manage accounts, roles, plan, suspension |
| GET/PATCH | `/admin/curriculum` | Admin | Curriculum settings, thresholds |
| GET | `/admin/analytics` | Admin | Assessment, mastery, AI usage stats |
| GET | `/admin/audit-log` | Admin | Security & admin action log |

### 6.4 Chat

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/chat` | Authenticated | Send message, get structured reply (rate-limited) |
| GET | `/chat/history` | Authenticated (own) | Conversation history |
| DELETE | `/chat/history` | Authenticated (own) | Clear conversation |

### 6.5 Premium

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/premium/plan` | Authenticated | Current plan + unlocked features |
| POST | `/premium/upgrade` | Student | (mock) subscribe → premium, reissues tokens |
| GET | `/premium/memory` | Premium | Memory Twin forecast (402 if free) |
| POST | `/premium/memory/rescue` | Premium | Start a Rescue Review |
| POST | `/premium/memory/rescue/answer` | Premium | Answer a rescue question |
| GET | `/premium/dna` | Authenticated | Struggle DNA (teaser for free, full for premium) |
| POST | `/premium/autopilot` | Premium | Analyze a pasted JD → gap analysis + 90-day plan (402 if free, rate-limited) |
| GET | `/premium/autopilot` | Premium | Latest saved Autopilot plan |

### 6.6 Dojo (System Design)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/dojo/challenges` | Student | Six challenges + the 5-step framework |
| POST | `/dojo/critique` | Student | Submit a design draft → 4-axis rubric critique (rate-limited) |
| GET | `/dojo/history` | Student (own) | Past critiques |

### 6.7 Freelance

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/freelance/generate` | Student | Draft a freelance profile from the live matrix (rate-limited) |
| GET | `/freelance/latest` | Student (own) | Latest saved profile (404 if none) |

### 6.8 Error Contract

```json
{ "error": { "code": "FORBIDDEN_ROLE", "message": "...", "status": 403 } }
```

Plan-gated features return `{ "error": { "code": "PREMIUM_REQUIRED", "status": 402 } }` for free callers.

---

## 7. Security Architecture

All transport-level protections are centralized in `server/src/config/security.ts`.

1. **JWT** — HS256 signed; access token ≤ 15 min; claims: `{ sub, role, plan, type, iss, iat, exp }`. Tokens are **issuer-bound** (`iss: adaptive-learning-platform`) and verified with the issuer check. Refresh rotation reissues both tokens.
2. **RBAC middleware** — `requireRole('admin')` guards admin routes; returns 403 on mismatch.
3. **Plan gating** — `requirePlan('premium')` guards premium features; returns 402 for free callers (admins bypass).
4. **Object-level guards** — ownership checks on student resources and chat history; cross-user access returns 403/404.
5. **Password storage** — bcrypt (cost 12).
6. **Security headers** — helmet with a strict Content-Security-Policy in production (allow-listed `cdn.jsdelivr.net` for the Monaco loader), HSTS, `X-Frame-Options: DENY`, nosniff, `no-referrer`, COOP/CORP. Dev relaxes CSP for Vite HMR.
7. **Rate limiting** — global 300 req/15min per IP, login 10/15min, register 20/hr, chat 60/15min, and 10/15min on each AI-backed endpoint (`/premium/autopilot`, `/dojo/critique`, `/freelance/generate`). Disabled in the test environment.
8. **Prompt-injection mitigation** — student input is embedded as data inside server-built prompts; never concatenated into system instructions.
9. **Secrets** — environment variables only; `.env` git-ignored.
10. **Sandboxing** — student code is never executed on the main server; evaluation is static/AI-based (or an isolated runner if added later).

---

## 8. Performance Budgets

| Operation | Budget |
|---|---|
| AI user-facing response (P95) | < 2000 ms |
| Standard CRUD (P95) | < 300 ms |
| MongoDB hot-path query | < 100 ms |
| Diagnostic item generation | < 2000 ms live; **~10 ms when served from speculative prefetch** (the common case — see §4.2) |
| Code evaluation (full feedback) | < 5000 ms (async acceptable with streaming progress) |

## 9. Observability

- Structured JSON logs (request id, userId, role, route, latency).
- AI call metrics: latency, tokens, cache hit rate, fallback rate.
- Security events: failed RBAC, token tampering, cross-user attempts → admin audit log.

## 10. Responsive Design

The client is mobile-first and works across phones, tablets, and desktops with a strict monochrome black & white design system in both dark and light themes.

1. **Design System & Typography** — Google Fonts integration (`Plus Jakarta Sans` for UI & headers, `JetBrains Mono` for code blocks); true-black/true-white monochrome tokens with inverted primary buttons per theme, `.card`/`.btn-*`/`.input` component classes defined per theme in `index.css`.
2. **Global guards** — `overflow-x: clip` on `html`/`body` prevents animation offsets or wide content from creating a horizontal scrollbar; `viewport-fit=cover` + `theme-color` meta; `text-size-adjust` and tap-highlight normalization.
3. **Safe-area insets** — `env(safe-area-inset-*)` applied to the sticky student header, the admin mobile bar, and the chat composer for notched devices.
4. **Breakpoints** — mobile (<1024px) uses a hamburger nav (student) and a slide-in sidebar with backdrop (admin); single-column stacking; the chat composer uses `100dvh` with a `min-h-[440px]` floor. Tablet uses 2-column grids and horizontally scrolling tables (`min-width` inside `overflow-x-auto`). Desktop (≥1024px) shows the full nav and multi-column layouts; the student nav renders 14 destinations at every size without overflow.
5. **Charts** — Chart.js via `react-chartjs-2` (radar capability matrix, retention curves, trend forecasts) with a shared `useChartTheme` hook that restyles grids/ticks/tooltips per theme, and reduced heights on small screens.
6. **Type & spacing** — large headings and prices scale (`text-2xl sm:text-4xl`) with `break-words`; `.card` padding scales (`p-5 sm:p-7`).
7. **Motion accessibility** — all GSAP/Motion animations honor `prefers-reduced-motion`.
8. **Animation layer** — route-keyed `PageTransition` fade/slide on every page (student + admin), slow-drifting ambient glow meshes behind both shells (CSS keyframes), staggered entrance animations on cards/sections, button shine-sweep and hover-lift micro-interactions, and a 3D Three.js hero on the auth screens.
9. **Contrast** — every route is audited against WCAG AA (4.5:1 body text, 3:1 large bold) in both themes.

---

*End of Document — 02_Technical_Documentation.md*
