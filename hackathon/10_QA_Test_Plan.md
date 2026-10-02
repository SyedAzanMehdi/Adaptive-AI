# QA Test Plan

## AI-Driven Adaptive Learning Platform

| Field | Detail |
|---|---|
| **Document ID** | 10_QA_Test_Plan |
| **Version** | 1.0 |
| **Date** | 2026-08-29 |
| **Author** | Syed Azan Mehdi Shah |
| **Companion** | 11_QA_Report.md (execution results) |

---

## 1. Scope & Approach

This plan verifies the MVP end-to-end across six quality dimensions:

| Dimension | Method |
|---|---|
| Functional correctness | Automated Vitest/Supertest suite + scripted API checks |
| Authorization & security | RBAC matrix, token tampering, header inspection, rate limits |
| AI behavior | Structured-output validation, fallback mode, domain tagging |
| Monetization gating | 402 enforcement, upgrade flow, rescue reinforcement |
| UI/UX | Browser-driven flows (student + admin), responsive breakpoints |
| Non-functional | Production security headers, ephemeral-DB resilience |

**Environment:** Node 24, Express 5 dev server on :5000 (mock AI mode, embedded ephemeral MongoDB), Vite SPA on :5174, in-app browser for UI checks.

**Severity scale:** S1 blocker · S2 major · S3 minor · S4 cosmetic.

---

## 2. Test Cases

### 2.1 Authentication & Sessions

| ID | Case | Expected |
|---|---|---|
| AUTH-01 | Register with valid payload | 201, JWT + refresh token + user object (plan=free) |
| AUTH-02 | Register duplicate email | 409 EMAIL_EXISTS |
| AUTH-03 | Register with short password (<8) | 400 VALIDATION_ERROR |
| AUTH-04 | Login valid credentials | 200 with tokens |
| AUTH-05 | Login wrong password | 401 INVALID_CREDENTIALS |
| AUTH-06 | Login suspended account | 403 ACCOUNT_SUSPENDED |
| AUTH-07 | Refresh with valid refresh token | 200, rotated tokens |
| AUTH-08 | Tampered token on protected route | 401 TOKEN_INVALID |

### 2.2 RBAC & Ownership

| ID | Case | Expected |
|---|---|---|
| RBAC-01 | Student → admin route | 403 FORBIDDEN_ROLE |
| RBAC-02 | Admin → admin route | 200 |
| RBAC-03 | No token → protected route | 401 |
| RBAC-04 | Student reads another student's submission | 403 FORBIDDEN_OWNER |
| RBAC-05 | Student reads own submission feedback | 200 |

### 2.3 Diagnostic & Capability Matrix

| ID | Case | Expected |
|---|---|---|
| DIAG-01 | Start diagnostic | 200, question with ≥2 choices, correctIndex NOT exposed |
| DIAG-02 | Answer a question | 200, wasCorrect boolean + rationale + next question |
| DIAG-03 | Complete full diagnostic | completed=true, matrix covers attempted domains |
| DIAG-04 | Wrong answers adapt difficulty downward | difficulty decreases after misses |
| DIAG-05 | Recall traces recorded | matrix.recalls grows with each answer |

### 2.4 Adaptive Lessons

| ID | Case | Expected |
|---|---|---|
| LESS-01 | List lessons | 200 with seeded catalog (4 lessons) |
| LESS-02 | Fetch lesson, no struggle | canonical content, adaptation.used=false |
| LESS-03 | Fetch lesson, weak domain (< threshold) | adapted content, adaptation.used=true + reason |
| LESS-04 | Repeat same adapted lesson | cached=true on second fetch |

### 2.5 Code Evaluation & Feedback

| ID | Case | Expected |
|---|---|---|
| CODE-01 | List exercises | 200 with 4 exercises |
| CODE-02 | Submit valid solution | 201, evaluation with 4 score dimensions |
| CODE-03 | Correct solution scores high correctness | correctness > 75 |
| CODE-04 | Submission updates capability matrix | matrix deltas applied |
| CODE-05 | Unknown exercise id | 404 EXERCISE_NOT_FOUND |

### 2.6 AI Mentor Chatbot

