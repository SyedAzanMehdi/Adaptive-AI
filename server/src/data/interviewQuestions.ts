// Interview Rehearsal Studio™ — curated question bank.
//
// Used by the deterministic mock path and as the grounding material for the
// Gemini prompt, so a student with no API key still gets a real rehearsal
// rather than generic filler. Questions are keyed by the same `area` values as
// `skillTaxonomy.ts`, with exact-skill overrides on top.

export interface BankQuestion {
  prompt: string;
  skill: string;
  probes: string[];
  goodAnswerSignals: string[];
}

// Exact-skill overrides — checked before the area fallbacks.
export const SKILL_QUESTIONS: Record<string, BankQuestion> = {
  "Data Structures": {
    prompt:
      "You need to look up whether a user ID has been seen before, across tens of millions of IDs, and inserts far outnumber lookups. Which data structure do you reach for and why?",
    skill: "Data Structures",
    probes: [
      "What is the worst-case lookup time for your choice, and what causes that worst case?",
      "How would your answer change if the IDs had to stay in sorted order?",
      "What happens to memory usage as the set grows past available RAM?",
    ],
    goodAnswerSignals: [
      "Names a hash-based structure and justifies it with average O(1) lookup",
      "Distinguishes average case from worst case rather than quoting only O(1)",
      "Acknowledges a real constraint: memory, ordering, or collision handling",
    ],
  },
  Algorithms: {
    prompt:
      "Walk me through how you would find the K most-frequent items in a stream of a billion events. Talk me through your complexity reasoning out loud.",
    skill: "Algorithms",
    probes: [
      "Why a heap instead of a full sort? What does each buy you?",
      "What if K is close to N rather than small?",
      "How would you parallelise this across machines?",
    ],
    goodAnswerSignals: [
      "States a concrete approach before optimising it",
      "Gives time AND space complexity with the reasoning, not just the number",
      "Considers a variation that breaks the first approach",
    ],
  },
  "Object-Oriented Design": {
    prompt:
      "Design the class structure for a notification system that can send email, SMS, and push, where new channels get added without touching existing code.",
    skill: "Object-Oriented Design",
    probes: [
      "Which SOLID principle does your design lean on, and where does it show?",
      "What would you make an interface versus an abstract class, and why?",
      "How does a caller retry a failed send without knowing the channel type?",
    ],
    goodAnswerSignals: [
      "Introduces an abstraction the sender codes against",
      "Names open/closed explicitly and points at the code that satisfies it",
      "Discusses composition over inheritance with a concrete example",
    ],
  },
  "System Design": {
    prompt:
      "Design a URL shortener that must handle 10,000 redirects per second with p99 latency under 50ms. Start with the questions you would ask me.",
    skill: "System Design",
    probes: [
      "How do you generate short codes so they never collide?",
      "Where does caching sit, and what is your hit-rate assumption?",
      "What breaks first at 10x this traffic?",
    ],
    goodAnswerSignals: [
      "Asks clarifying questions before drawing any boxes",
      "Does back-of-envelope numbers with units shown",
      "Identifies the bottleneck and a concrete mitigation for it",
    ],
  },
  "Debugging & Profiling": {
    prompt:
      "A production endpoint that was fine for a year starts timing out intermittently. Nothing was deployed. Describe your first thirty minutes.",
    skill: "Debugging & Profiling",
    probes: [
      "How do you separate a slow dependency from slow application code?",
      "What metric would you look at first, and what pattern in it is informative?",
      "You cannot reproduce it locally. Now what?",
    ],
    goodAnswerSignals: [
      "Forms and ranks hypotheses instead of changing code at random",
      "Reaches for evidence: traces, logs, metrics, profiling",
      "Explicitly narrows scope before touching anything",
    ],
  },
  "JavaScript / TypeScript": {
    prompt:
      "Explain the event loop to me as if I were a backend engineer from a threaded-language background. Where does a microtask run relative to a setTimeout callback?",
    skill: "JavaScript / TypeScript",
    probes: [
      "What actually blocks the main thread, and what does not?",
      "How does a Promise chain differ from nested callbacks here?",
      "What does TypeScript give you that the runtime does not?",
    ],
    goodAnswerSignals: [
      "Places microtasks before macrotasks and explains why",
      "Ties concurrency to a single thread rather than implying parallelism",
      "Is honest about what the type system erases at runtime",
    ],
  },
  "SQL & Relational Databases": {
    prompt:
      "This query took 40ms last month and 4 seconds today. The code has not changed. What do you check, in order?",
    skill: "SQL & Relational Databases",
    probes: [
      "How do you read an execution plan, and what shape worries you?",
      "When would you add an index versus change the query?",
      "What is the cost of the index you just proposed?",
    ],
    goodAnswerSignals: [
      "Susppects data volume or plan change, not the SQL text",
      "Reads the plan and names the operator causing the regression",
      "States that indexes slow writes and cost storage",
    ],
  },
  "React & Frontend Frameworks": {
    prompt:
      "A component re-renders hundreds of times on a keystroke. How do you find the cause, and what are the legitimate fixes versus cargo cult?",
    skill: "React & Frontend Frameworks",
    probes: [
      "When does memoisation actually help, and when does it just add work?",
      "What does an unstable object identity in props do here?",
      "How would you prove the fix worked?",
    ],
    goodAnswerSignals: [
      "Profiles before optimising and names the tool used",
      "Explains referential equality as the root cause",
      "Distinguishes a real fix from memoising everything defensively",
    ],
  },
  "REST & API Design": {
    prompt:
      "You are versioning a public API and need to change the shape of a response that thousands of clients depend on. How do you do it without breaking them?",
    skill: "REST & API Design",
    probes: [
      "Which HTTP status codes belong on each failure path here?",
      "How do you deprecate without a hard cut-off?",
      "What does idempotency mean for the retry behaviour of your clients?",
    ],
    goodAnswerSignals: [
      "Chooses an explicit versioning strategy and states its trade-off",
      "Uses status codes precisely rather than 200-with-an-error-body",
      "Thinks about the client's retry behaviour, not only the server",
    ],
  },
  "Testing & Quality": {
    prompt:
      "Your team has 90% line coverage and still ships regressions weekly. What is going wrong, and what would you change?",
    skill: "Testing & Quality",
    probes: [
      "What does coverage measure, and what does it not?",
      "Where would you put the next test you write?",
      "How much mocking is too much?",
    ],
    goodAnswerSignals: [
      "Rejects coverage as a quality proxy and says what to use instead",
      "Reasons about the test pyramid in terms of signal and cost",
      "Ties tests to real failure modes rather than to lines of code",
    ],
  },
  "Application Security": {
    prompt:
      "You inherit an endpoint that takes a user-supplied ID and returns a record. Walk me through the attack surface.",
    skill: "Application Security",
    probes: [
      "How do you stop one user reading another user's record?",
      "Where does input validation belong, and what does it not protect against?",
      "What would you log here, and what must never appear in a log?",
    ],
    goodAnswerSignals: [
      "Names IDOR/broken object-level authorisation unprompted",
      "Separates authentication from authorisation",
      "Avoids logging secrets or full request bodies by default",
    ],
  },
  "Cloud Platforms": {
    prompt:
      "You are deploying this service for the first time. What is your minimum production setup, and what is the first thing you would add when traffic grows?",
    skill: "Cloud Platforms",
    probes: [
      "How do you handle a secret without baking it into the image?",
      "What does a health check need to verify to be meaningful?",
      "How would you roll back a bad deploy in under a minute?",
    ],
    goodAnswerSignals: [
      "Separates compute, storage, and secrets cleanly",
      "Mentions observability as part of the minimum, not an add-on",
      "Has a concrete rollback path rather than 'redeploy'",
    ],
  },
  "Machine Learning": {
    prompt:
      "Your model gets 96% accuracy and the product team says it is useless. Give me two realistic reasons why.",
    skill: "Machine Learning",
    probes: [
      "Which metric would you report instead, and for what class distribution?",
      "How do you detect that production data has drifted from training data?",
      "What is leakage, and how would you check for it here?",
    ],
    goodAnswerSignals: [
      "Immediately suspects class imbalance",
      "Picks precision/recall/F1 with a reason tied to the cost of each error",
      "Raises data leakage or distribution shift without being led there",
    ],
  },
  "Communication & Mentorship": {
    prompt:
      "Explain a technical decision you made that a non-technical stakeholder disagreed with. How did you handle it, and what changed?",
    skill: "Communication & Mentorship",
    probes: [
      "What did you translate the trade-off into for them?",
      "Were you wrong about any part of it in hindsight?",
      "How did you know the conversation had actually landed?",
    ],
    goodAnswerSignals: [
      "Frames the trade-off in business terms, not just technical ones",
      "Shows a real concession or changed mind, not a victory story",
      "Describes a concrete outcome rather than 'we agreed'",
    ],
  },
};

