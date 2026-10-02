# Product Requirements Document (PRD)

## AI-Driven Adaptive Learning Platform

| Field | Detail |
|---|---|
| **Document ID** | 01_PRD |
| **Version** | 1.1 |
| **Date** | 2026-08-29 |
| **Author** | Syed Azan Mehdi Shah |
| **Status** | Implemented (MVP shipped) |
| **Product Name** | AI-Driven Adaptive Learning Platform |
| **Platform Type** | Personalized, AI-tutored education platform for Computer Science & Software Development |

---

## 1. Executive Summary & Problem Statement

### 1.1 Executive Summary

The AI-Driven Adaptive Learning Platform is a personalized educational product that teaches computer science and software development. Instead of a one-size-fits-all curriculum, it acts as a **dynamic AI tutor** that adapts its teaching style, difficulty, and pacing to the exact background of each individual student.

The platform is built on the **MERN stack** (MongoDB, Express.js, React.js, Node.js) with a strict **MVC architecture** and a dedicated `/services` layer so that AI orchestration is fully decoupled from standard web traffic. The AI engine is powered by the official **`@google/genai` SDK** (Gemini 2.5 / 3.7 Flash models), relying heavily on **JSON Structured Outputs** so grading and feedback persist seamlessly into MongoDB. Security is enforced through **JWT authentication** combined with strict **Role-Based Access Control (RBAC)** middleware.

### 1.2 Problem Statement

Traditional online learning platforms deliver identical content to every learner regardless of prior knowledge, skill gaps, or learning style. This causes three systemic failures:

1. **Skill mismatch** — Beginners are overwhelmed by advanced material while experienced developers are bored by redundant fundamentals, leading to high dropout rates.
2. **No individualized diagnosis** — Static quizzes produce a score, not a capability map; platforms cannot tell *where* a student is weak or *why* they struggle.
3. **Delayed, shallow feedback** — Code submissions are graded only for correctness (pass/fail), ignoring style, edge cases, and optimization, and feedback often arrives hours or days later.

### 1.3 Product Vision

Deliver an AI tutor that, for every student:

- **Diagnoses** precisely what they know and don't know via dynamic, AI-generated assessments.
- **Adapts** lesson explanations in real time to the student's level and preferred learning style.
- **Mentors** their code with constructive, tiered feedback on correctness, style, edge cases, and optimization.
- **Tracks** mastery per concept so progress is measurable and personal.

### 1.4 Success Metrics

| Metric | Target |
|---|---|
| Diagnostic completion rate | ≥ 85% of new students |
| Lesson rewrite trigger accuracy (struggling students receiving adapted content) | ≥ 90% |
| Average AI response latency (P95) | < 2 seconds |
| Student retention at 30 days | ≥ 60% |
| Zero unauthorized cross-role data access incidents | 0 |

---

## 2. User Personas

### 2.1 Persona: Student (Learner)

| Attribute | Description |
|---|---|
| **Name** | Alex, the Adaptive Learner |
| **Role** | Student |
| **Background** | Ranges from complete beginner to intermediate developer seeking structured growth |
| **Goals** | Learn CS/software-development concepts at the right pace; understand *why*, not just *what*; get fast, constructive feedback on code |
| **Pain Points** | One-size-fits-all courses; unclear where personal knowledge gaps are; slow or pass/fail-only feedback |
| **Needs from Platform** | Accurate skill diagnosis, explanations matched to level and learning style, an in-browser code editor with tiered AI feedback, personal mastery tracking |
| **Key Behaviors** | Takes diagnostic assessment on signup, consumes lessons, submits code exercises, reviews feedback, revisits weak areas |
| **Permissions** | Read lessons, submit code, view own profile/mastery; **cannot** access other students' data or any admin functionality |

### 2.2 Persona: Admin (Curriculum / System Manager)

| Attribute | Description |
|---|---|
| **Name** | Sam, the Curriculum & System Manager |
| **Role** | Admin |
| **Background** | Educator or engineering lead responsible for curriculum quality and platform operations |
| **Goals** | Manage user accounts, oversee curriculum settings, monitor system analytics, ensure the AI behaves within pedagogical guardrails |
| **Pain Points** | No visibility into how students actually perform; inability to tune difficulty or content strategy; manual account management |
| **Needs from Platform** | Protected admin dashboard, user management (create/suspend/role assignment), curriculum configuration (topics, difficulty bands, rewrite policies), analytics on assessments, mastery, and AI usage |
| **Key Behaviors** | Reviews analytics dashboards, adjusts curriculum settings, manages student accounts, audits AI feedback quality |
| **Permissions** | Full access to admin routes, user management, curriculum settings, and system analytics; bound by least-privilege auditing |

