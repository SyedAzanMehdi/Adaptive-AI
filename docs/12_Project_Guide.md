# Project Guide

## AI-Driven Adaptive Learning Platform

| Field | Detail |
|---|---|
| **Document ID** | 12_Project_Guide |
| **Version** | 1.3 |
| **Date** | 2026-09-05 |
| **Author** | Syed Azan Mehdi Shah |
| **Audience** | Judges, reviewers, collaborators, and anyone running the project |

---

## 1. What This Project Is

A personalized education platform that acts as a **dynamic AI tutor**. Instead of
one-size-fits-all courses, it diagnoses each learner with adaptive AI-generated tests,
rewrites lessons to match their level and learning style, mentors their code with tiered
feedback, answers questions through a domain-general chatbot — and predicts **when they
will forget** each skill (Memory Twin™) and **how they struggle** (Struggle DNA™).

Built on the **MERN stack** (MongoDB, Express 5, React 19 + Vite, Node.js) in TypeScript,
with a strict MVC architecture and a dedicated AI services layer.

---

## 2. How to Run the Project

### 2.1 Prerequisites

| Requirement | Version |
|---|---|
| Node.js | ≥ 20.x (tested on 24.x) |
| npm | ≥ 10.x |
| MongoDB | **No local install required** — the project connects to a MongoDB Atlas cluster via `MONGO_URI`; an embedded MongoDB starts automatically as a fallback when `MONGO_URI` is blank |
| Gemini API key | Optional — the platform runs fully offline in mock AI mode |

### 2.2 Install

```bash
npm install        # installs all workspaces: shared/, server/, client/
```

### 2.3 Run (development)

Open two terminals:

```bash
# Terminal 1 — API server (http://localhost:5000/api/v1)
npm run dev:server

# Terminal 2 — React app (http://localhost:5173)
npm run dev:client
```

The API **auto-seeds** on boot: a default admin account and 4 canonical lessons.

### 2.4 First login

| Account | Credentials |
|---|---|
| Admin | `admin@example.com` / `Admin1234!` |
| Student | Click **Register** and create one (free plan) |

Then open **http://localhost:5173**:
1. Register a student → take the adaptive diagnostic.
2. Watch lessons adapt; submit code in **Practice**; chat in **Ask AI**.
3. Open **Premium** → **Subscribe now** (mock billing) → unlock **Memory Twin** and **Struggle DNA**.
4. Sign in as the admin for the console at `/admin`.

### 2.5 Optional configuration (`server/.env`)

| Variable | Effect |
|---|---|
| `GEMINI_API_KEY` | Switches AI from the deterministic mock to real Gemini (structured outputs, schema-validated). Without it, everything still works offline. Pays for **Ask AI**, and acts as the fallback credential for every other AI feature. |
| `GEMINI_API_KEY_2` | Optional second key. Pays for the heavier AI features — adaptive diagnostic and its prefetch, lesson adaptation, code evaluation, Dojo critique, Career Autopilot and Freelance Launchpad — so bulk generation can't starve the chat. It's a preference, not a wall: each feature still tries the other key, then the mock. Leave it unset and everything runs on the first key. |
| `GEMINI_MODEL` / `GEMINI_FALLBACK_MODELS` | Primary model and comma-separated rollover list (quota/overload cascade). |
| `AI_TIMEOUT_MS` | Per-attempt Gemini timeout (dev `.env` uses 12000 to ride out free-tier latency spikes). |
| `MONGO_URI` | Set to the project's MongoDB Atlas cluster (database `adaptive_learning`). Keep the database name in the path or Mongoose silently writes to a `test` database. Blank = embedded dev DB persisted at `server/mongo-data/`. |
| `JWT_SECRET` | Change for any non-local deployment. |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Override the seeded admin. |

### 2.6 Tests & QA

```bash
npm test                 # 112/112 Vitest + Supertest across tests/rbac.test.ts (72) and
                         # tests/careerStack.test.ts (40): RBAC matrix, ownership, AI services,
                         # hardening, and the whole Career Readiness Stack
bash scripts/qa_api.sh   # 52 automated end-to-end API checks against the live server
```

Per-workspace type-checking is separate from the root scripts:

```bash
cd server && npx tsc --noEmit
cd client && npx tsc --noEmit
```

### 2.7 Production build