// Area fallbacks — one solid question per taxonomy area.
export const AREA_QUESTIONS: Record<string, BankQuestion> = {
  cs_fundamentals: {
    prompt:
      "Pick a concept from your strongest area of computer science and teach it to me in two minutes, assuming I have never seen it before.",
    skill: "CS Fundamentals",
    probes: [
      "Give me a concrete example where getting this wrong causes a real bug.",
      "What is the common misconception people have about this?",
      "How would you check that I actually understood you?",
    ],
    goodAnswerSignals: [
      "Builds from a simple case up rather than starting with the definition",
      "Uses a concrete example instead of abstractions only",
      "Checks understanding instead of just finishing",
    ],
  },
  architecture: {
    prompt:
      "Describe the largest system you have personally worked on. Where was the seam between components, and what would you move if you rebuilt it?",
    skill: "Architecture",
    probes: [
      "What failure mode did that seam introduce?",
      "Which decision was reversible, and which was not?",
      "What constraint drove the design more than any other?",
    ],
    goodAnswerSignals: [
      "Talks about trade-offs and constraints, not a diagram",
      "Distinguishes reversible from one-way-door decisions",
      "Owns a decision they would now change",
    ],
  },
  web: {
    prompt:
      "A page loads in 6 seconds on mobile. Describe how you diagnose it and what you fix first.",
    skill: "Web Performance",
    probes: [
      "Which metric would you optimise, and why that one?",
      "What is the difference between what the network tab and the profiler tell you?",
      "How do you stop this regressing next quarter?",
    ],
    goodAnswerSignals: [
      "Measures before changing anything",
      "Names a real metric: LCP, TBT, or payload size",
      "Proposes a guardrail, not only a one-off fix",
    ],
  },
  data: {
    prompt:
      "You have to store ten years of time-series readings and answer both 'last hour' and 'year over year' queries. How do you model it?",
    skill: "Data Modeling",
    probes: [
      "What does your access pattern tell you about the schema?",
      "Where does aggregation happen: storage, application, or a cache?",
      "What do you do about the oldest data nobody queries?",
    ],
    goodAnswerSignals: [
      "Starts from access patterns, not from a favourite database",
      "Justifies a partitioning or roll-up strategy",
      "Considers retention and lifecycle, not only the happy path",
    ],
  },
  ai_ml: {
    prompt:
      "When would you choose a plain heuristic over a learned model? Give me a real example from your own work.",
    skill: "AI / ML Judgement",
    probes: [
      "What does the model cost you that the heuristic does not?",
      "How would you decide when the heuristic has stopped being good enough?",
      "How do you evaluate a model when there is no clean ground truth?",
    ],
    goodAnswerSignals: [
      "Weighs explainability, cost, and data availability honestly",
      "Defines a measurable trigger for switching approaches",
      "Does not treat ML as the default answer",
    ],
  },
  cloud_devops: {
    prompt:
      "Your deploy takes 25 minutes and fails one time in five. What do you fix first, and how do you know it worked?",
    skill: "CI/CD & Cloud",
    probes: [
      "How do you separate flaky tests from a flaky pipeline?",
      "What belongs in the build versus in a later stage?",
      "What is your rollback story?",
    ],
    goodAnswerSignals: [
      "Measures the failure distribution before changing the pipeline",
      "Identifies the dominant cost, not the most annoying one",
      "Treats rollback as part of the deploy, not an afterthought",
    ],
  },
  cybersecurity: {
    prompt:
      "What does 'never trust user input' actually mean in code you have written? Show me with a specific example.",
    skill: "Security",
    probes: [
      "Where do you validate: edge, service, or persistence layer?",
      "Which OWASP risk do you think teams most often get wrong?",
      "How would you find out whether you have this bug today?",
    ],
    goodAnswerSignals: [
      "Gives a code-level example rather than a slogan",
      "Knows where validation belongs and why",
      "Suggests a way to test for it, not just avoid it",
    ],
  },
  systems: {
    prompt:
      "A program is using 4 GB of RAM to process a 2 GB file. Walk me through how you find out where it all goes.",
    skill: "Systems Programming",
    probes: [
      "What tool do you reach for, and what does it show you?",
      "How do you tell a leak from a legitimately large working set?",
      "What changes in your design if the file is 200 GB?",
    ],
    goodAnswerSignals: [
      "Profiles the allocation sites rather than guessing",
      "Distinguishes a leak from a growth pattern",
      "Moves to streaming when the input stops fitting in memory",
    ],
  },
  general: {
    prompt:
      "Tell me about a bug you spent more than a day on. What made it hard, and what finally cracked it?",
    skill: "Problem Solving",
    probes: [
      "What was your wrong hypothesis, and how long did you hold it?",
      "What would have found it in an hour?",
      "What did you change afterwards so the next one is faster?",
    ],
    goodAnswerSignals: [
      "Recounts the reasoning, not just the fix",
      "Admits a false lead explicitly",
      "Extracts a reusable lesson or tooling change",
    ],
  },
  engineering_practice: {
    prompt:
      "You disagree with a senior engineer's approach in code review, and you think you are right. What do you do?",
    skill: "Engineering Practice",
    probes: [
      "How do you make the disagreement cheap to resolve?",
      "When do you just defer, and when do you push?",
      "What evidence would change your mind?",
    ],
    goodAnswerSignals: [
      "Separates taste from correctness before arguing",
      "Proposes an experiment or a benchmark over debate",
      "States plainly when deferring is the right call",
    ],
  },
  soft_skills: {
    prompt:
      "Describe a time you had to deliver something you knew would be late. How did you raise it, and to whom?",
    skill: "Communication",
    probes: [
      "How early did you say something, and what stopped you saying it sooner?",
      "What did you offer instead of just the bad news?",
      "How did the relationship land afterwards?",
    ],
    goodAnswerSignals: [
      "Raised it early rather than at the deadline",
      "Came with options, not only the problem",
      "Describes a real consequence and a real resolution",
    ],
  },
};

