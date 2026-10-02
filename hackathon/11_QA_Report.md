# QA Test Execution Report

## AI-Driven Adaptive Learning Platform

| Field | Detail |
|---|---|
| **Document ID** | 11_QA_Report |
| **Version** | 1.0 |
| **Execution Date** | 2026-08-29 |
| **Author** | Syed Azan Mehdi Shah |
| **Test Plan** | 10_QA_Test_Plan.md |
| **Environment** | Node 24 · Express 5 (mock AI mode) · embedded MongoDB · Vite SPA · Windows 10 |

---

## 1. Executive Summary

| Metric | Result |
|---|---|
| Automated API cases | **51 / 51 passed** (`scripts/qa_api.sh`) |
| Automated unit/integration tests | **24 / 24 passed** (Vitest + Supertest) |
| Browser UI verifications | **10 / 10 passed** |
| Security checks | **All passed** (headers, rate limits, token tampering, injection) |
| Open S1/S2 defects | **0** |
| AI mode | Live Gemini (`gemini-3.6-flash`) with graceful fallback on quota/timeout |
| Verdict | **PASS — MVP is release-ready for demo/hackathon environments** |

The system was exercised end-to-end: registration → adaptive diagnostic → lesson adaptation →
code evaluation → chatbot → subscription upgrade → Memory Twin forecast → Rescue Review →
Struggle DNA → admin actions → audit trail. Every premium gate returned the correct status
code, and no cross-user data leak was observed. The API is now DB-aware (`/health` reports
`db: up/down` and returns 503 when the database is unreachable), and chat never errors on
Gemini quota/failure — it degrades to a transparent, flagged knowledge-base answer instead.

---

## 2. Results by Area

### 2.1 Authentication & Sessions — PASS (8/8)

Register/login/refresh flows return correct codes; short passwords rejected (400); duplicate
emails rejected (409); wrong credentials rejected (401); suspended accounts blocked (403);
tampered JWTs rejected (401). Tokens carry `role` and `plan` claims and are issuer-bound.

### 2.2 RBAC & Ownership — PASS (5/5)

Students receive 403 on all admin routes; missing tokens receive 401; cross-user access to
another student's submission feedback is denied (403) while owners can read their own (200).

### 2.3 Diagnostic & Capability Matrix — PASS (5/5)

Dynamic questions are generated without exposing `correctIndex`; answering records recall
traces; completing the run builds the matrix (all attempted domains, status `complete`).

### 2.4 Adaptive Lessons — PASS (4/4)

Catalog serves 4 seeded lessons; canonical content is served when mastery is sufficient;
adaptation triggers for weak domains with a human-readable reason; repeated requests are
served from cache.

### 2.5 Code Evaluation — PASS (5/5)

Submissions return structured evaluations with exactly four score dimensions; unknown
exercises return 404; feedback ownership enforced per user.

### 2.6 AI Mentor Chatbot — PASS (6/6)

Domain questions return correct, domain-tagged answers ("recursion" → mentions base case,
tagged `algorithms`); off-topic questions get graceful fallbacks; history is strictly
per-user (isolation verified with a second account); unauthenticated requests rejected;
clear-history works.

### 2.7 Subscription & Premium — PASS (8/8)

Free users receive **402 PREMIUM_REQUIRED** on Memory Twin and a locked Struggle DNA teaser;
upgrade promotes the plan and reissues tokens; double upgrade returns 409; premium users get
the 15-point forecast, can complete Rescue Reviews (stability increases), and receive the full
4-axis DNA report with countermeasures. Admin plan grants are audit-logged.

### 2.8 Admin Console — PASS (6/6)

User listing includes plan badges; suspension blocks subsequent logins (403); analytics and
audit log respond correctly; the `user.update` action appears in the audit trail.

### 2.9 Security — PASS (7/7)

| Check | Evidence |
|---|---|
| Production CSP | Strict allow-list emitted (`default-src 'self'`, Monaco CDN allow-listed) |
| HSTS / X-Frame-Options / nosniff / no-referrer | All present (5/5 header families detected) |
| Login rate limit | **429 observed** after exceeding 10 attempts/15min |
| Global API limit | 300/15min/IP configured and active |
| JWT issuer binding | Verification enforces `iss` claim |
| Secrets | Environment-variable only; `.env` git-ignored |
| Chat rate limit | 60/15min per user configured |

### 2.10 UI / Responsive / UX — PASS (10/10)