```bash
npm run build         # builds the React SPA to client/dist
NODE_ENV=production npm run start   # API with strict CSP, HSTS, locked-down CORS
```

---

## 3. Complete Feature List

### 3.1 Student features (Free)

| Feature | Description |
|---|---|
| Intelligent diagnostic | Adaptive, AI-generated code-reading questions that adjust difficulty per answer and build a Capability Matrix across 5 CS domains |
| Adaptive lessons | Lessons rewrite themselves (analogies / diagrams / internals) based on level + learning style when struggle is detected; cached per concept × tier × style |
| Code playground | In-browser Monaco editor; AI evaluation on 4 axes — correctness, style, edge cases, optimization — with tiered, constructive feedback |
| Capability dashboard | Chart.js radar of domain mastery, animated stats, weak-area highlights |
| AI Mentor Chat | Domain-general chatbot with private per-user history and topic tagging |
| Domain Compass™ | 64 computing domains across 12 fields, each with a detailed breakdown and a 4-stage study path; field-level 2026–2036 demand forecasts + viral-potential scores; deep-links to filtered lessons |
| PathFinder™ Planner | Mastery/confidence-ranked priorities, spaced repetition, and adjustable daily sessions; re-plans after new learning signals |
| System Design Dojo™ | Six system-design challenges graded on a 4-axis interview rubric (Clarify → Estimate → Model → Architect → Scale) |
| AI-Resilience Score™ | Personal automation-exposure forecast computed from your own Capability Matrix (not a generic industry number) — which measured skills AI already automates, an overall resilience score, and a pivot path toward the lowest-exposure domain you haven't yet mastered |
| Freelance Launchpad™ | AI-drafted, matrix-grounded freelance profile (niche, skills, gigs, rate) you can copy to any marketplace |
| Interview Rehearsal Studio™ | A role-specific 2–4 round mock loop (screening / technical / system design / behavioural) generated from your real gap report, with follow-up probes and good-answer signals per question; self-score 1–5 for a deterministic scorecard and a cross-session trend line |
| Application Pipeline™ | Six-stage job-search tracker with append-only stage history and a server-computed response rate that never counts unsent "Saved" rows against you |
| Mastery loop | Every diagnostic answer and submission updates the matrix; feedback history per exercise |

### 3.2 Premium features (Adaptive+)

| Feature | Description |
|---|---|
| Memory Twin™ | Per-skill forgetting curves fitted to real practice history; 14-day retention forecast with a 50% danger line |
| Rescue Reviews | 2-minute AI micro-sessions targeting the weakest memory; each successful recall increases stability |
| Struggle DNA™ | 4-axis cognitive profile (Resilience, Depth Tolerance, Edge Awareness, Craft) + struggle archetype + targeted countermeasures |
| Career Autopilot™ | Paste any JD → tier- and importance-weighted gap analysis vs. your matrix, a match % broken down by must-have / nice-to-have / technical / soft, and a **Recruiter Lens** naming your screen-out risk and single highest-leverage fix, plus the 90-day three-phase plan |
| Automated Assessment Generator™ | Turns the stored gap report into a 3–12 item suite — quiz, coding or rubric-scored interview — with one probe per weak requirement, so a score on the suite is a score on your gaps. Persisted with its own `ai`/`mock` source |
| Customized Learning Path™ + Time-to-Ready ETA™ | Up to 12 prioritized steps with hour estimates, curated platform deep-links and external references, and a "Done when:" test each; a weekly-hours slider (1–80h) converts the total into a job-ready date with a confidence rating and its assumptions printed underneath |
| One-click upgrade | Mock billing endpoint reissues tokens with the premium plan claim; admins can grant/revoke |

### 3.3 Admin console

| Feature | Description |
|---|---|
| User management | Create/suspend/reactivate, change roles, grant/revoke Premium — all audit-logged |
| Curriculum settings | Mastery thresholds, diagnostic length, cache TTL, submission limits |
| Analytics | Student/admin counts, diagnostic completion, submissions, average mastery by domain |
| Audit log | Every privileged action with metadata, newest first |

### 3.4 Platform qualities

