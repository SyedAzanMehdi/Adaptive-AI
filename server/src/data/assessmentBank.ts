import type { AssessmentType } from "@edu/shared";

// Automated Assessment Generator™ — curated probe bank.
//
// These are the deterministic fallback used when Gemini is unavailable, and
// they are also what the test suite asserts against. Two rules shaped them:
//   1. `correctIndex` is deliberately spread across positions. A bank where
//      every answer is option A is passable by guessing, which makes the
//      assessment worthless as a gap signal.
//   2. Distractors are real misconceptions, not filler, so a wrong pick tells
//      the student something specific.

export interface ProbeItem {
  type: AssessmentType;
  prompt: string;
  options?: string[];
  correctIndex?: number;
  rationale?: string;
  rubric?: string[];
  minutes: number;
}

export const SKILL_PROBES: Record<string, ProbeItem> = {
  "Data Structures": {
    type: "quiz",
    prompt:
      "A hash map's average lookup degrades from O(1) toward O(n). What is the usual cause?",
    options: [
      "Keys are integers rather than strings",
      "The table was resized to a larger prime capacity",
      "The load factor grew so most buckets collide",
      "Values are stored inline instead of by reference",
    ],
    correctIndex: 2,
    rationale:
      "Collision count is driven by the load factor. Resizing to a larger table reduces collisions; integer keys and inline storage do not cause the degradation.",
    minutes: 3,
  },
  Algorithms: {
    type: "quiz",
    prompt:
      "QuickSort's worst case is O(n²). Which input triggers it when the pivot is always the first element?",
    options: [
      "An array of random distinct values",
      "An already-sorted array",
      "An array whose length is a power of two",
      "An array containing many duplicate values",
    ],
    correctIndex: 1,
    rationale:
      "A sorted array makes every partition maximally unbalanced (n-1 vs 0). Duplicates hurt some naive partitions too, but sorted input is the textbook worst case; randomised or median-of-three pivots fix it.",
    minutes: 3,
  },
  "Object-Oriented Design": {
    type: "quiz",
    prompt: "Which change violates the Liskov Substitution Principle?",
    options: [
      "A subclass adds a method the parent does not declare",
      "A subclass overrides a method and preserves its contract",
      "A subclass holds extra private state",
      "A subclass narrows the range of inputs an inherited method accepts",
    ],
    correctIndex: 3,
    rationale:
      "Callers written against the parent must keep working with the subclass. Rejecting inputs the parent accepted breaks that; adding methods or state does not.",
    minutes: 3,
  },
  "Debugging & Profiling": {
    type: "quiz",
    prompt:
      "A service's p99 latency spikes while CPU utilisation stays low. What do you investigate first?",
    options: [
      "The size of the deployed binary",
      "Lock contention and blocking I/O wait time",
      "The number of CPU cores allocated to the container",
      "The garbage-collector heap ceiling",
    ],
    correctIndex: 1,
    rationale:
      "Idle CPU plus high latency means threads are waiting, not computing — blocked on a lock, a slow downstream call, or synchronous I/O.",
    minutes: 3,
  },
  "System Design": {
    type: "interview",
    prompt:
      "Design a URL shortener that must serve 10,000 reads per second with p99 under 100 ms. Walk through your data model, your ID scheme, and where you would cache.",
    rubric: [
      "States explicit functional and non-functional goals before drawing anything",
      "Justifies the ID scheme (hash vs base62 counter) and addresses collisions",
      "Places a cache in front of the read path and explains invalidation",
      "Names the bottleneck at 10x traffic and the mitigation",
    ],
    minutes: 20,
  },
  "JavaScript / TypeScript": {
    type: "quiz",
    prompt: "What does `typeof null` evaluate to in JavaScript?",
    options: ['"null"', '"undefined"', '"object"', '"boolean"'],
    correctIndex: 2,
    rationale:
      'A legacy artefact of the first JS implementation that has never been fixed for backwards compatibility. `typeof null === "object"` is true.',
    minutes: 2,
  },
  Python: {
    type: "quiz",
    prompt: "Which statement about Python's Global Interpreter Lock is correct?",
    options: [
      "It makes threading faster than multiprocessing for CPU-bound work",
      "It prevents multiple threads executing Python bytecode at the same time",
      "It locks the interpreter during every I/O operation",
      "It applies only to async coroutines",
    ],
    correctIndex: 1,
    rationale:
      "The GIL serialises bytecode execution, which is why CPU-bound Python uses multiprocessing. It is released during I/O, which is exactly why threads still help for I/O-bound work.",
    minutes: 3,
  },
  "React & Frontend Frameworks": {
    type: "quiz",
    prompt: "When does a `useEffect` with an empty dependency array run?",
    options: [
      "On every render",
      "Once, after the first render commits",
      "Once, before the first render",
      "Only when the component's props change",
    ],
    correctIndex: 1,
    rationale:
      "Effects run after commit. An empty dependency array means no dependency ever changes, so the effect fires once on mount and its cleanup runs on unmount.",
    minutes: 2,
  },
  "HTML, CSS & Accessibility": {
    type: "quiz",
    prompt: "Which of these is a genuine WCAG failure?",
    options: [
      "An icon-only button carrying an aria-label",
      "A form input labelled only by its placeholder attribute",
      "A page whose heading hierarchy starts at h1",
      "A link whose text describes its destination",
    ],
    correctIndex: 1,
    rationale:
      "A placeholder is not a label: it disappears on input, is not reliably exposed to assistive technology, and often fails contrast. Use a real <label>.",
    minutes: 2,
  },
  "REST & API Design": {
    type: "quiz",
    prompt: "A POST creates a new resource successfully. What should the API return?",
    options: [
      "200 OK with an empty body",
      "204 No Content",
      "201 Created with a Location header pointing at the new resource",
      "302 Found with the collection URL",
    ],
    correctIndex: 2,
    rationale:
      "201 Created plus Location tells the client where the resource now lives, so it can GET or DELETE it without guessing an identifier.",
    minutes: 2,
  },
  "Testing & Quality": {
    type: "quiz",
    prompt:
      "A test passes against a mocked dependency but the same code fails in production. What is the most likely cause?",
    options: [
      "The test runner is misconfigured",
      "The assertion is too strict",
      "The mock has diverged from the real dependency's contract",
      "The network was flaky during the production run",
    ],
    correctIndex: 2,
    rationale:
      "A mock encodes an assumption about a dependency. When the real thing changes and the mock does not, the suite stays green while the system breaks — the classic argument for at least one integration test per boundary.",
    minutes: 3,
  },
  "SQL & Relational Databases": {
    type: "quiz",
    prompt:
      "A query filters on a column with no index in a 50-million-row table. What will the planner do?",
    options: [
      "Fall back to a sequential scan of the table",
      "Build an index automatically at query time",
      "Reject the query as too expensive",
      "Serve it from the query cache",
    ],
    correctIndex: 0,
    rationale:
      "Without a usable index the planner has no choice but a sequential scan. It will not create one for you, and a cache only helps if the identical query ran recently.",
    minutes: 3,
  },
  "NoSQL & Caching": {
    type: "quiz",
    prompt: "How does cache-aside differ from write-through caching?",
    options: [
      "Cache-aside keeps the cache permanently consistent with the database",
      "In cache-aside the application reads and writes the cache itself",
      "Cache-aside bypasses the cache on every write",
      "Cache-aside requires a distributed lock on each read",
    ],
    correctIndex: 1,
    rationale:
      "Cache-aside puts the cache in application code: read miss loads from the DB and populates the cache, writes go to the DB and then invalidate. Write-through pushes that responsibility into the cache layer.",
    minutes: 3,
  },
  "Containers & Kubernetes": {
    type: "quiz",
    prompt: "A pod is stuck in CrashLoopBackOff. What does that mean?",
    options: [
      "The node has run out of memory",
      "The container image could not be pulled",
      "The container starts and then exits, repeatedly",
      "The Service has no ready endpoints",
    ],
    correctIndex: 2,
    rationale:
      "CrashLoopBackOff means the container ran and terminated, and Kubernetes is backing off before retrying. An image pull failure is ImagePullBackOff; missing endpoints is a Service problem, not a pod state.",
    minutes: 3,
  },
  "CI/CD & Automation": {
    type: "quiz",
    prompt: "Which description matches a blue-green deployment?",
    options: [
      "Traffic is split gradually by percentage between old and new versions",
      "Features are hidden behind runtime flags and enabled per user",
      "Two identical environments exist and traffic is switched between them",
      "The release ships to one region first and expands outward",
    ],
    correctIndex: 2,
    rationale:
      "Blue-green keeps an idle replica ready so rollback is a switch, not a redeploy. Gradual percentage splitting is a canary release; runtime flags are feature toggles.",
    minutes: 3,
  },
  "Application Security": {
    type: "quiz",
    prompt: "Which control most reliably prevents SQL injection?",
    options: [
      "Escaping quote characters in user input",
      "Validating the length of user input",
      "Using parameterised queries or prepared statements",
      "Running the database user with reduced privileges",
    ],
    correctIndex: 2,
    rationale:
      "Parameterisation separates code from data at the protocol level, so input can never be parsed as SQL. Escaping is encoding-dependent and routinely bypassed; least privilege limits damage but does not prevent injection.",
    minutes: 3,
  },
  "Version Control & Collaboration": {
    type: "quiz",
    prompt: "Why is rebasing a branch that others have already pulled considered dangerous?",
    options: [
      "It rewrites commit history that their work is based on",
      "It always produces unresolvable merge conflicts",
      "It deletes the remote branch as a side effect",
      "It cannot be undone once pushed",
    ],
    correctIndex: 0,
    rationale:
      "Rebase creates new commits with new hashes. Anyone who based work on the old ones now has divergent history and must recover manually — which is why `git push --force` to a shared branch is destructive.",
    minutes: 3,
  },
  "Machine Learning": {
    type: "quiz",
    prompt:
      "A classifier reports 99% accuracy on a dataset where 99% of samples belong to the negative class. What is the correct read?",
    options: [
      "The model is well calibrated",
      "Accuracy is misleading here; the model may be predicting the majority class every time",
      "The model is overfitting the training set",
      "The model needs more features",
    ],
    correctIndex: 1,
    rationale:
      "A constant negative predictor scores 99% on that distribution while having zero recall on the class you actually care about. Use precision, recall, F1 or PR-AUC under class imbalance.",
    minutes: 3,
  },
  "Deep Learning & LLMs": {
    type: "quiz",
    prompt: "What does the temperature parameter control in LLM sampling?",
    options: [
      "The maximum number of tokens generated",
      "The size of the context window",
      "How sharply the model weights high-probability tokens",
      "How fast inference runs on the GPU",
    ],
    correctIndex: 2,
    rationale:
      "Temperature scales the logits before softmax. Low temperature concentrates probability on the most likely token (deterministic); high temperature flattens it (more varied). Length and context are separate limits.",
    minutes: 3,
  },
  "Agile Delivery": {
    type: "interview",
    prompt:
      "Your team commits to a sprint and partway through a requirement doubles in size. How do you handle it, and who do you tell first?",
    rubric: [
      "Surfaces the change immediately rather than absorbing it silently",
      "Offers an explicit trade: reduce scope, extend the sprint, or accept risk",
      "Distinguishes a genuine requirement change from an estimation miss",
      "Commits to something concrete and time-bound, not a vague promise",
    ],
    minutes: 8,
  },
  "Communication & Mentorship": {
    type: "interview",
    prompt:
      "Describe a time you disagreed with a more senior engineer's technical decision. What did you do, and how did it end?",
    rubric: [
      "Disagrees with the decision, not the person, and says so concretely",
      "Brings evidence — a measurement, a spike, or a written trade-off",
      "Commits fully once the group decides, even if it was not their call",
      "Reports the actual outcome, including what they would do differently",
    ],
    minutes: 8,
  },
};

