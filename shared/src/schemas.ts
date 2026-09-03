import { z } from "zod";

// ---------- Roles & tiers ----------
export const roleSchema = z.enum(["student", "admin"]);
export type Role = z.infer<typeof roleSchema>;

export const tierSchema = z.enum(["beginner", "intermediate", "advanced"]);
export type Tier = z.infer<typeof tierSchema>;

export const styleSchema = z.enum(["analogical", "diagrammatic", "conceptual"]);
export type Style = z.infer<typeof styleSchema>;

// ---------- Competency domains ----------
export const DOMAINS = [
  "syntax",
  "oop",
  "data_structures",
  "algorithms",
  "debugging",
] as const;
export const domainSchema = z.enum(DOMAINS);
export type Domain = z.infer<typeof domainSchema>;

// ---------- Diagnostic ----------
export const diagnosticQuestionSchema = z.object({
  prompt: z.string(),
  code: z.string().optional(),
  choices: z.array(z.string()).min(2),
  correctIndex: z.number().int().min(0),
  rationale: z.string().optional(),
  domain: domainSchema,
  difficulty: z.number().min(1).max(5),
});
export type DiagnosticQuestion = z.infer<typeof diagnosticQuestionSchema>;

export const capabilityMatrixSchema = z.record(
  domainSchema,
  z.object({
    score: z.number().min(0).max(1),
    attempts: z.number().int().min(0),
    correct: z.number().int().min(0),
  })
);
export type CapabilityMatrix = z.infer<typeof capabilityMatrixSchema>;

// ---------- Lesson adaptation ----------
export const adaptationSchema = z.object({
  rewrittenContent: z.string(),
  style: styleSchema,
  tier: tierSchema,
  objectivesCovered: z.array(z.string()),
});
export type Adaptation = z.infer<typeof adaptationSchema>;

// ---------- Code evaluation ----------
export const evaluationSchema = z.object({
  correct: z.boolean(),
  scores: z.object({
    correctness: z.number().min(0).max(100),
    style: z.number().min(0).max(100),
    edgeCases: z.number().min(0).max(100),
    optimization: z.number().min(0).max(100),
  }),
  summary: z.string(),
  tieredGuidance: z.array(z.string()),
  improvements: z.array(z.string()),
  matrixDeltas: z.array(
    z.object({
      domain: domainSchema,
      delta: z.number().min(-1).max(1),
    })
  ),
});
export type Evaluation = z.infer<typeof evaluationSchema>;

// ---------- Request bodies ----------
export const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const diagnosticAnswerSchema = z.object({
  selectedIndex: z.number().int().min(0),
});

export const submitCodeSchema = z.object({
  exerciseId: z.string().min(1),
  code: z.string().min(1).max(50000),
  language: z.string().min(1).max(30).default("javascript"),
});

// ---------- Chatbot ----------
export const chatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
});

export const chatReplySchema = z.object({
  reply: z.string(),
  domain: z.string().optional(),
});
export type ChatReply = z.infer<typeof chatReplySchema>;

// ---------- Career Autopilot™ (JD gap analysis) ----------
export const autopilotSkillSchema = z.object({
  name: z.string().min(1).max(80),
  importance: z.number().int().min(1).max(5),
  area: z.string().min(1).max(60),
  coreDomain: domainSchema.optional(),
});
export type AutopilotSkill = z.infer<typeof autopilotSkillSchema>;

export const autopilotAnalysisSchema = z.object({
  role: z.string().min(1).max(120),
  skills: z.array(autopilotSkillSchema).min(1).max(20),
  summary: z.string().max(400),
});
export type AutopilotAnalysis = z.infer<typeof autopilotAnalysisSchema>;

export const autopilotRequestSchema = z.object({
  jobDescription: z.string().min(60).max(8000),
  targetRole: z.string().max(120).optional(),
});

// ---------- System Design Dojo™ (interview-grade design critique) ----------
export const dojoCritiqueRequestSchema = z.object({
  challengeId: z.string().min(1).max(60),
  notes: z.string().min(80).max(6000),
});

export const dojoCritiqueSchema = z.object({
  scores: z.object({
    requirements: z.number().min(1).max(5),
    estimation: z.number().min(1).max(5),
    dataModeling: z.number().min(1).max(5),
    scalability: z.number().min(1).max(5),
  }),
  verdict: z.string().max(300),
  strengths: z.array(z.string()).min(1).max(3),
  gaps: z.array(z.string()).min(1).max(3),
  nextSteps: z.array(z.string()).min(1).max(3),
});
export type DojoCritique = z.infer<typeof dojoCritiqueSchema>;

// ---------- Freelance Launchpad™ (matrix-driven gig profile) ----------
export const freelanceGigSchema = z.object({
  title: z.string().min(1).max(120),
  pitch: z.string().max(280),
  priceBand: z.string().max(60),
});
export type FreelanceGig = z.infer<typeof freelanceGigSchema>;

export const freelanceProfileSchema = z.object({
  headline: z.string().min(1).max(160),
  niche: z.string().min(1).max(120),
  skills: z.array(z.string().min(1).max(40)).min(3).max(8),
  positioning: z.string().max(400),
  gigs: z.array(freelanceGigSchema).min(2).max(3),
  hourlyRateUsd: z.number().min(3).max(250),
});
export type FreelanceProfile = z.infer<typeof freelanceProfileSchema>;

export const freelanceRequestSchema = z.object({
  focus: z.string().max(160).optional(),
});
