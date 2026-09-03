# MVP Status & Roadmap

## AI-Driven Adaptive Learning Platform

| Field | Detail |
|---|---|
| **Document ID** | 08_MVP_and_Roadmap |
| **Version** | 1.1 |
| **Date** | 2026-08-31 |
| **Author** | Syed Azan Mehdi Shah |
| **Audience** | Founder, engineers, investors |

---

## 1. What the MVP ships today

Everything below is **implemented, tested, and verified** in this repository:

| Area | Status |
|---|---|
| Auth (register/login/refresh) with issuer-bound JWTs | Shipped |
| RBAC (`student` / `admin`) + object-level ownership guards | Shipped, 19/19 tests |
| Adaptive diagnostic → Capability Matrix (5 domains) | Shipped |
| Lesson adaptation (tier × learning style, cached) | Shipped |
| Code playground + 4-dimension structured evaluation | Shipped |
| General AI mentor chatbot (multi-domain knowledge base) | Shipped |
| Memory Twin™: forgetting curves + 14-day forecast | Shipped (premium) |
| Rescue Reviews with stability reinforcement | Shipped (premium) |
| Struggle DNA™ archetypes + countermeasures | Shipped (premium) |
| Freemium gating (402 PREMIUM_REQUIRED) + mock upgrade | Shipped |
| Domain Compass™: 64 domains in 12 fields, study paths, 10-year trend radar | Shipped |
| PathFinder™: adaptive 7-day study planner (weakness-spaced) | Shipped |
| Career Autopilot™: JD → gap analysis + 90-day plan | Shipped (premium) |
| System Design Dojo™: 6 challenges + 4-axis AI critique | Shipped |
| Skill Passport™: portable verifiable skill document + resume export | Shipped |
| Scholarship Radar™: 15 fully-funded programmes, live countdowns, matching | Shipped |
| Freelance Launchpad™: matrix-grounded freelance profile generator | Shipped |
| Global Access Doctrine™: PPP regional pricing + Urdu dual-language glossary | Shipped |
| Admin console: users, curriculum, analytics, audit, plans | Shipped |
| Responsive UI (mobile nav, slide-in admin sidebar) | Shipped |
| Monochrome black & white design system, dark + light, WCAG-audited | Shipped |
| Security: helmet CSP, rate limits, CORS policy, audit log | Shipped |
| Animations: GSAP + Three.js hero + Motion micro-interactions | Shipped |
| Test suite: 40/40 server tests + 52-check live QA script | Passing |

## 2. What is mocked (and how to swap it)

The MVP is honest about its seams — each mock has a single, documented swap point:

| Subsystem | Current state | Production swap |
|---|---|---|
| AI engine | Gemini when `GEMINI_API_KEY` is set; deterministic mock provider otherwise; automatic fallback on quota/timeout/schema failure | Add `GEMINI_API_KEY` to `server/.env` — zero code changes |
| Scholarship pool | Curated static dataset (`data/scholarships.ts`) | Swap for an official programme feed or admin-managed CRUD |
| Database | Ephemeral embedded MongoDB | Set `MONGO_URI` (Atlas/local) — zero code changes |
| Billing | `POST /premium/upgrade` flips the plan directly | Replace the body of `upgrade` in `premiumController.ts` with Stripe Checkout + webhook handler |
| Email/notifications | None | Add provider in `services/` (decay alerts are already computable) |
| Code execution | Static/AI analysis only (safe by design) | Optional sandboxed runner behind `evaluationService` |

## 3. Extension points (designed for the future)

- **`server/src/services/`** — every AI capability is one file with `generateStructured(prompt, schema, mock)`; new features follow the same pattern (schema → service → controller → route → RBAC).
- **`shared/src/schemas.ts`** — single source of truth for request + AI-output validation across client and server.
- **`server/src/config/security.ts`** — all headers/CORS/rate limits in one place; tighten per-environment here.
- **Plan claims in JWT** — adding new tiers (e.g., `team`, `institutional`) extends `requirePlan`, not the auth core.
- **Knowledge base** (`data/knowledgeBase.ts`) — grows into a real dataset/RAG source without touching the chat service.
- **Recall traces** — the Memory Twin's raw event log; ready for longitudinal ML modeling.

## 4. Roadmap

### Phase 1 — Beta readiness (0-6 months)
1. Stripe billing + webhook-driven plan state (replace mock upgrade).
2. Real `MONGO_URI` deployment (Atlas) + connection pooling.
3. Add `GEMINI_API_KEY`; monitor structured-output validation failures.
4. Instrument funnel: registration → diagnostic completion → premium conversion.
5. CI/CD (GitHub Actions: lint → test → build → deploy).

### Phase 2 — Growth (6-18 months)
1. Longitudinal validation of the forgetting-curve model (recall-trace data).
2. Fine-tune/prompt-specialize Gemini on aggregated struggle patterns.
3. Mobile app (React Native) reusing the API contract.
4. Institutional analytics console (bootcamps, universities) — B2B2C tier.
5. Decay-alert notifications (email/push) driven by the Memory Twin.
6. Opportunity-layer partnerships: official scholarship feeds and freelance-marketplace referral links behind the Radar and Launchpad.

### Phase 3 — Scale
1. Multi-domain curricula beyond CS (the engine is curriculum-agnostic).
2. Marketplace for lesson packs + adaptation styles.
3. Research partnerships on memory modeling (publishable moat).

## 5. Known limitations (MVP honesty)

- Access tokens live in `localStorage` (SPA convention); production may move to
  httpOnly cookie sessions if the threat model demands it.
- Rate limits are per-IP in-memory; use a shared store (Redis) when scaling horizontally.
- The mock provider's question bank is small; Gemini mode removes this ceiling.
- No horizontal load testing yet (architecture is stateless and ready).

---

*End of Document — 08_MVP_and_Roadmap.md*
