# AGENTS.md — AI Coding Agent Instructions

Created by **Syed Azan Mehdi Shah**.

Guidance for AI coding agents (and human contributors) working in this repository.

## Project Overview

**AI-Driven Adaptive Learning Platform** — a personalized education platform for computer science and software development. It acts as a dynamic AI tutor: it diagnoses each student with Gemini-generated adaptive tests, rewrites lessons to match their level and learning style, and mentors code submissions with tiered, structured feedback.

## Stack (non-negotiable)

- **MERN**: MongoDB (Mongoose), Express.js, React.js, Node.js
- **Architecture**: strict **MVC** + dedicated `server/src/services/` layer for all AI orchestration
- **AI**: official `@google/genai` SDK, Gemini 2.5 / 3.7 Flash, **JSON Structured Outputs** persisted to MongoDB; deterministic mock fallback when no key is set
- **Security**: issuer-bound JWT + RBAC + plan gating (`student`/`admin`, `free`/`premium`); headers/CORS/rate limits centralized in `server/src/config/security.ts`
- **Responsive**: mobile-first Tailwind breakpoints; mobile hamburger nav + slide-in admin sidebar

## Repository Layout

| Path | Purpose |
|---|---|
| `client/` | React SPA (student + admin views) |
| `server/src/config/` | env, db, bootstrap, **security (helmet/CORS/rate limits)** |
| `server/src/routes/` | Route definitions |
| `server/src/controllers/` | Request handling; input validation |
| `server/src/middleware/` | `authMiddleware` (authenticate/requireRole/**requirePlan**), ownership, errors |
| `server/src/models/` | Mongoose schemas (User, CapabilityMatrix, Lesson, CodeSubmission, AuditLog, **ChatMessage**) |
| `server/src/services/` | **All Gemini/AI orchestration lives here** (diagnostic, adaptation, evaluation, matrix, **chat, memory, dna**, mock) |
| `server/src/data/` | Seed content: lessons, exercises, **knowledgeBase (chat fallback)** |
| `shared/src/schemas.ts` | Zod schemas shared by client + server (requests + AI outputs) |
| `docs/` | PRD, technical docs, manuals, MVP roadmap, decks |

## Hard Rules

1. **AI isolation** — Controllers must NEVER import `@google/genai`. All AI calls go through `server/src/services/`. Keep AI latency from blocking standard web traffic.
2. **Structured outputs** — Every AI call must declare a response schema (see `shared/src/schemas.ts`) and validate the result before persisting. No free-form AI text written to the database.
3. **RBAC everywhere** — Admin routes must use `requireRole('admin')`. Student routes must verify object ownership against the JWT subject (no cross-user access).
4. **Plan gating** — Premium endpoints must use `requirePlan('premium')` and return 402 for free callers. Never read the plan from the request body — only from the verified JWT claim.
5. **Fallbacks** — Every user-facing AI path must degrade gracefully (cached/canonical content or the mock provider) on timeout or schema failure. Budget: AI responses < 2s at P95.
6. **Security config** — Helmet/CORS/rate-limit changes belong in `server/src/config/security.ts` only. Never add headers middleware inline in `app.ts`. New AI-backed endpoints need a rate limit.
7. **Secrets** — Never hardcode `GEMINI_API_KEY`, `JWT_SECRET`, or DB URIs. Environment variables only; `.env` is git-ignored.
8. **No executing student code on the main server.** Evaluation is AI/static analysis or a sandboxed runner.
9. **Audit logging** — Admin mutating actions (including plan grants) must be written to the audit log.

## Conventions

- ES modules; `async/await` (no raw callback chains)
- Controllers: parse → validate → delegate to service → respond. No business logic.
- Services: pure orchestration; return plain objects matching the output schema.
- Errors: throw typed errors; `errorMiddleware` shapes the `{ error: { code, message, status } }` contract.
- AI prompts are built server-side; student input is embedded as data, never as instructions (prompt-injection mitigation).
- Cache AI adaptations keyed by `hash(conceptId + levelTier + style)`.

## Adding a New AI Feature — Checklist

1. Schema in `server/utils/schemas.js`
2. Service function in `server/services/*Service.js` with fallback path
3. Controller + route with correct auth/RBAC middleware
4. Rate limiting for user-triggered endpoints
5. Tests: mocked Gemini client + RBAC matrix entry

## Commands

```bash
npm install && cd client && npm install   # install
npm run dev                               # API server (port 5000)
cd client && npm run dev                  # React SPA (port 5173)
npm run seed:admin -- --email <e> --password <p>
npm test                                  # unit + integration
npm run test:ai                           # AI services (mocked)
```

## Definition of Done

- New endpoints have RBAC middleware and ownership checks
- AI paths have schemas, fallbacks, and mocked tests
- RBAC matrix test updated for any new route
- No secrets in code; no AI calls outside `services/`
- Docs updated if behavior or API surface changes (`docs/`)

## Reference Documents

- `docs/01_PRD.md` — requirements and acceptance criteria
- `docs/02_Technical_Documentation.md` — architecture and data models
- `docs/03_Manual_Guide.md` — setup, scripts, troubleshooting