| Quality | Evidence |
|---|---|
| UI / UX | Strict monochrome black & white design system with a restrained accent color for CTAs/status, in dark + light themes (Plus Jakarta Sans & JetBrains Mono), WCAG-AA contrast-audited on every route |
| Security | Issuer-bound JWT, RBAC + plan gating (403/402), helmet CSP + HSTS, rate limits, ownership checks, audit logging |
| Responsive | Mobile-first: hamburger nav, slide-in admin sidebar, safe-area insets, dvh layouts, scrolling tables; the 16-link student nav is grouped into four collapsible sections so it fits every breakpoint |
| Animations | Three.js 3D hero, Motion entrances + micro-interactions (single animation engine) — all honoring `prefers-reduced-motion` |
| Reliability | Every AI path has a deterministic fallback; the demo never fails offline |
| QA | 52/52 live API checks, 112/112 Vitest + Supertest tests passing, production security-header verification — see docs/10 + docs/11 |

---

## 4. Unique Features (Why This Product Is Different)

> Full pitch-ready version: **`hackathon/13_Unique_Features.md`** (also available as Word).

### 4.1 Memory Twin™ — the world's first skill-decay predictor in a learning platform
Every platform tracks what you learned. **None predicts when you'll forget it.** The Memory
Twin fits an exponential forgetting curve `R(t) = e^(-t/S)` to each learner's real answer
timestamps — stability `S` grows with every successful recall (the spacing effect,
operationalized). Students see a 14-day forecast: *"your recursion skill fades below 50% in
4 days"* — then a Rescue Review reinforces it before it's gone.

### 4.2 Struggle DNA™ — profiling HOW students fail, not just what they know
Mines answer sequences and code submissions into a cognitive phenotype:
- **Resilience** — recovery rate after wrong answers
- **Depth Tolerance** — accuracy retention as difficulty rises
- **Edge Awareness** — handling unusual inputs in code
- **Craft** — code clarity discipline

The platform assigns an archetype (Depth Climber, Edge-Case Blind, Momentum Loser,
Builder First, Steady Climber) and prescribes countermeasures — coaching the *cause*,
not the symptom.

### 4.3 Adaptive diagnostics that hide nothing
Questions are generated on the fly (never a static bank), difficulty moves with the
learner, and the correct answer is never exposed to the client — enforced by tests.

### 4.4 Loss-aversion monetization
The conversion hook is psychological: free users *watch their own skills fade on a chart*,
then subscribe to stop it. Premium gating is enforced server-side via JWT plan claims.

### 4.5 Demo-proof architecture
Every AI capability has a structured schema + deterministic fallback, so the product works
with zero API keys — the live demo can never fail on stage.

### 4.6 Career Autopilot™ and the Career Readiness Stack — paste any JD, get hire-ready
The demo that sells itself: a student pastes any job posting and the platform returns a
complete, defensible readiness verdict instead of a single number.

1. **Skill Match & Fit Percentage™** — every requirement in the posting is classified as
   *primary* (must-have) or *secondary* (nice-to-have) and scored against the student's live
   Capability Matrix. Primary requirements carry twice the weight, so a missing must-have
   hurts more than a missing nice-to-have. Requirements the platform has never measured earn
   35% credit rather than zero — the score is honest about what it does not know.
2. **Gap Analysis™** — each requirement lands in one of four buckets (*strong* ≥ 70%,
   *developing* ≥ 45%, *gap* < 45%, *unmeasured*) and the report splits the shortfall into
   missing **technical** and missing **soft** skills.
3. **Recruiter Lens™** — a plain-English verdict in the voice of the person reading the CV
   ("Strong match — interview now"), naming the single worst-placed must-have requirement.
4. **Automated Assessment Generator™** — one targeted probe per weak requirement (quiz,
   coding challenge, or interview question), 3–12 items, generated to actually test the gap.
5. **Customized Learning Path™ + Time-to-Ready ETA™** — up to twelve ordered, resource-backed
   steps, each with a realistic hour estimate, plus a calendar date for "ready to apply"
   driven by a weekly-hours slider.

All five are deterministic-first with AI assist, prompt-injection safe, rate-limited and
premium-gated. Full specification: **`hackathon/13_Unique_Features.md` §18**.

### 4.7 Interview Rehearsal Studio™ and Application Pipeline™ — the loop after the plan
Knowing the gap is not the same as surviving the interview. The **Rehearsal Studio** turns any
job description into a timed multi-round mock interview — screening, technical, system design,
behavioural — drawn from a 38-question curated bank, then scores the student's self-assessment
into a verdict, a per-round breakdown, a trend line against their previous attempt, and the
signals to fix next. The **Application Pipeline** tracks real applications across six stages
with an append-only stage history and computes the student's actual **response rate** — the
number employers return, not the number of forms submitted. Both are free for every plan.