// Area-level fallbacks for skills with no bespoke probe. Templated so the
// question still names the specific skill rather than reading generically.
export const AREA_PROBES: Record<string, (skill: string) => ProbeItem> = {
  cs_fundamentals: (skill) => ({
    type: "coding",
    prompt: `Implement the core operation of ${skill} from scratch, without a library. State the time and space complexity of your solution and justify both.`,
    rubric: [
      "Correct on the obvious case and on at least two edge cases",
      "Complexity stated accurately, not optimistically",
      "Names the trade-off it made and the alternative it rejected",
    ],
    minutes: 25,
  }),
  architecture: (skill) => ({
    type: "interview",
    prompt: `Talk me through how you would apply ${skill} to a system serving a million users a day. Where does it break first?`,
    rubric: [
      "Starts from requirements and constraints, not from a technology",
      "Identifies the first bottleneck and quantifies it",
      "Proposes a mitigation with a stated cost",
    ],
    minutes: 15,
  }),
  soft_skills: (skill) => ({
    type: "interview",
    prompt: `Give a specific example of ${skill} from a real project. What did you do, what changed as a result, and what would you do differently?`,
    rubric: [
      "Names a real situation with concrete detail, not a generic principle",
      "Describes their own action, not the team's",
      "States an observable outcome",
      "Acknowledges something they would change",
    ],
    minutes: 8,
  }),
  engineering_practice: (skill) => ({
    type: "interview",
    prompt: `How do you actually apply ${skill} on a team? Describe the last time it saved you from a problem, and the last time it cost you time.`,
    rubric: [
      "Gives a real example in both directions, not only the success",
      "Explains the mechanism, not just the ritual",
      "Acknowledges when the practice is not worth its cost",
    ],
    minutes: 10,
  }),
};

const DEFAULT_PROBE = (skill: string): ProbeItem => ({
  type: "coding",
  prompt: `Build a small, runnable artifact that demonstrates ${skill}. Keep it under 100 lines and include one test that would fail if the behaviour broke.`,
  rubric: [
    "Runs as written, with no missing setup step",
    "Demonstrates the skill rather than merely mentioning it",
    "Includes a test with a real failure mode",
    "Comments explain a non-obvious decision, not the obvious code",
  ],
  minutes: 25,
});

/**
 * Pick a probe for one gap skill: bespoke question when one exists, otherwise
 * an area template, otherwise the generic build-something probe.
 */
export function probeFor(skill: string, area: string): ProbeItem {
  const bespoke = SKILL_PROBES[skill];
  if (bespoke) return bespoke;
  const byArea = AREA_PROBES[area];
  return byArea ? byArea(skill) : DEFAULT_PROBE(skill);
}
