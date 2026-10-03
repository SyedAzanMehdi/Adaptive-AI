// Customized Learning Path — curated resource catalogue.
//
// Deliberately hand-curated rather than AI-generated: a model that invents
// study material also invents URLs, and a dead link in a student's 90-day plan
// costs trust. Every external entry below is a long-lived, free, authoritative
// resource; every platform entry is an internal route this SPA already serves.

export interface LearningResource {
  title: string;
  kind: "platform" | "external";
  url: string;
  note: string;
  hours: number;
}

const PLATFORM_CORE: LearningResource[] = [
  {
    title: "Adaptive lesson path",
    kind: "platform",
    url: "/lessons",
    note: "Lessons rewritten to your current tier and learning style.",
    hours: 4,
  },
  {
    title: "Practice arena",
    kind: "platform",
    url: "/practice",
    note: "Mentored code exercises with structured AI feedback.",
    hours: 3,
  },
  {
    title: "Re-run the diagnostic",
    kind: "platform",
    url: "/diagnostic",
    note: "Re-baseline your Capability Matrix so the gap report updates.",
    hours: 1,
  },
];

const AREA_RESOURCES: Record<string, LearningResource[]> = {
  cs_fundamentals: [
    {
      title: "NeetCode roadmap",
      kind: "external",
      url: "https://neetcode.io/roadmap",
      note: "Ordered problem sets for data structures and algorithms.",
      hours: 8,
    },
    {
      title: "CS50x — Introduction to Computer Science",
      kind: "external",
      url: "https://cs50.harvard.edu/x/",
      note: "Rigorous free foundations course with graded problem sets.",
      hours: 12,
    },
    {
      title: "Computer Science roadmap",
      kind: "external",
      url: "https://roadmap.sh/computer-science",
      note: "Visual map of what to learn, and in what order.",
      hours: 2,
    },
  ],
  architecture: [
    {
      title: "System Design Primer",
      kind: "external",
      url: "https://github.com/donnemartin/system-design-primer",
      note: "The standard open reference for large-scale system design.",
      hours: 10,
    },
    {
      title: "System Design roadmap",
      kind: "external",
      url: "https://roadmap.sh/system-design",
      note: "Sequenced topics from DNS to sharding and consensus.",
      hours: 4,
    },
    {
      title: "Design Dojo",
      kind: "platform",
      url: "/dojo",
      note: "Six structured challenges with a four-axis critique of your notes.",
      hours: 5,
    },
  ],
  web: [
    {
      title: "MDN Web Docs — Learn",
      kind: "external",
      url: "https://developer.mozilla.org/en-US/docs/Learn",
      note: "Authoritative reference for HTML, CSS and JavaScript.",
      hours: 8,
    },
    {
      title: "Frontend Developer roadmap",
      kind: "external",
      url: "https://roadmap.sh/frontend",
      note: "The full frontend skill tree, topic by topic.",
      hours: 3,
    },
    {
      title: "The Odin Project",
      kind: "external",
      url: "https://www.theodinproject.com",
      note: "Free full-stack curriculum built around real projects.",
      hours: 12,
    },
    {
      title: "web.dev — accessibility and performance",
      kind: "external",
      url: "https://web.dev/learn/accessibility",
      note: "Practical a11y and Core Web Vitals guidance.",
      hours: 4,
    },
  ],
  general: [
    {
      title: "Exercism",
      kind: "external",
      url: "https://exercism.org",
      note: "Language drills with human mentoring, free.",
      hours: 6,
    },
    {
      title: "freeCodeCamp",
      kind: "external",
      url: "https://www.freecodecamp.org",
      note: "Project-based certifications across the stack.",
      hours: 12,
    },
    {
      title: "Backend Developer roadmap",
      kind: "external",
      url: "https://roadmap.sh/backend",
      note: "Server-side skill tree: APIs, databases, auth, deployment.",
      hours: 3,
    },
  ],
  systems: [
    {
      title: "Operating Systems: Three Easy Pieces",
      kind: "external",
      url: "https://pages.cs.wisc.edu/~remzi/OSTEP/",
      note: "The standard free text on processes, memory and concurrency.",
      hours: 14,
    },
    {
      title: "Computer Science roadmap",
      kind: "external",
      url: "https://roadmap.sh/computer-science",
      note: "Where systems knowledge fits in the wider curriculum.",
      hours: 2,
    },
  ],
  engineering_practice: [
    {
      title: "Pro Git (free book)",
      kind: "external",
      url: "https://git-scm.com/book/en/v2",
      note: "Branching, rebasing and collaboration workflows end to end.",
      hours: 5,
    },
    {
      title: "Refactoring Guru",
      kind: "external",
      url: "https://refactoring.guru",
      note: "Design patterns and refactoring, illustrated and language-agnostic.",
      hours: 6,
    },
    {
      title: "Google Testing Blog",
      kind: "external",
      url: "https://testing.googleblog.com",
      note: "Short, practical posts on testability from Google's engineers.",
      hours: 3,
    },
  ],
  data: [
    {
      title: "SQLBolt",
      kind: "external",
      url: "https://sqlbolt.com",
      note: "Interactive SQL lessons from SELECT to joins and aggregation.",
      hours: 4,
    },
    {
      title: "PostgreSQL tutorial (official)",
      kind: "external",
      url: "https://www.postgresql.org/docs/current/tutorial.html",
      note: "The canonical relational-database walkthrough.",
      hours: 5,
    },
    {
      title: "MongoDB University",
      kind: "external",
      url: "https://learn.mongodb.com",
      note: "Free official courses on document modelling and aggregation.",
      hours: 6,
    },
  ],
  ai_ml: [
    {
      title: "Google Machine Learning Crash Course",
      kind: "external",
      url: "https://developers.google.com/machine-learning/crash-course",
      note: "Fast, practical introduction with real exercises.",
      hours: 8,
    },
    {
      title: "fast.ai — Practical Deep Learning",
      kind: "external",
      url: "https://course.fast.ai",
      note: "Top-down deep learning course, code first.",
      hours: 14,
    },
    {
      title: "Hugging Face Learn",
      kind: "external",
      url: "https://huggingface.co/learn",
      note: "Current, hands-on LLM and transformer courses.",
      hours: 8,
    },
  ],
  cloud_devops: [
    {
      title: "DevOps roadmap",
      kind: "external",
      url: "https://roadmap.sh/devops",
      note: "The full infrastructure and delivery skill tree.",
      hours: 3,
    },
    {
      title: "Docker — get started (official)",
      kind: "external",
      url: "https://docs.docker.com/get-started/",
      note: "Containerise a real application in under an hour.",
      hours: 4,
    },
    {
      title: "Kubernetes tutorials (official)",
      kind: "external",
      url: "https://kubernetes.io/docs/tutorials/",
      note: "Deploy and scale a containerised service.",
      hours: 8,
    },
  ],
  cybersecurity: [
    {
      title: "OWASP Top Ten",
      kind: "external",
      url: "https://owasp.org/www-project-top-ten/",
      note: "The vulnerability classes every interviewer asks about.",
      hours: 4,
    },
    {
      title: "PortSwigger Web Security Academy",
      kind: "external",
      url: "https://portswigger.net/web-security",
      note: "Free hands-on labs for each OWASP class.",
      hours: 10,
    },
  ],
  soft_skills: [
    {
      title: "Ask AI — answer rehearsal",
      kind: "platform",
      url: "/chat",
      note: "Explain a hard concept aloud to the mentor and get corrected.",
      hours: 2,
    },
    {
      title: "Interview Rehearsal Studio",
      kind: "platform",
      url: "/interview",
      note: "Behavioural rounds with follow-up probes and a scorecard.",
      hours: 3,
    },
  ],
};