export const DEFAULT_QUESTION: BankQuestion = {
  prompt:
    "Tell me about the most technically difficult thing you have built. What made it hard, and what would you do differently now?",
  skill: "Problem Solving",
  probes: [
    "What was the specific constraint that made it hard?",
    "Which decision would you revisit, and why?",
    "How did you know it was actually finished?",
  ],
  goodAnswerSignals: [
    "Goes deep on one thing rather than listing many",
    "Names a constraint that shaped the design",
    "Reflects honestly on a decision they would change",
  ],
};

// Behavioural round — always drawn from here, biased toward the student's
// weak soft skills. STAR-structured so the rehearsal teaches the format.
export const BEHAVIORAL_QUESTIONS: BankQuestion[] = [
  {
    prompt:
      "Tell me about a time you had a conflict with a teammate over a technical decision. How did it get resolved?",
    skill: "Conflict Resolution",
    probes: [
      "What was their argument, stated fairly?",
      "What did you concede?",
      "Would you handle it the same way now?",
    ],
    goodAnswerSignals: [
      "Describes the other person's position accurately and fairly",
      "Shows a resolution mechanism, not just an outcome",
      "Avoids casting themselves as the only reasonable party",
    ],
  },
  {
    prompt:
      "Describe a project that failed or was cancelled. What was your part in it?",
    skill: "Ownership",
    probes: [
      "What did you see coming that you did not act on?",
      "What did you take away that you have used since?",
      "Who else was affected, and how did you handle that?",
    ],
    goodAnswerSignals: [
      "Takes a specific share of responsibility",
      "Extracts a lesson that visibly changed later behaviour",
      "Does not blame circumstances exclusively",
    ],
  },
  {
    prompt:
      "Tell me about a time you had to learn something quickly under pressure. How did you get up to speed?",
    skill: "Learning Agility",
    probes: [
      "What did you deliberately choose not to learn?",
      "How did you know you understood it well enough?",
      "Who did you ask, and what did you ask them?",
    ],
    goodAnswerSignals: [
      "Shows a method, not just effort",
      "Admits the limits of what they learned",
      "Used people as a resource, not only documentation",
    ],
  },
  {
    prompt:
      "Give me an example of feedback that was hard to hear. What did you do with it?",
    skill: "Receptiveness",
    probes: [
      "Was the feedback correct?",
      "How long did it take you to accept it?",
      "What is different about your work now because of it?",
    ],
    goodAnswerSignals: [
      "Quotes the feedback specifically rather than paraphrasing vaguely",
      "Separates the sting from the substance",
      "Points at a durable change in behaviour",
    ],
  },
  {
    prompt:
      "Describe a time you had to explain a technical problem to someone without a technical background.",
    skill: "Communication",
    probes: [
      "What analogy or framing worked?",
      "What decision did they need to make from your explanation?",
      "How did you check they had actually followed?",
    ],
    goodAnswerSignals: [
      "Optimises for the listener's decision, not for completeness",
      "Uses a concrete framing rather than removing jargon only",
      "Verifies understanding explicitly",
    ],
  },
  {
    prompt:
      "Tell me about a time you took initiative on something nobody asked you to do.",
    skill: "Initiative",
    probes: [
      "How did you decide it was worth your time?",
      "Did you ask permission first, and should you have?",
      "Did anyone adopt what you built?",
    ],
    goodAnswerSignals: [
      "Ties the initiative to a real cost somebody was paying",
      "Is honest about the trade-off against assigned work",
      "Reports an outcome, including if it went unused",
    ],
  },
];