| ID | Verified in browser |
|---|---|
| UI-01 | Login hero renders a WebGL canvas (3D scene) |
| UI-02 | Registration lands on dashboard with teasers |
| UI-03 | Diagnostic question renders; answering shows feedback |
| UI-04 | Playground submission renders 4-dimension feedback panel (verified earlier this session) |
| UI-05 | Chat send renders user + assistant bubbles |
| UI-06 | Mobile hamburger opens with 7 links + logout, closes on toggle |
| UI-07 | Admin sidebar hidden on mobile, opens on toggle with backdrop |
| UI-08 | Subscribe flips badge to ★ Adaptive+ and lands on Memory Twin |
| UI-09 | Forecast chart, danger line, and Rescue CTA render |
| UI-10 | Reduced-motion gating present (JS helper + CSS media query) |

### 2.11 Non-Functional — PASS (4/4)

Health endpoint reports `aiMode: mock`; server restarts re-seed admin + lessons automatically;
every AI feature works offline via the deterministic fallback; client and server typecheck clean.

---

## 3. Defect Log (this QA cycle)

| ID | Severity | Description | Resolution |
|---|---|---|---|
| D-01 | S4 | QA harness: regex assertion mangled through argv (false FAIL) | Harness fixed (`indexOf`); product confirmed correct |
| D-02 | S4 | QA harness: `${QEMAIL}` inside single quotes never expanded | Harness fixed (double-quoted payloads, unique email per run) |
| D-03 | S2 | Zombie server process held port 5000 after a kill; its DB was already gone → 500s | Zombie killed; clean restart; **finding:** document graceful shutdown (`SIGTERM`) for deployments |
| D-04 | S2 | Mongoose model interfaces (`ILesson`, `ICapabilityMatrix`, `IUser`) omitted `extends mongoose.Document` → `tsc` error TS2339 on `.save()` | Updated interfaces to extend `mongoose.Document`; `npm run build` green |
| D-05 | S3 | Dev env `AI_TIMEOUT_MS=20000` + placeholder key caused test timeout in Vitest 5000ms limit | Normalized dev/test default `AI_TIMEOUT_MS=2000` & mock mode key handling; 19/19 Vitest tests green |
| D-06 | S1 | `.env` pinned deprecated `gemini-2.0-flash` → every live AI call returned 404 | Updated model to `gemini-3.6-flash` in `.env` + `env.ts` default; live chat/diagnostic verified |
| D-07 | S2 | Global `sanitizeFilter` stripped legitimate `$gte` in submission rate-limit query → 500s on code submit | Removed blunt global filter; injection guarded precisely via controller whitelisting + Zod; 51/51 QA green |
| D-08 | S3 | Malformed submission `ObjectId` (e.g. `undefined`) threw CastError → 500 | `mongoose.isValidObjectId` guard → clean 404 |
| D-09 | S3 | Malformed JSON body surfaced as 500 INTERNAL | Body-parser errors mapped to 400 `INVALID_JSON` / 413 `PAYLOAD_TOO_LARGE` |
| D-10 | S3 | Live-Gemini chat test assumed no API key → false failure once a key was configured | Test made quota-tolerant; later superseded by D-11's always-works contract |
| D-11 | S2 | Chat surfaced a hard "Gemini is unavailable" 503 to learners when the free-tier quota/rate limit was hit | Chat now degrades gracefully to the built-in knowledge base (reply flagged `degraded`, UI shows a transparent amber notice) — Ask AI never errors |

Defects resolved during the build phase (carried for completeness): Zod schema stripped the
question `rationale` field; Mongoose Mixed-path change tracking dropped matrix updates; chat
history query-shape mismatch kept the UI list empty; embedded-MongoDB `dbPath` ENOENT on first
boot; a duplicate `maxItems` declaration broke compilation. All fixed and regression-covered.

## 4. Known Limitations & Risks

- **Billing is mocked** — the upgrade endpoint flips the plan directly; Stripe integration is a
  single-endpoint swap (see `08_MVP_and_Roadmap.md`).
- **Dev database is ephemeral** — resets on restart by design; point `MONGO_URI` at MongoDB for
  persistence.
- **Rate-limit state is in-memory** — use a shared store (e.g., Redis) before scaling past one
  instance.
- **AI runs in mock mode** until `GEMINI_API_KEY` is configured; structured-output validation
  applies in both modes.
- Process supervision is manual in dev; production deployments should run under a process
  manager with graceful shutdown hooks.

## 5. Recommendation

**Sign-off: PASS.** All exit criteria from the test plan are met: 100% automated suite green,
zero unresolved S1/S2 findings, correct premium gating, and hardened security headers verified
in production mode. The MVP is approved for hackathon demonstration and stakeholder preview.

---

*End of Document — 11_QA_Report.md*