---

## 3. Functional Requirements

### 3.1 Initial Diagnostic Assessment (Intelligent Diagnostics)

| ID | Requirement |
|---|---|
| **FR-1.1** | Upon registration, the system SHALL initiate a diagnostic assessment before serving curriculum content. |
| **FR-1.2** | The system SHALL use the Gemini API (via `@google/genai`) to **dynamically generate** code-reading and problem-solving questions tailored to the student's responses so far — not a fixed, static question bank. |
| **FR-1.3** | Question difficulty SHALL adapt in real time: correct answers raise difficulty; incorrect answers lower it and probe the suspected weak area. |
| **FR-1.4** | The system SHALL compile assessment results into a **User Capability Matrix** mapping strengths and weaknesses across defined CS competency domains (e.g., syntax, OOP, data structures, algorithms, debugging). |
| **FR-1.5** | The Capability Matrix SHALL be persisted in MongoDB as structured JSON and used as the basis for lesson adaptation. |
| **FR-1.6** | The student SHALL be able to pause and resume the diagnostic within a bounded validity window (e.g., 7 days). |
| **FR-1.7** | The diagnostic SHALL conclude after reaching a confidence threshold or a maximum item count (configurable by Admin). |

### 3.2 Dynamic Explanation Adaptation (Adaptive Lesson Delivery)

| ID | Requirement |
|---|---|
| **FR-2.1** | The system SHALL monitor student performance signals (quiz results, code submission outcomes, time-on-task, retry counts) to detect struggle with a concept (e.g., Object-Oriented Programming). |
| **FR-2.2** | When struggle is detected, the system SHALL identify the student's preferred learning style from their profile and **rewrite the lesson** via the AI engine. |
| **FR-2.3** | Rewrites SHALL be tiered by level: **beginners** receive physical, real-world analogies; **intermediate** learners receive memory/execution diagrams and trace walkthroughs; **advanced** learners receive internals-oriented explanations. |
| **FR-2.4** | Adapted lessons SHALL be served from the `/services` AI orchestration layer without blocking standard content delivery. |
| **FR-2.5** | The system SHALL store the student's inferred learning-style preference in their profile and refine it over time from engagement signals. |
| **FR-2.6** | The system SHALL preserve learning-objective parity: a rewritten lesson must teach the same objectives as the canonical lesson. |
| **FR-2.7** | The system SHALL cache generated adaptations per (concept × level × style) to control cost and latency. |

### 3.3 Code Evaluation & Automated Feedback Loop (Interactive Code Mentorship)

| ID | Requirement |
|---|---|
| **FR-3.1** | Students SHALL be able to write and submit code directly in the browser via an embedded code editor. |
| **FR-3.2** | The AI engine SHALL evaluate submissions on **four dimensions**: correctness, code style, edge-case handling, and optimization. |
| **FR-3.3** | Evaluation results SHALL be returned as **JSON Structured Output** (schema-enforced) and written back to MongoDB as a feedback record. |
| **FR-3.4** | Feedback SHALL be **constructive and tiered**: beginners receive guided hints and encouragement; intermediate learners receive targeted corrections with references to concepts; advanced learners receive optimization and design critiques. |
| **FR-3.5** | The system SHALL enforce per-student rate limits on submissions to prevent abuse and runaway AI cost. |
| **FR-3.6** | Students SHALL be able to resubmit code and view feedback history for each exercise. |
| **FR-3.7** | Submission outcomes SHALL update the student's Capability Matrix, closing the diagnostic → lesson → practice → feedback loop. |
| **FR-3.8** | The sandboxed evaluation environment SHALL never execute untrusted code on the main application server. |

### 3.4 Role-Based Access Control (RBAC) — Dual-Role Ecosystem

