import type { Domain } from "./schemas.js";

export interface CareerFieldForecastPoint {
  year: number;
  // Illustrative relative-demand index (0-100), NOT sourced labor-market
  // statistics — a clearly-labeled estimate for directional "this is
  // trending up/down" guidance, not a guarantee.
  demandIndex: number;
}

export interface CareerField {
  id: string;
  name: string;
  // Which of the 5 diagnostic capability domains this field draws on most.
  mapsTo: Domain;
  description: string;
  // Generic step-by-step guidance for pursuing this field; the field
  // recommendation service layers the student's own weak/strong domains on
  // top of this template (or lets Gemini personalize it further).
  pursuitSteps: string[];
  forecast: CareerFieldForecastPoint[];
}

const YEARS = [2025, 2028, 2031, 2034, 2037, 2040] as const;

function forecast(points: number[]): CareerFieldForecastPoint[] {
  return YEARS.map((year, i) => ({ year, demandIndex: points[i] }));
}

export const CAREER_FIELDS: CareerField[] = [
  {
    id: "ai-ml-engineering",
    name: "AI / Machine Learning Engineering",
    mapsTo: "algorithms",
    description: "Designing, training, and deploying models — from classical ML to applied LLM systems.",
    pursuitSteps: [
      "Master algorithmic fundamentals (complexity, search, dynamic programming) before touching frameworks",
      "Build 2-3 small end-to-end ML projects (data -> model -> served prediction), not just notebooks",
      "Learn one deep-learning framework deeply (PyTorch is the current industry default) rather than many shallowly",
      "Contribute to or read real open-source ML codebases to see production patterns",
      "Practice explaining model tradeoffs out loud — most ML interviews score communication, not just math",
    ],
    forecast: forecast([58, 70, 80, 87, 91, 94]),
  },
  {
    id: "data-science-analytics",
    name: "Data Science & Analytics",
    mapsTo: "data_structures",
    description: "Turning raw, messy data into decisions — statistics, pipelines, and dashboards that get used.",
    pursuitSteps: [
      "Get fluent in SQL first — it underlies almost every data role regardless of language",
      "Learn to structure and query data efficiently; this is where data-structures intuition pays off directly",
      "Build one real dataset-to-insight project you can explain end-to-end in an interview",
      "Learn basic statistics well enough to know when a result is actually significant",
      "Practice presenting findings to a non-technical audience — this is the actual day-to-day skill",
    ],
    forecast: forecast([62, 68, 73, 77, 80, 82]),
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity & Security Engineering",
    mapsTo: "debugging",
    description: "Finding what breaks before attackers do — from secure coding to incident response.",
    pursuitSteps: [
      "Sharpen debugging and root-cause instincts first — security work is applied adversarial debugging",
      "Learn one offensive-security fundamentals path (e.g. web app vulnerabilities: OWASP Top 10)",
      "Practice on legal, sandboxed targets only (CTFs, deliberately vulnerable apps) — never real systems without authorization",
      "Study a handful of real post-mortems/CVEs to see how small mistakes become breaches",
      "Get comfortable reading logs and tracing an incident timeline, not just finding bugs",
    ],
    forecast: forecast([64, 72, 79, 85, 89, 92]),
  },
  {
    id: "cloud-devops",
    name: "Cloud & DevOps Engineering",
    mapsTo: "oop",
    description: "Building the systems and pipelines that let software ship and scale reliably.",
    pursuitSteps: [
      "Get solid on OOP/system structure fundamentals — infra code is still software design",
      "Learn one cloud provider deeply (breadth across all three comes later) plus containers",
      "Build a real CI/CD pipeline for a side project, including a rollback plan",
      "Learn to read and reason about system diagrams, not just write YAML",
      "Practice incident-response thinking: what fails, how you'd detect it, how you'd recover",
    ],
    forecast: forecast([60, 67, 73, 78, 82, 85]),
  },
  {
    id: "fullstack-web",
    name: "Full-Stack Web Development",
    mapsTo: "syntax",
    description: "End-to-end product engineering across frontend, backend, and the glue between them.",
    pursuitSteps: [
      "Get fluent in core language syntax/idioms first — this is the foundation everything else sits on",
      "Build and ship one complete project (auth, data, deploy) rather than many unfinished tutorials",
      "Learn one frontend framework and one backend stack deeply before spreading thin",
      "Read other people's production code to learn conventions beyond tutorials",
      "Practice explaining a design decision's tradeoffs in an interview, not just that it works",
    ],
    forecast: forecast([55, 58, 60, 61, 62, 62]),
  },
  {
    id: "mobile-development",
    name: "Mobile App Development",
    mapsTo: "oop",
    description: "Native and cross-platform apps — performance, platform conventions, and offline-first design.",
    pursuitSteps: [
      "Solidify OOP fundamentals — mobile frameworks lean heavily on class/component composition",
      "Build one real app and actually publish it (even to a test track) to learn the full lifecycle",
      "Learn the platform's state-management and lifecycle model deeply, not just syntax",
      "Study battery/performance tradeoffs — this is what separates junior from senior mobile work",
      "Practice a portfolio walkthrough: why this architecture, what you'd change at scale",
    ],
    forecast: forecast([52, 56, 59, 61, 62, 63]),
  },
  {
    id: "backend-distributed-systems",
    name: "Backend & Distributed Systems",
    mapsTo: "data_structures",
    description: "APIs, databases, and the systems that stay correct and fast under real load.",
    pursuitSteps: [
      "Master core data structures — this field is mostly applied data-structure/complexity reasoning",
      "Build one service that handles a real concurrency or scale concern, not just a CRUD API",
      "Learn one database deeply (indexing, query plans) rather than many shallowly",
      "Study a few real distributed-systems failure stories (cascading failures, thundering herds)",
      "Practice systems-design interviews out loud — this is the field's main interview format",
    ],
    forecast: forecast([61, 66, 71, 75, 78, 80]),
  },
  {
    id: "game-development",
    name: "Game Development",
    mapsTo: "algorithms",
    description: "Real-time systems, physics, and the algorithmic tricks that make interactive worlds feel alive.",
    pursuitSteps: [
      "Get comfortable with algorithmic thinking under performance constraints (real-time budgets)",
      "Build one small complete game, start to finish, rather than many prototypes",
      "Learn one engine deeply (Unity or Unreal) plus the math behind it (vectors, collision)",
      "Study how a shipped game's performance budget is spent (profiling, not guessing)",
      "Build a portfolio reel — this field hires on demonstrated shipped work more than resumes",
    ],
    forecast: forecast([48, 50, 52, 54, 55, 56]),
  },
  {
    id: "embedded-iot",
    name: "Embedded Systems & IoT",
    mapsTo: "syntax",
    description: "Software that runs directly on hardware — constrained memory, real-time deadlines, physical devices.",
    pursuitSteps: [
      "Get rigorous with low-level language syntax and memory semantics (C/C++/Rust)",
      "Build one project on real (or simulated) hardware, not just a desktop simulation",
      "Learn to read a datasheet and a schematic well enough to debug at the hardware boundary",
      "Practice debugging without a debugger (print/LED-level) — a core embedded skill",
      "Study a few real embedded failure cases (timing bugs, memory corruption) to build intuition",
    ],
    forecast: forecast([50, 55, 60, 64, 67, 69]),
  },
  {
    id: "blockchain-web3",
    name: "Blockchain / Web3 Engineering",
    mapsTo: "algorithms",
    description: "Smart contracts and decentralized systems — correctness matters more than almost anywhere else.",
    pursuitSteps: [
      "Master algorithmic correctness and edge-case thinking — bugs here can be irreversible and costly",
      "Learn one smart-contract language deeply plus its common vulnerability classes",
      "Build and thoroughly test one contract, including adversarial test cases",
      "Study a few real exploit post-mortems to internalize what actually goes wrong",
      "Treat security auditing mindset as core to the role, not an afterthought",
    ],
    forecast: forecast([45, 50, 54, 57, 59, 60]),
  },
  {
    id: "qa-test-automation",
    name: "QA & Test Automation",
    mapsTo: "debugging",
    description: "Systematic breaking of software before users do — automation, not just manual clicking.",
    pursuitSteps: [
      "Sharpen debugging and edge-case-finding instincts — this is the core transferable skill",
      "Learn one test-automation framework deeply and apply it to a real project's test suite",
      "Practice writing tests that would have caught a real bug you once shipped",
      "Learn to read a bug report critically — reproduce before trusting",
      "Build a small CI pipeline that fails loudly and clearly when a test breaks",
    ],
    forecast: forecast([49, 51, 53, 55, 56, 57]),
  },
  {
    id: "database-engineering",
    name: "Database Engineering",
    mapsTo: "data_structures",
    description: "Schema design, indexing, and query performance at the system's data layer.",
    pursuitSteps: [
      "Deepen data-structure intuition — indexes and query plans are applied data structures",
      "Learn to read an actual query execution plan and explain why it's slow",
      "Design and migrate a real schema under a changing requirement, not just a static diagram",
      "Study a couple of real scaling stories (sharding, read replicas) for intuition on tradeoffs",
      "Practice explaining a normalization vs. denormalization decision with real tradeoffs",
    ],
    forecast: forecast([54, 58, 61, 64, 66, 67]),
  },
  {
    id: "robotics-automation",
    name: "Robotics & Automation",
    mapsTo: "algorithms",
    description: "Control systems, path planning, and software that drives physical motion safely.",
    pursuitSteps: [
      "Build strong algorithmic fundamentals, especially search and optimization",
      "Work with a real (or simulated) robot platform, not only pure algorithm problems",
      "Learn the basics of control theory well enough to reason about stability",
      "Study a few real robotics failure cases (sensor drift, edge-case terrain) for intuition",
      "Practice explaining a safety tradeoff — this field cares about failure modes a lot",
    ],
    forecast: forecast([47, 52, 57, 61, 64, 66]),
  },
  {
    id: "technical-product-management",
    name: "Technical Product Management",
    mapsTo: "oop",
    description: "Bridging engineering and business — scoping, sequencing, and shipping the right thing.",
    pursuitSteps: [
      "Keep enough hands-on coding fluency to earn engineers' trust in scoping conversations",
      "Practice writing a crisp spec for a real feature, including what's explicitly out of scope",
      "Learn to read a system architecture diagram well enough to spot a scoping risk",
      "Shadow or run one real prioritization decision and write down the tradeoffs you made",
      "Practice a stakeholder conversation where you have to say no with a clear reason",
    ],
    forecast: forecast([51, 54, 56, 58, 59, 60]),
  },
];

export function careerFieldsForDomain(domain: Domain): CareerField[] {
  return CAREER_FIELDS.filter((f) => f.mapsTo === domain);
}

export function careerFieldGrowth(field: CareerField): number {
  const first = field.forecast[0]?.demandIndex ?? 0;
  const last = field.forecast[field.forecast.length - 1]?.demandIndex ?? 0;
  return last - first;
}
