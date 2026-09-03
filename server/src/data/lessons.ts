export interface LessonSeed {
  conceptId: string;
  title: string;
  domain: string;
  objectives: string[];
  canonicalContent: string;
}

export const LESSONS: LessonSeed[] = [
  {
    conceptId: "oop-basics",
    title: "Object-Oriented Programming Basics",
    domain: "oop",
    objectives: [
      "Define a class with state (fields) and behavior (methods)",
      "Create instances and call methods on them",
      "Use inheritance to extend behavior",
    ],
    canonicalContent:
      "# Object-Oriented Programming Basics\n\n" +
      "A **class** bundles data and the functions that operate on that data.\n\n" +
      "```js\nclass Dog {\n  constructor(name) {\n    this.name = name;\n  }\n  speak() {\n    return `${this.name} says woof`;\n  }\n}\n```\n\n" +
      "**Inheritance** lets a subclass reuse and extend a parent class using `extends` and `super()`. " +
      "Method overriding replaces parent behavior in the subclass.",
  },
  {
    conceptId: "arrays-101",
    title: "Arrays and Common Operations",
    domain: "data_structures",
    objectives: [
      "Create and index arrays",
      "Add and remove elements with push/pop/shift/unshift",
      "Iterate with for and forEach",
    ],
    canonicalContent:
      "# Arrays and Common Operations\n\n" +
      "Arrays are ordered lists. Indexing starts at 0.\n\n" +
      "```js\nconst arr = [1, 2, 3];\narr.push(4);   // add to end\narr.shift();   // remove from start\n```\n\n" +
      "Iteration visits each element in order; prefer `for...of` or `forEach` for readability.",
  },
  {
    conceptId: "functions-scope",
    title: "Functions and Scope",
    domain: "syntax",
    objectives: [
      "Declare functions and arrow functions",
      "Understand parameters, arguments, and return values",
      "Explain block scope with let/const",
    ],
    canonicalContent:
      "# Functions and Scope\n\n" +
      "Functions are reusable blocks of code.\n\n" +
      "```js\nfunction add(a, b) { return a + b; }\nconst mul = (a, b) => a * b;\n```\n\n" +
      "`let` and `const` are block-scoped: they only exist inside the nearest `{ }`.",
  },
  {
    conceptId: "intro-recursion",
    title: "Introduction to Recursion",
    domain: "algorithms",
    objectives: [
      "Identify base case and recursive case",
      "Trace recursive calls by hand",
      "Recognize stack overflow risks",
    ],
    canonicalContent:
      "# Introduction to Recursion\n\n" +
      "A recursive function calls itself with a smaller input until it reaches a **base case**.\n\n" +
      "```js\nfunction fact(n) {\n  if (n <= 1) return 1;   // base case\n  return n * fact(n - 1); // recursive case\n}\n```\n\n" +
      "Missing or unreachable base cases cause infinite recursion and stack overflow.",
  },
];