| ID | Case | Expected |
|---|---|---|
| CHAT-01 | Domain question ("What is recursion?") | 201, reply mentions base case, domain=algorithms |
| CHAT-02 | Off-topic question | 201, graceful fallback reply |
| CHAT-03 | Own history retrieval | 200 with prior messages |
| CHAT-04 | Other user's history isolation | 0 messages (no cross-user leak) |
| CHAT-05 | Unauthenticated chat | 401 |
| CHAT-06 | Clear history | 200, history emptied |

### 2.7 Subscription & Premium Features

| ID | Case | Expected |
|---|---|---|
| PREM-01 | Free user → /premium/memory | 402 PREMIUM_REQUIRED |
| PREM-02 | Free user → /premium/dna | 200, locked=true teaser |
| PREM-03 | Upgrade to premium | 200, plan=premium, new tokens |
| PREM-04 | Repeat upgrade | 409 ALREADY_PREMIUM |
| PREM-05 | Premium → /premium/memory | 200 with domains + forecast |
| PREM-06 | Rescue review start → 2 answers | completed=true, stabilityDays > 0 |
| PREM-07 | Premium → /premium/dna | 200, locked=false, 4 axes + countermeasures |
| PREM-08 | Admin grants/revokes plan | user.plan updated, audit-logged |

### 2.8 Admin Console

| ID | Case | Expected |
|---|---|---|
| ADMIN-01 | List users | 200 with role + plan columns |
| ADMIN-02 | Create user | 201, appears in list |
| ADMIN-03 | Suspend user → their login | 403 ACCOUNT_SUSPENDED |
| ADMIN-04 | Update curriculum settings | 200, persisted |
| ADMIN-05 | Analytics | 200 with counts |
| ADMIN-06 | Audit log records privileged action | entry present with action + meta |

### 2.9 Security

| ID | Case | Expected |
|---|---|---|
| SEC-01 | Production CSP header present | strict directive allow-list |
| SEC-02 | HSTS + X-Frame-Options + nosniff | present in production |
| SEC-03 | Login rate limit | 429 after 10 attempts/15min |
| SEC-04 | Global API rate limit configured | 300/15min/IP |
| SEC-05 | JWT issuer binding | tokens verified with iss check |
| SEC-06 | Secrets not in source | env-only references |
| SEC-07 | Chat rate limit | 60/15min per user |

### 2.10 UI / Responsive / UX

| ID | Case | Expected |
|---|---|---|
| UI-01 | Login hero renders 3D canvas | canvas present, WebGL active |
| UI-02 | Registration flow → dashboard | lands on / with empty-state matrix |
| UI-03 | Diagnostic question flow in browser | choices render, answering progresses |
| UI-04 | Code playground submission | feedback panel mounts with score pills |
| UI-05 | Chat send in browser | user + assistant bubbles render |
| UI-06 | Mobile hamburger menu | opens with 7 links + logout |
| UI-07 | Admin slide-in sidebar | hidden by default, opens on toggle |
| UI-08 | Premium upgrade in browser | badge flips to Adaptive+ |
| UI-09 | Memory Twin forecast (premium) | chart + rescue CTA render |
| UI-10 | Reduced-motion respected | animations gated by media query |

### 2.11 Non-Functional

| ID | Case | Expected |
|---|---|---|
| NFR-01 | Health endpoint | { status: ok, aiMode } |
| NFR-02 | Server restart (ephemeral DB) | boots clean, re-seeds admin + lessons |
| NFR-03 | AI fallback without key | aiMode=mock, all features work offline |
| NFR-04 | Type safety | client + server compile with no type errors |

---

## 3. PRD Traceability

| PRD Requirement | Test Cases |
|---|---|
| FR-1 Diagnostic | DIAG-01..05 |
| FR-2 Adaptation | LESS-01..04 |
| FR-3 Code evaluation | CODE-01..05 |
| FR-4 RBAC | RBAC-01..05, SEC-05 |
| FR-5 Chatbot | CHAT-01..06 |
| FR-6 Subscription | PREM-01..08 |
| FR-7 Memory Twin | PREM-05..06 |
| FR-8 Struggle DNA | PREM-02, PREM-07 |
| NFR Security | SEC-01..07, AUTH-08 |
| NFR Responsive | UI-06..07 |

## 4. Exit Criteria

- 100% of automated suite passing (19/19)
- 100% of S1/S2 manual cases passing
- Zero unresolved security findings
- All premium gating returns correct status codes

---

*End of Document — 10_QA_Test_Plan.md*