| ID | Requirement |
|---|---|
| **FR-4.1** | The system SHALL support exactly two roles: **Student** and **Admin**, encoded in the JWT claims. |
| **FR-4.2** | An RBAC middleware SHALL intercept every protected route and verify the caller's role against the route's required role. |
| **FR-4.3** | Student routes (lessons, assessments, code submissions, own mastery data) SHALL be accessible to Student and Admin. |
| **FR-4.4** | Admin-only routes (user management, curriculum settings, system analytics) SHALL reject Student tokens with HTTP 403. |
| **FR-4.5** | Students SHALL NOT be able to read or modify another student's data, even with a valid token (object-level authorization). |
| **FR-4.6** | Admins SHALL be able to create, suspend, and re-role user accounts, with all privileged actions audit-logged. |
| **FR-4.7** | Role escalation attempts (e.g., forged/modified claims) SHALL result in token rejection and security logging. |

### 3.5 General AI Mentor Chatbot

| ID | Requirement |
|---|---|
| **FR-5.1** | The system SHALL provide a general-purpose AI mentor chat available to authenticated users. |
| **FR-5.2** | The chatbot SHALL answer across all supported domains (CS fundamentals, web, databases, AI/ML, learning, careers, platform help). |
| **FR-5.3** | Each conversation SHALL be persisted per-user; users SHALL only access their own chat history. |
| **FR-5.4** | Chat replies SHALL be returned as structured, schema-validated output with an optional domain tag. |
| **FR-5.5** | Chat SHALL be rate-limited per user to control AI cost and abuse. |

### 3.6 Subscription Model & Premium Features

| ID | Requirement |
|---|---|
| **FR-6.1** | The system SHALL support two plans: **Free** and **Premium** (Adaptive+), encoded in the JWT `plan` claim. |
| **FR-6.2** | Premium features SHALL reject Free-plan callers with HTTP **402 PREMIUM_REQUIRED**. |
| **FR-6.3** | A (mock) upgrade endpoint SHALL promote a user to Premium and reissue tokens carrying the new plan. |
| **FR-6.4** | Admins SHALL be able to grant or revoke Premium, audit-logged. |
| **FR-6.5** | Free users SHALL see a locked teaser (not the full report) for gated features. |

### 3.7 Memory Twin™ (Premium)

| ID | Requirement |
|---|---|
| **FR-7.1** | The system SHALL model per-domain memory retention as an exponential forgetting curve fitted to the user's real recall events (diagnostic answers, practice, rescues). |
| **FR-7.2** | The system SHALL expose a 14-day retention forecast per domain, including days-until-danger (<50% recall). |
| **FR-7.3** | The system SHALL offer Rescue Reviews — short AI-generated micro-sessions targeting the weakest memory. |
| **FR-7.4** | Each successful rescue recall SHALL increase that domain's memory stability. |

### 3.8 Struggle DNA™ (Premium)

| ID | Requirement |
|---|---|
| **FR-8.1** | The system SHALL mine diagnostic history and code submissions into a 4-axis cognitive profile: Resilience, Depth Tolerance, Edge Awareness, Craft. |
| **FR-8.2** | The system SHALL classify the learner into a struggle archetype and provide targeted countermeasures. |
| **FR-8.3** | Free users SHALL receive only the archetype teaser; the full report requires Premium. |

---

## 4. Non-Functional Requirements

### 4.1 Security

| ID | Requirement |
|---|---|
| **NFR-1.1** | All authentication SHALL be stateless, using signed **JWTs** (HS256/RS256) with short-lived access tokens and secure refresh rotation. |
| **NFR-1.2** | JWTs SHALL carry `userId` and `role` claims; the server SHALL never trust client-supplied role data outside the verified token. |
| **NFR-1.3** | Passwords SHALL be stored using a salted one-way hash (bcrypt/argon2); never in plaintext or reversible form. |
| **NFR-1.4** | All traffic SHALL be served over HTTPS/TLS 1.2+. |
| **NFR-1.5** | Private student data (capability matrices, code submissions, feedback) SHALL be isolated per user and inaccessible cross-user. |
| **NFR-1.6** | AI prompts SHALL be constructed server-side; students SHALL NOT be able to inject arbitrary system prompts (prompt-injection mitigation). |
| **NFR-1.7** | Secrets (Gemini API key, JWT signing key, DB credentials) SHALL be held in environment variables / secret stores, never in source. |
| **NFR-1.8** | All responses SHALL carry hardened security headers (strict Content-Security-Policy in production, HSTS, X-Frame-Options DENY, nosniff, no-referrer), configured centrally. |
| **NFR-1.9** | The API SHALL enforce rate limits: a global per-IP ceiling plus stricter limits on login, registration, and chat. |
| **NFR-1.10** | JWTs SHALL be issuer-bound; tokens minted by other services SHALL be rejected at verification. |
| **NFR-1.11** | The UI SHALL be fully responsive across mobile, tablet, and desktop viewports. |

