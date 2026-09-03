// Deterministic fallback provider used when no GEMINI_API_KEY is configured or
// a Gemini call fails. Produces structured, schema-valid outputs so the full
// learning loop is testable offline.

import type { DiagnosticQuestion, Evaluation, Adaptation, Domain, Tier, Style } from "@edu/shared";

export function mockDiagnosticQuestion(domain: Domain, difficulty: number, seed: number): DiagnosticQuestion {
  switch (domain) {
    case "syntax": {
      if (difficulty >= 4) {
        const n = 3 + (seed % 4);
        return {
          prompt: "What does this code print?",
          code: `console.log(typeof (${n} + "x"));`,
          choices: ["string", "number", "NaN", "undefined"],
          correctIndex: 0,
          rationale: "Adding a number to a string coerces the number to string, so typeof is 'string'.",
          domain,
          difficulty,
        };
      }
      const a = 2 + (seed % 5);
      const b = 3 + ((seed + 1) % 4);
      return {
        prompt: "What does this code print?",
        code: `let x = ${a};\nlet y = ${b};\nconsole.log(x + y);`,
        choices: [String(a + b), String(a * b), String(a - b), "undefined"],
        correctIndex: 0,
        rationale: `${a} + ${b} is ${a + b}; both are numbers so + adds them.`,
        domain,
        difficulty,
      };
    }
    case "oop":
      return {
        prompt: "What is printed when this code runs?",
        code: `class Animal {\n  speak() { return "generic sound"; }\n}\nclass Dog extends Animal {\n  speak() { return "woof"; }\n}\nconsole.log(new Dog().speak());`,
        choices: ["woof", "generic sound", "undefined", "It throws an error"],
        correctIndex: 0,
        rationale: "Dog overrides speak(); the subclass method wins on instances of Dog.",
        domain,
        difficulty,
      };
    case "data_structures":
      return {
        prompt: "After these operations, what does arr contain?",
        code: `const arr = [1, 2, 3];\narr.push(4);\narr.shift();`,
        choices: ["[2, 3, 4]", "[1, 2, 3]", "[1, 2, 3, 4]", "[4]"],
        correctIndex: 0,
        rationale: "push adds 4 at the end; shift removes the first element (1).",
        domain,
        difficulty,
      };
    case "algorithms":
      return {
        prompt: "What does this function return for input " + (4 + (seed % 3)) + "?",
        code: `function f(n) {\n  return n <= 1 ? n : f(n - 1) + f(n - 2);\n}`,
        choices: ["a Fibonacci number", "n squared", "n factorial", "an infinite loop"],
        correctIndex: 0,
        rationale: "This is the classic recursive Fibonacci definition.",
        domain,
        difficulty,
      };
    case "debugging":
      return {
        prompt: "This loop should print 0..4 but misbehaves. Which line is wrong?",
        code: `for (let i = 0; i <= 5; i++) {\n  console.log(i);\n}`,
        choices: ["Line 1: the loop condition should be i < 5", "Line 2: console.log is wrong", "The let keyword is wrong", "Nothing is wrong"],
        correctIndex: 0,
        rationale: "i <= 5 makes the loop print 0..5 (six values) instead of 0..4.",
        domain,
        difficulty,
      };
  }
}

export function mockAdaptation(title: string, objectives: string[], tier: Tier, style: Style): Adaptation {
  if (tier === "beginner" || style === "analogical") {
    return {
      rewrittenContent:
        `## ${title} — explained with everyday analogies\n\n` +
        `Think of **${title}** like organizing a kitchen: every tool has a place, a name, and a job. ` +
        `When you learn this concept you are learning where things go and why.\n\n` +
        objectives.map((o) => `- Real-world view: ${o}`).join("\n") +
        `\n\n> Try explaining it back in your own words — if you can describe the "kitchen", you understand the concept.`,
      style: "analogical",
      tier,
      objectivesCovered: objectives,
    };
  }
  if (style === "diagrammatic") {
    return {
      rewrittenContent:
        `## ${title} — step-by-step execution view\n\n` +
        "```\n[ create ] -> [ store in memory ] -> [ call / use ] -> [ result ]\n```\n\n" +
        `Follow the arrows: each step below maps to one box above.\n\n` +
        objectives.map((o, i) => `${i + 1}. ${o}`).join("\n") +
        `\n\n> Trace a tiny example by hand and watch each box light up in order.`,
      style: "diagrammatic",
      tier,
      objectivesCovered: objectives,
    };
  }
  return {
    rewrittenContent:
      `## ${title} — concise technical deep-dive\n\n` +
      `This rewrite targets the underlying mechanics of ${title}.\n\n` +
      objectives.map((o) => `- ${o}`).join("\n") +
      `\n\nFocus on the invariants and edge behavior; everything else follows from them.`,
    style: "conceptual",
    tier,
    objectivesCovered: objectives,
  };
}

export function mockEvaluation(
  code: string,
  checks: { description: string; pattern: string }[],
  tier: Tier
): Evaluation {
  const matched = checks.filter((c) => new RegExp(c.pattern, "i").test(code));
  const correctness = checks.length ? Math.round((matched.length / checks.length) * 100) : 50;

  let style = 50;
  if (/\b(const|let)\b/.test(code)) style += 15;
  if (/\/\//.test(code)) style += 10;
  if (/\bfunction\s+[a-z][a-zA-Z]*\b|=>/.test(code)) style += 15;
  style = Math.min(100, style);

  let edgeCases = 40;
  if (/\bif\b/.test(code)) edgeCases += 20;
  if (/(\.length|===?\s*(0|null|undefined)|typeof)/.test(code)) edgeCases += 25;
  if (/try\s*\{/.test(code)) edgeCases += 15;
  edgeCases = Math.min(100, edgeCases);

  let optimization = 55;
  if (/for\s*\(.*for\s*\(/s.test(code)) optimization -= 20;
  if (/\.(map|filter|reduce)\(/.test(code)) optimization += 15;
  optimization = Math.max(0, Math.min(100, optimization));

  const correct = correctness === 100;
  const tone =
    tier === "beginner"
      ? "Great effort — let's build on it step by step."
      : tier === "intermediate"
        ? "Solid attempt; here are targeted fixes tied to the core concepts."
        : "Review the design and efficiency notes below.";

  return {
    correct,
    scores: { correctness, style, edgeCases, optimization },
    summary:
      matched.length === checks.length
        ? `All checks satisfied. ${tone}`
        : `${matched.length}/${checks.length} checks satisfied: ${checks
            .filter((c) => !matched.includes(c))
            .map((c) => c.description)
            .join("; ")}. ${tone}`,
    tieredGuidance:
      tier === "beginner"
        ? ["Start by re-reading the task and identifying the inputs and outputs.", "Write the simplest version first, then improve it."]
        : tier === "intermediate"
          ? ["Map each failing check to a specific concept and fix them one at a time.", "Add boundary checks for empty or unexpected inputs."]
          : ["Consider algorithmic complexity and avoid unnecessary passes.", "Refactor for clarity: small pure functions with explicit contracts."],
    improvements: checks
      .filter((c) => !matched.includes(c))
      .map((c) => `Missing: ${c.description}`),
    matrixDeltas: [{ domain: "debugging", delta: correct ? 0.05 : -0.02 }],
  };
}