// A few skills deserve a targeted resource regardless of their area bucket.
const SKILL_RESOURCES: Record<string, LearningResource[]> = {
  "System Design": [
    {
      title: "System Design Primer",
      kind: "external",
      url: "https://github.com/donnemartin/system-design-primer",
      note: "Work one design topic per session, then rehearse it aloud.",
      hours: 10,
    },
  ],
  "React & Frontend Frameworks": [
    {
      title: "React roadmap",
      kind: "external",
      url: "https://roadmap.sh/react",
      note: "Component model, hooks, state and rendering, in order.",
      hours: 6,
    },
  ],
  "Testing & Quality": [
    {
      title: "Martin Fowler — Testing",
      kind: "external",
      url: "https://martinfowler.com/testing/",
      note: "Test strategy, the test pyramid, and what belongs at each level.",
      hours: 4,
    },
  ],
  "Data Structures": [
    {
      title: "NeetCode roadmap",
      kind: "external",
      url: "https://neetcode.io/roadmap",
      note: "Drill one structure per day until the patterns are automatic.",
      hours: 8,
    },
  ],
  Algorithms: [
    {
      title: "NeetCode practice",
      kind: "external",
      url: "https://neetcode.io/practice",
      note: "Timed problems grouped by technique, with video explanations.",
      hours: 10,
    },
  ],
};

function dedupe(list: LearningResource[]): LearningResource[] {
  const seen = new Set<string>();
  return list.filter((r) => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });
}

/**
 * Resources for one gap skill: always at least one platform-internal link so
 * the student can act without leaving the product, then the best-matched
 * external material. `limit` keeps a 14-skill plan readable.
 */
export function resourcesForSkill(
  skillName: string,
  area: string,
  limit = 4
): LearningResource[] {
  const targeted = SKILL_RESOURCES[skillName] ?? [];
  const byArea = AREA_RESOURCES[area] ?? AREA_RESOURCES.general ?? [];
  const platform = area === "soft_skills" ? [] : [PLATFORM_CORE[0], PLATFORM_CORE[1]];
  return dedupe([...platform, ...targeted, ...byArea]).slice(0, Math.max(2, limit));
}

/** Resources for the closing phase, when the work is rehearsal rather than study. */
export function interviewPrepResources(): LearningResource[] {
  return dedupe([
    PLATFORM_CORE[2],
    {
      title: "Interview Rehearsal Studio",
      kind: "platform",
      url: "/interview",
      note: "Run the full loop and score yourself against the rubric.",
      hours: 3,
    },
    {
      title: "Design Dojo",
      kind: "platform",
      url: "/dojo",
      note: "Timed system-design drills with critique.",
      hours: 5,
    },
  ]);
}