// Screening round — short, role-aware, always asked first.
export const SCREENING_QUESTIONS: BankQuestion[] = [
  {
    prompt:
      "Walk me through your background in two minutes, focused on the work most relevant to this role.",
    skill: "Self-Presentation",
    probes: [
      "Which of those experiences best predicts how you would do here?",
      "Why are you looking to move now?",
      "What is the one thing your CV does not show?",
    ],
    goodAnswerSignals: [
      "Stays inside two minutes and lands a clear ending",
      "Selects for relevance to this role rather than reciting chronology",
      "Gives a forward-looking reason for moving",
    ],
  },
  {
    prompt:
      "What specifically about this role made you apply, rather than a similar one elsewhere?",
    skill: "Role Fit",
    probes: [
      "What do you already know about how this team works?",
      "Which part of the job are you least sure you would enjoy?",
      "Where do you want this role to put you in two years?",
    ],
    goodAnswerSignals: [
      "References something specific about the company or stack",
      "Is honest about a part of the role that is a stretch",
      "Shows a direction rather than only enthusiasm",
    ],
  },
  {
    prompt:
      "Pick the project you are proudest of and tell me what you personally built in it.",
    skill: "Depth of Experience",
    probes: [
      "What was the hardest technical decision in it?",
      "What would you rebuild if you had another month?",
      "How many people were on it, and what was your slice?",
    ],
    goodAnswerSignals: [
      "Is precise about their own contribution versus the team's",
      "Can go arbitrarily deep on one decision",
      "Shows judgement about what they would change",
    ],
  },
];

