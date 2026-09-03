# AI-Driven Adaptive Learning Platform

**Created by Syed Azan Mehdi Shah**

A personalized education platform that acts as a dynamic AI tutor: it diagnoses each
student with adaptive AI-generated tests, rewrites lessons to match their level and
learning style, mentors code submissions with structured, tiered feedback, and answers
questions across all domains through a general AI mentor chatbot.

- **Stack:** MERN — MongoDB (Mongoose), Express 5, React 19 + Vite, Node.js — TypeScript
- **Architecture:** strict MVC with a dedicated `server/src/services/` AI orchestration layer
- **AI engine:** official `@google/genai` SDK (Gemini) with JSON structured outputs;
  falls back to a deterministic mock provider when no API key is set
- **Security:** JWT (issuer-bound) + RBAC + plan gating, helmet with strict production CSP,
  rate limiting (global + auth + chat), centralized in `server/src/config/security.ts`
- **Monetization:** freemium — Adaptive+ Premium gates Memory Twin™ (skill-decay forecast +
  Rescue Reviews) and Struggle DNA™ (error-archetype profiling); mock billing endpoint
- **UX:** production-ready dark glassmorphism design system (Plus Jakarta Sans & JetBrains Mono typography,
  glowing active badges, 1-click Quick Demo login, mobile hamburger drawer, slide-in admin sidebar, safe-area insets,
  dvh-based chat layout), GSAP + Three.js + Motion animations with `prefers-reduced-motion` support
- **QA:** signed off with 51/51 automated API checks + 24/24 Vitest integration tests + production security-header
  verification (`docs/10_QA_Test_Plan.md`, `docs/11_QA_Report.md`)

## Quickstart

```bash
npm install                # installs all workspaces (shared, server, client)

# Optional — configure secrets/keys (the app runs without this, on an embedded DB + mock AI):
cp server/.env.example server/.env    # then set GEMINI_API_KEY, MONGO_URI, JWT_SECRET

# Terminal 1 — API (http://localhost:5000/api/v1)
npm run dev:server         # auto-seeds a default admin + lessons on boot

# Terminal 2 — React SPA (http://localhost:5173)
npm run dev:client
```

> **Secrets:** `.env` files are git-ignored (`.env`, `.env.*`); commit only the `.env.example`
> templates, which hold placeholders. Never commit real keys — rotate any credential that was
> ever shared, pasted, or exposed.

Open http://localhost:5173, register a student, and run the diagnostic.
Sign in as the seeded admin (`admin@example.com` / `Admin1234!`) to access `/admin`.
Override the seeded admin via `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` env vars,
or use `npm run seed:admin -- --email <e> --password <p>` against a persistent DB.

### Database

No local MongoDB is required: when `MONGO_URI` is empty the server starts an embedded
MongoDB that **persists to `server/mongo-data/`**, so accounts and data survive restarts and
hot reloads (the default admin and lessons are re-seeded automatically). Delete that folder
for a clean slate. Set `MONGO_URI` in `server/.env` (MongoDB Atlas or local mongod) for a real
database — it is **required in production**. Tests always run against a fresh ephemeral DB.

### AI mode

- Without `GEMINI_API_KEY`: all AI features run on a deterministic mock provider
  (`server/src/services/mockAi.ts`) — full loop works offline.
- With `GEMINI_API_KEY` in `server/.env`: calls go to Gemini (structured JSON outputs,
  schema-validated before persistence) with automatic fallback to the mock on
  timeout/error.

Check `GET /api/v1/health` → `{ "aiMode": "gemini" | "mock" }`.

## Workspaces

| Path | Contents |
|---|---|
| `shared/` | Zod schemas + types shared by client and server |
| `server/` | Express 5 MVC API (routes, controllers, middleware, models, services) |
| `client/` | React 19 SPA (student experience + admin console) |
| `docs/` | PRD, technical documentation, manuals, implementation plan, deck |

## Key scripts

| Script | Purpose |
|---|---|
| `npm run dev:server` | API with hot reload (tsx watch) |
| `npm run dev:client` | Vite dev server with `/api` proxy |
| `npm run seed:admin` | Provision admin (flags: `--email`, `--password`) |
| `npm run seed:lessons` | Upsert canonical lessons + settings |
| `npm test` | Server tests (Vitest + Supertest, in-memory MongoDB) |

## Golden rules (see AGENTS.md)

1. Controllers never call Gemini — all AI access goes through `server/src/services/`.
2. Every AI output is schema-validated (Zod) before it reaches MongoDB.
3. Every protected route has auth + RBAC middleware; student resources check ownership.
4. Every user-facing AI path has a fallback (cached/canonical content or mock provider).

## Documentation

| Doc | Description |
|---|---|
| `docs/01_PRD.md` | Requirements, personas, Gherkin acceptance criteria |
| `docs/02_Technical_Documentation.md` | Architecture, data models, API contract |
| `docs/03_Manual_Guide.md` | Developer setup and troubleshooting |
| `docs/04_User_Manual.md` | Student and admin guides |
| `docs/05_Platform_Overview.pptx` | Product overview deck (features + architecture) |
| `docs/06_Implementation_Plan.md` | Phased roadmap this codebase follows |
| `docs/08_MVP_and_Roadmap.md` | MVP scope, mocked subsystems, extension points |
| `docs/07_Investor_Pitch_Deck.pptx` | Seed-round investor deck |
| `docs/09_Hackathon_Pitch.pptx` | Hackathon demo deck with speaker notes |
| `docs/10_QA_Test_Plan.md` | Full QA test case matrix with PRD traceability |
| `docs/11_QA_Report.md` | QA execution report (51/51 API, 24/24 tests) |
| `docs/12_Project_Guide.md` | How to run the project + complete & unique features |
| `docs/13_Unique_Features.md` | What makes the platform different (pitch-ready) |
| `docs/14_Vercel_Deployment_Guide.md` | Step-by-step Vercel deploy (Atlas + dashboard/CLI) |
| `docs/15_Pitch_Deck.pptx` | Competition pitch — problem, solution, impact, innovation, feasibility |
| `docs/16_University_Pitch_Deck.pptx` | University submission pitch (same 5 sections) — supervisor: Mr. Asif Raza, University of Mianwali |
| `docs/17_Pro_Pitch_Deck.pptx` | Detailed 18-slide animated pitch for a technical team lead — fade transitions + build-on-click entrance animations |
| `scripts/qa_api.sh` | Rerunnable automated QA suite |