### 4.2 Performance & API Latency

| ID | Requirement |
|---|---|
| **NFR-2.1** | AI-generated responses (assessment items, lesson rewrites, code feedback) SHALL return within **< 2 seconds at P95**, using Gemini Flash-class models and streaming where applicable. |
| **NFR-2.2** | Standard CRUD API endpoints (auth, profile, content listing) SHALL respond within 300 ms at P95. |
| **NFR-2.3** | AI orchestration SHALL run in the dedicated `/services` layer with its own request queue so AI latency never blocks standard web traffic. |
| **NFR-2.4** | Long-running AI operations SHALL support timeout and graceful fallback (e.g., serve cached/canonical content on AI timeout). |

### 4.3 Scalability & Reliability

| ID | Requirement |
|---|---|
| **NFR-3.1** | The stateless Node.js/Express tier SHALL scale horizontally behind a load balancer to support at least 10,000 concurrent students. |
| **NFR-3.2** | MongoDB collections SHALL be indexed on hot paths (`userId`, `lessonId`, timestamps) to keep queries sub-100 ms under load. |
| **NFR-3.3** | AI call volume SHALL be controlled by caching (per concept × level × style), per-user rate limits, and batched evaluation where possible. |
| **NFR-3.4** | The system SHALL maintain 99.5% monthly availability; AI-provider degradation SHALL not take down core content delivery. |
| **NFR-3.5** | Structured AI outputs SHALL be schema-validated before persistence to prevent malformed data from entering MongoDB. |

---

## 5. User Stories with Acceptance Criteria (Gherkin)

### 5.1 Diagnostic Assessment

**Story D-1:** *As a Student, I want a dynamic diagnostic assessment when I join, so the platform knows exactly what I'm strong and weak at.*

```gherkin
Feature: Initial diagnostic assessment

  Scenario: Student starts a dynamic diagnostic after registration
    Given a newly registered student with no capability matrix
    When the student begins the diagnostic assessment
    Then the system generates the first code-reading question via the Gemini API
    And no static one-size-fits-all question bank is served

  Scenario: Difficulty adapts to student performance
    Given a student is mid-diagnostic with 3 consecutive correct answers
    When the student requests the next question
    Then the system generates a harder question probing a deeper competency area
    And the response is delivered within 2 seconds

  Scenario: Capability matrix is built at completion
    Given a student has completed the diagnostic reaching the confidence threshold
    When the diagnostic concludes
    Then a User Capability Matrix is generated as structured JSON
    And the matrix is persisted to MongoDB under the student's record
    And the matrix maps strengths and weaknesses across defined competency domains
```

### 5.2 Adaptive Lesson Delivery

**Story A-1:** *As a Student struggling with a concept, I want the lesson rewritten to match my level and learning style, so I can actually understand it.*

```gherkin
Feature: Dynamic explanation adaptation

  Scenario: Beginner struggling with OOP receives a real-world analogy rewrite
    Given a beginner student whose recent quiz results on "Object-Oriented Programming" fall below the mastery threshold
    And the student's preferred learning style is "analogical"
    When the system detects the struggle signal
    Then the AI rewrites the lesson using physical real-world analogies
    And the rewritten lesson preserves the same learning objectives
    And the adaptation is served from the /services AI layer without blocking other traffic

  Scenario: Intermediate learner receives memory-execution diagrams
    Given an intermediate student struggling with recursion
    When the system triggers a lesson adaptation
    Then the rewritten lesson includes memory/execution diagrams and trace walkthroughs
    And the cached adaptation is stored for reuse by matching (concept, level, style) profiles

  Scenario: AI timeout falls back gracefully
    Given the AI orchestration service exceeds the response timeout
    When a lesson adaptation is requested
    Then the system serves the canonical lesson within 2 seconds
    And the timeout event is logged for admin analytics
```

### 5.3 Code Evaluation & Feedback Loop

**Story C-1:** *As a Student, I want to write code in the browser and receive fast, tiered feedback on correctness, style, edge cases, and optimization.*

