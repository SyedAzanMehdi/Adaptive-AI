// Multi-domain knowledge base backing the general chatbot's offline fallback.
// Organized by domain so the assistant can answer across computer science and
// beyond, even when no GEMINI_API_KEY is configured. When Gemini is available it
// handles open-ended questions; this base keeps the experience consistent offline.

export interface KnowledgeEntry {
  id: string;
  domain: string;
  keywords: string[];
  answer: string;
}

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // ---------- Programming fundamentals ----------
  {
    id: "var-scope",
    domain: "syntax",
    keywords: ["variable", "scope", "let", "const", "var", "block"],
    answer:
      "A variable is a named container for a value. In JavaScript, `let` and `const` are block-scoped (they only exist inside the nearest `{ }`), while the older `var` is function-scoped. Prefer `const` by default and `let` when you must reassign.",
  },
  {
    id: "functions",
    domain: "syntax",
    keywords: ["function", "arrow", "return", "parameter", "argument"],
    answer:
      "Functions bundle reusable logic. Declare them with `function add(a, b) { return a + b; }` or as arrow functions `const mul = (a, b) => a * b;`. Parameters are the names in the definition; arguments are the values you pass in.",
  },
  {
    id: "types",
    domain: "syntax",
    keywords: ["type", "typeof", "string", "number", "boolean", "coercion"],
    answer:
      "JavaScript has primitive types (string, number, boolean, null, undefined, symbol, bigint) and objects. `typeof` reports a value's type. Watch for coercion: `1 + \"2\"` gives the string \"12\" because + concatenates when either side is a string.",
  },
  {
    id: "loops",
    domain: "syntax",
    keywords: ["loop", "for", "while", "iterate", "iteration"],
    answer:
      "Loops repeat work. `for (let i = 0; i < n; i++)` runs a known number of times; `while` runs until a condition fails; `for...of` walks array values cleanly. Make sure the loop condition eventually becomes false to avoid infinite loops.",
  },

  // ---------- Object-Oriented Programming ----------
  {
    id: "oop-class",
    domain: "oop",
    keywords: ["class", "object", "constructor", "instance", "oop"],
    answer:
      "A class bundles data (fields) with behavior (methods). The `constructor` initializes each new instance created with `new`. Think of a class as a blueprint and an object as a house built from it.",
  },
  {
    id: "oop-inheritance",
    domain: "oop",
    keywords: ["inheritance", "extends", "super", "subclass", "parent"],
    answer:
      "Inheritance lets a subclass `extend` a parent class to reuse and add behavior. Use `super()` in the subclass constructor to run the parent's setup. Overriding replaces a parent method in the subclass.",
  },
  {
    id: "oop-encapsulation",
    domain: "oop",
    keywords: ["encapsulation", "private", "getter", "setter", "abstraction"],
    answer:
      "Encapsulation hides internal state and exposes only safe operations (often via getters/setters). This protects invariants and lets you change internals without breaking callers.",
  },
  {
    id: "oop-polymorphism",
    domain: "oop",
    keywords: ["polymorphism", "override", "interface", "duck typing"],
    answer:
      "Polymorphism means one interface, many implementations. Different classes can respond to the same method call in their own way, letting you write code that works on the shared shape rather than concrete types.",
  },

  // ---------- Data structures ----------
  {
    id: "ds-array",
    domain: "data_structures",
    keywords: ["array", "list", "index", "push", "pop"],
    answer:
      "Arrays are ordered, zero-indexed lists. `push`/`pop` work at the end (O(1)); `shift`/`unshift` work at the front (O(n) because elements shift). Access by index is O(1).",
  },
  {
    id: "ds-stack-queue",
    domain: "data_structures",
    keywords: ["stack", "queue", "lifo", "fifo"],
    answer:
      "A stack is LIFO (last in, first out) — think a stack of plates; use push/pop. A queue is FIFO (first in, first out) — think a line; use enqueue/dequeue. Stacks suit undo and recursion; queues suit breadth-first search and task scheduling.",
  },
  {
    id: "ds-hashmap",
    domain: "data_structures",
    keywords: ["hash", "map", "object", "dictionary", "key"],
    answer:
      "A hash map stores key→value pairs with average O(1) lookup. In JavaScript, plain objects and `Map` fill this role. Great for counting, caching, and de-duplicating.",
  },
  {
    id: "ds-tree",
    domain: "data_structures",
    keywords: ["tree", "binary", "bst", "heap", "traversal"],
    answer:
      "Trees organize data hierarchically. A binary search tree keeps smaller values left and larger right, giving O(log n) search when balanced. Heaps are trees optimized for quickly finding the min or max.",
  },

  // ---------- Algorithms ----------
  {
    id: "alg-bigO",
    domain: "algorithms",
    keywords: ["big o", "complexity", "time", "space", "efficiency"],
    answer:
      "Big-O describes how runtime grows with input size: O(1) constant, O(log n) logarithmic, O(n) linear, O(n log n) efficient sorting, O(n²) nested loops. Focus on the dominant term and drop constants.",
  },
  {
    id: "alg-recursion",
    domain: "algorithms",
    keywords: ["recursion", "recursive", "base case"],
    answer:
      "Recursion solves a problem by calling itself on a smaller input until reaching a base case. Always define the base case first, then the recursive case — missing it causes stack overflow.",
  },
  {
    id: "alg-sorting",
    domain: "algorithms",
    keywords: ["sort", "sorting", "merge", "quick", "bubble"],
    answer:
      "Comparison sorts like merge sort and quicksort average O(n log n); simple ones like bubble sort are O(n²). Most languages provide a built-in, well-optimized sort — use it unless you have a special need.",
  },
  {
    id: "alg-search",
    domain: "algorithms",
    keywords: ["search", "binary search", "linear"],
    answer:
      "Linear search checks each item (O(n)). Binary search halves a sorted range each step (O(log n)) — but only works on sorted data. If you'll search often, sorting once can pay off.",
  },

  // ---------- Debugging ----------
  {
    id: "dbg-strategy",
    domain: "debugging",
    keywords: ["debug", "bug", "error", "wrong", "not working"],
    answer:
      "Reproduce the bug reliably, then isolate it: check inputs, add logging or breakpoints, and form a hypothesis before changing code. Fix the smallest thing that could be wrong, re-test, and repeat. A failing test that reproduces the bug is gold.",
  },
  {
    id: "dbg-offbyone",
    domain: "debugging",
    keywords: ["off by one", "index", "boundary", "loop bound"],
    answer:
      "Off-by-one errors come from boundary confusion — `<=` vs `<`, starting at 0 vs 1, or array length vs last index. Check your loop bounds and whether you mean inclusive or exclusive limits.",
  },
  {
    id: "dbg-undefined",
    domain: "debugging",
    keywords: ["undefined", "null", "cannot read", "reference"],
    answer:
      "\"Cannot read properties of undefined\" means you accessed a property on something not yet set. Trace backwards to where the value should have been assigned and check for typos, async timing, or missing initialization.",
  },

  // ---------- Web & databases ----------
  {
    id: "web-http",
    domain: "web",
    keywords: ["http", "api", "rest", "request", "response", "endpoint"],
    answer:
      "HTTP is a request/response protocol. A client sends a method + path (e.g. GET /lessons); the server replies with a status code and body. REST APIs organize resources behind predictable endpoints and standard methods.",
  },
  {
    id: "web-auth",
    domain: "web",
    keywords: ["authentication", "jwt", "token", "login", "authorization"],
    answer:
      "Authentication proves who you are; authorization decides what you may do. JWTs are signed tokens carrying claims (like a user id and role); the server verifies the signature instead of storing sessions. Keep secrets server-side.",
  },
  {
    id: "db-index",
    domain: "databases",
    keywords: ["database", "index", "query", "mongo", "sql"],
    answer:
      "Indexes let a database find rows without scanning everything, like a book's index. Add them on fields you filter or sort by often, but each index costs write speed and space.",
  },

  // ---------- AI / machine learning ----------
  {
    id: "ai-ml",
    domain: "ai",
    keywords: ["machine learning", "ml", "model", "training", "neural"],
    answer:
      "Machine learning fits a model to data instead of hand-coding rules. Training adjusts parameters to reduce error; evaluation tests on unseen data to check generalization. Watch for overfitting — great training scores but poor real-world performance.",
  },
  {
    id: "ai-llm",
    domain: "ai",
    keywords: ["llm", "gpt", "gemini", "prompt", "large language"],
    answer:
      "Large language models predict text from patterns learned at scale. Good prompts give context, a clear task, and output format. Structured outputs constrain responses to a schema so they can be validated and stored safely.",
  },

  // ---------- Learning & career ----------
  {
    id: "learn-how",
    domain: "learning",
    keywords: ["learn", "study", "practice", "improve", "stuck"],
    answer:
      "Learn by doing: read a little, then build something small right away. Space out practice, test yourself instead of re-reading, and revisit weak areas — exactly what this platform's Capability Matrix tracks for you.",
  },
  {
    id: "career-portfolio",
    domain: "career",
    keywords: ["career", "job", "interview", "resume", "portfolio"],
    answer:
      "Build a portfolio of small, finished projects and be able to explain your choices. For interviews, practice explaining your thinking out loud, not just reaching the answer. Consistency beats intensity.",
  },

  // ---------- Platform help ----------
  {
    id: "help-diagnostic",
    domain: "platform",
    keywords: ["diagnostic", "assessment", "matrix", "capability"],
    answer:
      "The diagnostic is an adaptive test that builds your Capability Matrix — a per-domain map of strengths and weaknesses. Answer honestly; the goal is an accurate map, not a high score. Your matrix refines itself as you keep learning.",
  },
  {
    id: "help-adapt",
    domain: "platform",
    keywords: ["adapt", "lesson rewrite", "personalized", "why changed"],
    answer:
      "When the platform detects you're struggling with a domain, it rewrites the lesson to match your level and learning style — analogies for beginners, diagrams for intermediates, deeper internals for advanced learners. Same objectives, better fit.",
  },
  {
    id: "help-practice",
    domain: "platform",
    keywords: ["practice", "submit", "feedback", "exercise", "code"],
    answer:
      "In Practice, write code in the editor and submit it. The AI mentor grades correctness, style, edge cases, and optimization, then gives tiered guidance matched to your level. Each submission also updates your Capability Matrix.",
  },
];

const FALLBACKS = [
  "Great question. Let's break it down: what do you already know about it, and what's the smallest example you could try? Working a tiny case by hand usually reveals the pattern.",
  "I don't have a specific lesson on that yet, but here's a reliable approach: define the problem in one sentence, list inputs and outputs, then sketch the simplest solution before optimizing.",
  "Interesting topic! Try connecting it to something you already understand — analogies are how new concepts stick. If it's about a CS domain, ask me to explain the fundamentals and we'll build up from there.",
];

export function pickFallback(seed: number): string {
  return FALLBACKS[Math.abs(seed) % FALLBACKS.length];
}
