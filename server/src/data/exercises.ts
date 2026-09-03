import type { Domain } from "@edu/shared";

export interface ExerciseCheck {
  description: string;
  pattern: string;
}

export interface ExerciseDef {
  exerciseId: string;
  conceptId: string;
  domain: Domain;
  title: string;
  prompt: string;
  starterCode: string;
  language: string;
  checks: ExerciseCheck[];
}

export const EXERCISES: ExerciseDef[] = [
  {
    exerciseId: "sum-array",
    conceptId: "arrays-101",
    domain: "data_structures",
    title: "Sum an Array",
    prompt:
      "Write a function sumArray(arr) that returns the sum of all numbers in arr. Return 0 for an empty array.",
    starterCode: "function sumArray(arr) {\n  // your code here\n}\n",
    language: "javascript",
    checks: [
      { description: "defines a sumArray function", pattern: "function\\s+sumArray|sumArray\\s*=" },
      { description: "returns a numeric accumulation (loop or reduce)", pattern: "(for|reduce|forEach)" },
      { description: "uses a starting accumulator", pattern: "(let|const)\\s+\\w+\\s*=\\s*0|reduce\\(" },
      { description: "handles empty array explicitly", pattern: "\\.length\\s*===?\\s*0|return\\s+0" },
    ],
  },
  {
    exerciseId: "dog-class",
    conceptId: "oop-basics",
    domain: "oop",
    title: "Build a Dog Class",
    prompt:
      "Define a class Dog with a constructor storing name, and a method speak() returning '<name> says woof'.",
    starterCode: "// define class Dog here\n",
    language: "javascript",
    checks: [
      { description: "declares a class named Dog", pattern: "class\\s+Dog" },
      { description: "has a constructor", pattern: "constructor\\s*\\(" },
      { description: "stores the name on the instance", pattern: "this\\.name" },
      { description: "defines a speak method", pattern: "speak\\s*\\(" },
      { description: "returns the expected phrase", pattern: "woof" },
    ],
  },
  {
    exerciseId: "reverse-string",
    conceptId: "functions-scope",
    domain: "syntax",
    title: "Reverse a String",
    prompt:
      "Write a function reverseString(s) that returns s reversed. Handle empty and single-character strings.",
    starterCode: "function reverseString(s) {\n  // your code here\n}\n",
    language: "javascript",
    checks: [
      { description: "defines reverseString", pattern: "function\\s+reverseString|reverseString\\s*=" },
      { description: "splits or iterates characters", pattern: "split|for|\\.\\.\\.|Array\\.from" },
      { description: "uses reverse/join or manual accumulation", pattern: "reverse|join|\\+=" },
      { description: "guards against empty input", pattern: "\\.length|===?\\s*['\"]['\"]|if\\s*\\(" },
    ],
  },
  {
    exerciseId: "factorial",
    conceptId: "intro-recursion",
    domain: "algorithms",
    title: "Recursive Factorial",
    prompt:
      "Write a recursive function factorial(n) that returns n!. Include a base case for n <= 1.",
    starterCode: "function factorial(n) {\n  // your code here\n}\n",
    language: "javascript",
    checks: [
      { description: "defines factorial", pattern: "function\\s+factorial|factorial\\s*=" },
      { description: "calls itself recursively", pattern: "factorial\\s*\\(\\s*n\\s*-" },
      { description: "has a base case", pattern: "(if|<=|===?\\s*(0|1)).*(return\\s+1)|return\\s+1" },
      { description: "multiplies n by the recursive result", pattern: "n\\s*\\*" },
    ],
  },
];

export function findExercise(exerciseId: string): ExerciseDef | undefined {
  return EXERCISES.find((e) => e.exerciseId === exerciseId);
}