// System-design round — always drawn from here when the student has no
// architecture-area signal, since design questions are role-generic.
export const DESIGN_QUESTIONS: BankQuestion[] = [
  {
    prompt:
      "Design a real-time collaborative document editor for up to 50 concurrent editors. Start with the questions you would ask me.",
    skill: "System Design",
    probes: [
      "How do you resolve two people editing the same character?",
      "What happens to a client that goes offline for an hour?",
      "Where is the ordering authority, and what if it dies?",
    ],
    goodAnswerSignals: [
      "Clarifies consistency requirements before designing",
      "Names a real strategy for conflict resolution",
      "Handles the offline and failure cases explicitly",
    ],
  },
  {
    prompt:
      "Design a rate limiter for a public API serving 50,000 requests per second across many clients.",
    skill: "System Design",
    probes: [
      "Which algorithm, and what does it cost you in memory?",
      "Where does the counter live so it stays correct across nodes?",
      "What does the client see when it is limited, and how does it back off?",
    ],
    goodAnswerSignals: [
      "Picks an algorithm and states its trade-off against the alternatives",
      "Addresses the distributed-counter problem directly",
      "Designs the client-facing response, not only the server logic",
    ],
  },
  {
    prompt:
      "Design a job queue that guarantees a task runs at least once, even when workers crash mid-task.",
    skill: "System Design",
    probes: [
      "How does a task become visible again after a worker dies?",
      "What stops a poison task from retrying forever?",
      "What does 'at least once' require of the consumer?",
    ],
    goodAnswerSignals: [
      "Introduces a visibility timeout or lease mechanism",
      "Handles the dead-letter case",
      "States that idempotency is the consumer's responsibility",
    ],
  },
];
