import type { Domain } from "@edu/shared";

// Career Autopilot™ — curated skill taxonomy used by the deterministic JD
// analyzer (mock path) and to constrain Gemini's extraction to known skills.
// coreDomain links a skill to one of the five live Capability Matrix
// competencies; skills without a link are reported as "unmeasured".

export interface TaxonomySkill {
  name: string;
  area: string;
  coreDomain?: Domain;
  keywords: string[];
}

export const SKILL_TAXONOMY: TaxonomySkill[] = [
  // Core computer science
  { name: "Data Structures", area: "cs_fundamentals", coreDomain: "data_structures", keywords: ["data structure", "data structures", "trees", "graphs", "hash map", "hashmap", "heap", "trie"] },
  { name: "Algorithms", area: "cs_fundamentals", coreDomain: "algorithms", keywords: ["algorithm", "algorithms", "dynamic programming", "sorting", "graph algorithm", "complexity analysis", "big o", "big-o"] },
  { name: "Object-Oriented Design", area: "cs_fundamentals", coreDomain: "oop", keywords: ["object-oriented", "object oriented", "oop", "design patterns", "solid principles", "class design"] },
  { name: "Language Syntax & Idioms", area: "cs_fundamentals", coreDomain: "syntax", keywords: ["proficiency in", "strong command of", "fluency in"] },
  { name: "Debugging & Profiling", area: "cs_fundamentals", coreDomain: "debugging", keywords: ["debugging", "debug", "profiling", "troubleshoot", "root cause", "incident response"] },
  { name: "System Design", area: "architecture", coreDomain: "algorithms", keywords: ["system design", "distributed systems", "scalab", "high availability", "microservices", "architecture"] },

  // Languages
  { name: "JavaScript / TypeScript", area: "web", coreDomain: "syntax", keywords: ["javascript", "typescript", " es6", "node.js", "nodejs", "node js"] },
  { name: "Python", area: "general", coreDomain: "syntax", keywords: ["python", "django", "flask", "fastapi"] },
  { name: "Java / JVM", area: "general", coreDomain: "syntax", keywords: [" java ", "kotlin", "scala", "spring boot", "jvm"] },
  { name: "Go / Rust", area: "general", coreDomain: "syntax", keywords: ["golang", " go ", "rust"] },
  { name: "C / C++", area: "systems", coreDomain: "syntax", keywords: ["c++", " c ", "embedded"] },

  // Web & full-stack
  { name: "React & Frontend Frameworks", area: "web", keywords: ["react", "next.js", "nextjs", "vue", "angular", "frontend framework", "spa"] },
  { name: "HTML, CSS & Accessibility", area: "web", keywords: ["html", "css", "tailwind", "accessibility", "a11y", "responsive design"] },
  { name: "REST & API Design", area: "web", coreDomain: "debugging", keywords: ["rest api", "restful", "api design", "graphql", "openapi", "grpc"] },
  { name: "Testing & Quality", area: "engineering_practice", coreDomain: "debugging", keywords: ["unit test", "testing", "jest", "cypress", "tdd", "test coverage", "ci/cd"] },

  // Data & storage
  { name: "SQL & Relational Databases", area: "data", coreDomain: "data_structures", keywords: ["sql", "postgres", "postgresql", "mysql", "relational database", "rdbms"] },
  { name: "NoSQL & Caching", area: "data", keywords: ["mongodb", "nosql", "redis", "dynamodb", "cassandra", "caching"] },
  { name: "Data Pipelines", area: "data", keywords: ["etl", "data pipeline", "kafka", "spark", "airflow", "streaming data"] },

  // AI / ML
  { name: "Machine Learning", area: "ai_ml", coreDomain: "algorithms", keywords: ["machine learning", " ml ", "scikit-learn", "supervised", "model training"] },
  { name: "Deep Learning & LLMs", area: "ai_ml", coreDomain: "algorithms", keywords: ["deep learning", "neural network", "pytorch", "tensorflow", "llm", "generative ai", "transformer"] },
  { name: "MLOps", area: "ai_ml", keywords: ["mlops", "model deployment", "feature store", "model monitoring"] },

  // Cloud & DevOps
  { name: "Cloud Platforms", area: "cloud_devops", keywords: ["aws", "azure", "gcp", "google cloud", "cloud infrastructure"] },
  { name: "Containers & Kubernetes", area: "cloud_devops", keywords: ["docker", "kubernetes", "containers", "helm"] },
  { name: "CI/CD & Automation", area: "cloud_devops", coreDomain: "debugging", keywords: ["ci/cd", "cicd", "jenkins", "github actions", "terraform", "infrastructure as code"] },

  // Security
  { name: "Application Security", area: "cybersecurity", coreDomain: "debugging", keywords: ["security", "owasp", "penetration", "vulnerability", "secure coding", "threat"] },

  // Practices
  { name: "Version Control & Collaboration", area: "engineering_practice", keywords: ["git", "github", "gitlab", "code review", "pull request"] },
  { name: "Agile Delivery", area: "engineering_practice", keywords: ["agile", "scrum", "kanban", "sprint"] },
  { name: "Communication & Mentorship", area: "soft_skills", keywords: ["communication", "mentor", "stakeholder", "cross-functional", "collaborate"] },
];