```gherkin
Feature: Code evaluation and automated feedback

  Scenario: Successful submission receives tiered structured feedback
    Given a student has written a solution in the in-browser code editor
    When the student submits the code
    Then the AI evaluates the submission for correctness, style, edge cases, and optimization
    And the result is returned as JSON structured output
    And the feedback record is written to MongoDB
    And the feedback tone and depth match the student's tier (beginner gets guided hints; advanced gets design critique)

  Scenario: Submission updates the capability matrix
    Given a student submits a data-structures exercise that fails on edge cases
    When the evaluation completes
    Then the student's Capability Matrix is updated to reflect the edge-case weakness
    And future lessons are eligible for adaptation based on the updated matrix

  Scenario: Rate limiting protects the AI budget
    Given a student has reached the per-user submission rate limit
    When the student attempts another immediate submission
    Then the system returns a clear retry-after message
    And no AI evaluation call is made
```

### 5.4 Authentication & RBAC

**Story S-1:** *As an Admin, I want admin routes protected by JWT + RBAC, so student tokens can never reach admin data.*

```gherkin
Feature: Role-based access control

  Scenario: Valid admin accesses the dashboard
    Given an authenticated admin holding a valid JWT with role claim "admin"
    When the admin requests the user-management endpoint
    Then the request succeeds with HTTP 200
    And the action is recorded in the audit log

  Scenario: Student is blocked from admin routes
    Given an authenticated student holding a valid JWT with role claim "student"
    When the student requests an admin-only endpoint
    Then the RBAC middleware rejects the request with HTTP 403
    And the attempt is logged as a security event

  Scenario: Cross-user data access is denied
    Given student A is authenticated with a valid token
    When student A requests student B's capability matrix
    Then the system denies access with HTTP 403 or 404
    And no student B data is returned

  Scenario: Token tampering is rejected
    Given a request carries a JWT with a modified role claim and an invalid signature
    When the request reaches any protected route
    Then the token verification fails
    And the request is rejected with HTTP 401
```

### 5.5 AI Mentor Chatbot

**Story CB-1:** *As a Student, I want to ask my AI mentor anything across all domains and keep a private conversation history.*

```gherkin
Feature: General AI mentor chatbot

  Scenario: Student gets a domain-tagged answer
    Given an authenticated student
    When the student posts "What is recursion?" to the chat endpoint
    Then the system returns HTTP 201 with a structured reply
    And the reply mentions the base case
    And the reply is tagged with a domain

  Scenario: Chat history is private per user
    Given student A has sent chat messages
    When student B requests their own chat history
    Then student B receives an empty history
    And student A's messages are never exposed

  Scenario: Chat is rate limited
    Given a student has exceeded the chat rate limit window
    When the student sends another message
    Then the system responds with HTTP 429
    And no AI call is made
```

### 5.6 Subscription & Premium (Memory Twin™)

**Story PM-1:** *As a Student, I can preview premium innovation features free, then subscribe to unlock the Memory Twin and full Struggle DNA.*

```gherkin
Feature: Premium subscription gating

  Scenario: Free user is blocked from the Memory Twin
    Given an authenticated student on the free plan
    When the student requests the Memory Twin forecast
    Then the system responds with HTTP 402 PREMIUM_REQUIRED

  Scenario: Free user receives a locked Struggle DNA teaser
    Given an authenticated student on the free plan
    When the student requests their Struggle DNA
    Then the response is flagged locked=true
    And only the archetype teaser is returned

  Scenario: Student upgrades to premium
    Given an authenticated student on the free plan
    When the student calls the upgrade endpoint with plan=premium
    Then the account is promoted to premium
    And new tokens are issued carrying the premium plan
    And a repeat upgrade returns HTTP 409

  Scenario: Rescue review reinforces memory stability
    Given a premium student with an active diagnostic matrix
    When the student starts and completes a Rescue Review
    Then the target domain's memory stability increases
    And the completion reports the updated retention
```

---

## 6. Technical Foundation (Summary)

| Layer | Decision |
|---|---|
| **Stack** | MERN — MongoDB, Express.js, React.js, Node.js |
| **Architecture** | Strict MVC with a dedicated `/services` layer; AI orchestration decoupled from standard web traffic |
| **AI Engine** | Official `@google/genai` SDK; Gemini 2.5 / 3.7 Flash models |
| **AI Integration** | JSON Structured Outputs so grading & feedback persist directly into MongoDB |
| **Security** | Issuer-bound JWT + RBAC + plan gating; helmet CSP, rate limiting & CORS centralized in `config/security.ts` |

---

*End of Document — 01_PRD.md*