### 4.8 The opportunity layer — AI-Resilience, Freelance
Learning platforms stop at "you learned it." This layer answers *"what do I do with it, and
where is it still worth investing?"* — the **AI-Resilience Score™** weighs the student's own
measured Capability Matrix against a curated, periodically-updated view of what current AI can
already automate, surfacing an overall resilience score, the most-exposed domain, and a pivot
path toward the lowest-exposure domain they haven't yet mastered. A **Freelance Launchpad**
drafts a marketplace-ready profile grounded in the same measured skills. Both free, both
deterministic or AI-assisted with fallbacks.

---

## 5. Repository Map

| Path | What lives there |
|---|---|
| `client/` | React 19 SPA — student experience + admin console |
| `server/src/routes` · `controllers` · `middleware` | MVC API surface (Express 5) |
| `server/src/services` | All AI orchestration: diagnostic, adaptation, evaluation, matrix, chat, memory, DNA, autopilot, assessment, interview, pipeline, dojo, passport, scholarship, freelance + mock provider |
| `server/src/models` | User, CapabilityMatrix, Lesson, CodeSubmission, AuditLog, ChatMessage, AutopilotPlan, InterviewSession, Application, DesignCritique, FreelanceProfile, Settings |
| `server/src/data` | Curated fallback banks: lessons, exercises, knowledgeBase, skillTaxonomy, assessmentBank, interviewQuestions, learningResources, scholarships, dojoChallenges, urduGlossary |
| `server/src/config` | env, db (embedded MongoDB), bootstrap, **security (helmet/CORS/rate limits)** |
| `shared/` | Zod schemas shared by client + server |
| `scripts/qa_api.sh` | Automated QA suite |
| `docs/` | PRD, technical docs, manuals, QA plan/report, roadmaps, pitch decks |

---

## 6. Quick Troubleshooting

| Symptom | Fix |
|---|---|
| Port 5000 busy | A previous server instance is still running; stop it or change `PORT` |
| Data disappeared | Data lives in the Atlas cluster named in `MONGO_URI` (database `adaptive_learning`) — check Atlas → Browse Collections. On the embedded fallback, delete `server/mongo-data/` only when you *want* a reset |
| Boot fails with `MongooseServerSelectionError` / `ReplicaSetNoPrimary` | Atlas is unreachable: verify the machine's IP is in Atlas → Network Access, and keep `serverSelectionTimeoutMS` at 30s (cold connects measured 4–10s) |
| AI answers feel canned | That's mock mode — add `GEMINI_API_KEY` for real Gemini |
| 402 on Memory Twin/DNA | Expected for free accounts — subscribe or have an admin grant premium |
| Rate-limited (429) | Login 10/15min, chat 60/15min, autopilot 20/15min (prefix-matched, so it also covers assessment and page-load reads), assessment 8/15min, interview script 8/15min, dojo 10/15min, freelance 10/15min, global 300/15min — windows reset automatically |
| 409 when saving an application | You already track that company + role combination. Edit the existing row instead — the unique index is what stops the pipeline filling with duplicates |

---

## Adaptive experience update — 2026-10-02

Shared recommendation rules live in `client/src/lib/learning.ts`. Priority is
`0.8 × (1 − mastery) + 0.2 × (1 − confidence)` for attempted competencies;
unmeasured competencies receive an exploration priority of 0.7. Ties retain the
canonical domain order. These rules organize the UI; authorization and stored
mastery remain controlled by the existing API.

Dashboard next-action guidance, lesson ordering, and PathFinder use the same
rules. PathFinder repeats the top three priorities on days 1/3/6, 2/5, and 4;
an unmeasured matrix rotates all five domains. A 10–60 minute slider changes
session guidance and the time allocation without persisting completion claims.
Exercise links use `/practice?exercise=<id>` and initialize the matching domain,
challenge, and starter code. Completed diagnostic answers and submissions
invalidate the matrix, resilience, and individual lesson query caches.

Shared spotlight styling adds a restrained blue tint in light and dark themes.
Existing reduced-motion behavior and keyboard focus indicators remain supported.
`server/tests/learningRecommendations.test.ts` covers exploration, confidence,
weak-skill ordering, and spaced repetition.

*End of Document — 12_Project_Guide.md*
