# Project Guide

## AI-Driven Adaptive Learning Platform

| Field | Detail |
|---|---|
| **Document ID** | 12_Project_Guide |
| **Version** | 1.1 |
| **Date** | 2026-08-31 |
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
| MongoDB | **Not required** — an embedded in-memory MongoDB runs automatically |
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
| `GEMINI_API_KEY` | Switches AI from the deterministic mock to real Gemini (structured outputs, schema-validated). Without it, everything still works offline. |
| `GEMINI_API_KEY_2` | Optional second key. Free-tier quota is per key, so a second key doubles capacity for the AI decision paths. |
| `GEMINI_MODEL` / `GEMINI_FALLBACK_MODELS` | Primary model and comma-separated rollover list (quota/overload cascade). |
| `AI_TIMEOUT_MS` | Per-attempt Gemini timeout (dev `.env` uses 12000 to ride out free-tier latency spikes). |
| `MONGO_URI` | Point at MongoDB Atlas / local mongod for persistent data. Empty = embedded ephemeral DB (resets on restart). |
| `JWT_SECRET` | Change for any non-local deployment. |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Override the seeded admin. |

### 2.6 Tests & QA

```bash
npm test              # 40/40 Vitest + Supertest (RBAC matrix, AI services, hardening, opportunity layer)
bash scripts/qa_api.sh   # 52 automated end-to-end API checks against the live server
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
| Capability dashboard | Chart.js radar of domain mastery, animated stats, weak-area highlights, Urdu dual-language glossary |
| AI Mentor Chat | Domain-general chatbot with private per-user history and topic tagging |
| Domain Compass™ | 64 computing domains across 12 fields, each with a detailed breakdown and a 4-stage study path; field-level 2026–2036 demand forecasts + viral-potential scores; deep-links to filtered lessons |
| PathFinder™ Planner | Adaptive 7-day study schedule ranked weakest-first with spacing; re-plans after each diagnostic |
| System Design Dojo™ | Six system-design challenges graded on a 4-axis interview rubric (Clarify → Estimate → Model → Architect → Scale) |
| Skill Passport™ | Portable, verifiable proof of skill with a stable ID; JSON download + clipboard + resume export |
| Scholarship Radar™ | 15 curated fully-funded scholarships with live rolling deadline countdowns + match scoring and filters |
| Freelance Launchpad™ | AI-drafted, matrix-grounded freelance profile (niche, skills, gigs, rate) you can copy to any marketplace |
| Mastery loop | Every diagnostic answer and submission updates the matrix; feedback history per exercise |

### 3.2 Premium features (Adaptive+)

| Feature | Description |
|---|---|
| Memory Twin™ | Per-skill forgetting curves fitted to real practice history; 14-day retention forecast with a 50% danger line |
| Rescue Reviews | 2-minute AI micro-sessions targeting the weakest memory; each successful recall increases stability |
| Struggle DNA™ | 4-axis cognitive profile (Resilience, Depth Tolerance, Edge Awareness, Craft) + struggle archetype + targeted countermeasures |
| Career Autopilot™ | Paste any JD → importance-weighted gap analysis vs. your matrix + hire-readiness score + 90-day plan |
| One-click upgrade | Mock billing endpoint reissues tokens with the premium plan claim; PPP regional pricing on the upgrade page; admins can grant/revoke |

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
| UI / UX | Strict monochrome black & white design system in dark + light themes (Plus Jakarta Sans & JetBrains Mono), WCAG-AA contrast-audited on every route |
| Security | Issuer-bound JWT, RBAC + plan gating (403/402), helmet CSP + HSTS, rate limits, ownership checks, audit logging |
| Responsive | Mobile-first: hamburger nav, slide-in admin sidebar, safe-area insets, dvh layouts, scrolling tables; 14-link student nav fits all breakpoints |
| Animations | GSAP entrances, Three.js 3D hero, Motion micro-interactions — all honoring `prefers-reduced-motion` |
| Reliability | Every AI path has a deterministic fallback; the demo never fails offline |
| QA | 52/52 live API checks, 40/40 Vitest tests passing, production security-header verification — see docs/10 + docs/11 |

---

## 4. Unique Features (Why This Product Is Different)

> Full pitch-ready version: **`docs/13_Unique_Features.md`** (also available as Word).

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

### 4.6 Career Autopilot™ — paste any JD, get hire-ready in 90 days
The demo that sells itself: a student pastes any job posting and the platform diffs every
required skill against their live Capability Matrix (strong / developing / gap / unmeasured),
computes an importance-weighted hire-readiness score, and generates a deterministic 90-day,
three-phase plan. Prompt-injection safe, rate-limited, premium-gated.

### 4.7 The opportunity layer — Passport, Scholarships, Freelance
Learning platforms stop at "you learned it." This layer answers *"what do I do with it?"* —
a portable, verifiable **Skill Passport** (JSON + resume export), a **Scholarship Radar** of
15 fully-funded programmes with live deadline countdowns and match scoring, and a
**Freelance Launchpad** that drafts a marketplace-ready profile grounded in the student's
measured skills. All free, all deterministic or AI-assisted with fallbacks.

### 4.8 Global Access Doctrine™ — fair pricing, native language
Purchasing-power-parity pricing across eight regional points (Pakistan ₨999 default) plus a
Urdu dual-language glossary. A wedge into the markets where the next billion learners live.

---

## 5. Repository Map

| Path | What lives there |
|---|---|
| `client/` | React 19 SPA — student experience + admin console |
| `server/src/routes` · `controllers` · `middleware` | MVC API surface (Express 5) |
| `server/src/services` | All AI orchestration: diagnostic, adaptation, evaluation, matrix, chat, memory, DNA, autopilot, dojo, passport, scholarship, freelance + mock provider |
| `server/src/models` | User, CapabilityMatrix, Lesson, CodeSubmission, AuditLog, ChatMessage, AutopilotPlan, DesignCritique, FreelanceProfile, Settings |
| `server/src/config` | env, db (embedded MongoDB), bootstrap, **security (helmet/CORS/rate limits)** |
| `shared/` | Zod schemas shared by client + server |
| `scripts/qa_api.sh` | Automated QA suite |
| `docs/` | PRD, technical docs, manuals, QA plan/report, roadmaps, pitch decks |

---

## 6. Quick Troubleshooting

| Symptom | Fix |
|---|---|
| Port 5000 busy | A previous server instance is still running; stop it or change `PORT` |
| Data disappeared | Embedded DB is ephemeral by design; set `MONGO_URI` for persistence |
| AI answers feel canned | That's mock mode — add `GEMINI_API_KEY` for real Gemini |
| 402 on Memory Twin/DNA | Expected for free accounts — subscribe or have an admin grant premium |
| Rate-limited (429) | Login 10/15min, chat 60/15min, autopilot/dojo/freelance 10/15min, global 300/15min — windows reset automatically |

---

*End of Document — 12_Project_Guide.md*
