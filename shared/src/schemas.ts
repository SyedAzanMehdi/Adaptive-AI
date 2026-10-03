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

// ---------- Password policy ----------
// Single source of truth for both the server-side Zod check and the client's
// live "your password must contain..." checklist, so the two can never drift.
export const PASSWORD_REQUIREMENTS = [
  { id: "length", label: "At least 12 characters", test: (p: string) => p.length >= 12 },
  { id: "lower", label: "Lower case letters (a-z)", test: (p: string) => /[a-z]/.test(p) },
  { id: "upper", label: "Upper case letters (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { id: "number", label: "Numbers (0-9)", test: (p: string) => /[0-9]/.test(p) },
] as const;

export function passwordMeetsPolicy(password: string): boolean {
  return PASSWORD_REQUIREMENTS.every((r) => r.test(password));
}

export const passwordSchema = z
  .string()
  .max(128)
  .refine(passwordMeetsPolicy, {
    message: "Password must be at least 12 characters and include lower case, upper case, and numbers",
  });

// ---------- Request bodies ----------
export const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: passwordSchema,
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
// `tier` separates a JD's must-haves from its nice-to-haves; the weighted fit
// score counts primary requirements more heavily. Optional because the
// deterministic analyzer derives it from importance when Gemini omits it.
export const requirementTierSchema = z.enum(["primary", "secondary"]);
export type RequirementTier = z.infer<typeof requirementTierSchema>;

export const skillKindSchema = z.enum(["technical", "soft"]);
export type SkillKind = z.infer<typeof skillKindSchema>;

export const autopilotSkillSchema = z.object({
  name: z.string().min(1).max(80),
  importance: z.number().int().min(1).max(5),
  area: z.string().min(1).max(60),
  tier: requirementTierSchema.optional(),
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
  weeklyHours: z.number().int().min(1).max(80).optional(),
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

// ---------- Automated Assessment Generator™ (gap-targeted probes) ----------
// Each item targets one weak skill from the gap report. `quiz` items carry
// options + correctIndex, `coding` and `interview` items carry a rubric the
// student self-checks against — so the optional fields are mutually exclusive
// by `type`, enforced in the service rather than by the schema.
export const assessmentTypeSchema = z.enum(["quiz", "coding", "interview"]);
export type AssessmentType = z.infer<typeof assessmentTypeSchema>;

export const assessmentItemSchema = z.object({
  skill: z.string().min(1).max(80),
  type: assessmentTypeSchema,
  prompt: z.string().min(10).max(600),
  options: z.array(z.string().min(1).max(160)).min(2).max(5).optional(),
  correctIndex: z.number().int().min(0).max(4).optional(),
  rationale: z.string().max(300).optional(),
  rubric: z.array(z.string().min(1).max(200)).min(1).max(4).optional(),
  minutes: z.number().int().min(2).max(60),
});
export type AssessmentItem = z.infer<typeof assessmentItemSchema>;

export const assessmentSuiteSchema = z.object({
  title: z.string().min(1).max(140),
  focusSummary: z.string().min(1).max(300),
  items: z.array(assessmentItemSchema).min(3).max(12),
});
export type AssessmentSuite = z.infer<typeof assessmentSuiteSchema>;

export const assessmentRequestSchema = z.object({
  maxItems: z.number().int().min(3).max(12).optional(),
});

// ---------- Interview Rehearsal Studio™ (role-specific mock loop) ----------
export const interviewRoundKindSchema = z.enum([
  "screening",
  "technical",
  "system_design",
  "behavioral",
]);
export type InterviewRoundKind = z.infer<typeof interviewRoundKindSchema>;

export const interviewQuestionSchema = z.object({
  prompt: z.string().min(10).max(400),
  skill: z.string().min(1).max(80),
  probes: z.array(z.string().min(1).max(160)).min(1).max(3),
  goodAnswerSignals: z.array(z.string().min(1).max(160)).min(1).max(4),
});
export type InterviewQuestion = z.infer<typeof interviewQuestionSchema>;

export const interviewRoundSchema = z.object({
  round: interviewRoundKindSchema,
  minutes: z.number().int().min(5).max(90),
  questions: z.array(interviewQuestionSchema).min(2).max(4),
});
export type InterviewRound = z.infer<typeof interviewRoundSchema>;

export const interviewScriptSchema = z.object({
  role: z.string().min(1).max(120),
  rounds: z.array(interviewRoundSchema).min(2).max(4),
  closingAdvice: z.string().min(1).max(300),
});
export type InterviewScript = z.infer<typeof interviewScriptSchema>;

export const interviewScriptRequestSchema = z.object({
  role: z.string().max(120).optional(),
});

export const interviewScoreEntrySchema = z.object({
  prompt: z.string().min(1).max(400),
  round: interviewRoundKindSchema,
  selfScore: z.number().int().min(1).max(5),
  note: z.string().max(400).optional(),
});

export const interviewScorecardRequestSchema = z.object({
  sessionId: z.string().min(1).max(60),
  entries: z.array(interviewScoreEntrySchema).min(1).max(24),
});

// ---------- Application Pipeline™ (job-search tracker) ----------
export const APPLICATION_STAGES = [
  "saved",
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
] as const;
export const applicationStageSchema = z.enum(APPLICATION_STAGES);
export type ApplicationStage = z.infer<typeof applicationStageSchema>;

// Scheme-restricted on purpose: this value is rendered as an anchor `href` in
// the client, and a generic URL validator happily accepts `javascript:`.
export const httpUrlSchema = z
  .string()
  .max(500)
  .refine((v) => /^https?:\/\/[^\s]+$/i.test(v), "URL must start with http:// or https://");

// Stored as a Date in Mongo, so reject anything `Date.parse` cannot read
// rather than persisting an Invalid Date that sorts unpredictably.
const dateStringSchema = z
  .string()
  .max(40)
  .refine((v) => !Number.isNaN(Date.parse(v)), "Must be a valid date");

export const applicationRequestSchema = z.object({
  company: z.string().min(1).max(120),
  role: z.string().min(1).max(120),
  stage: applicationStageSchema.default("saved"),
  location: z.string().max(120).optional(),
  url: httpUrlSchema.optional(),
  salaryBand: z.string().max(80).optional(),
  nextActionAt: dateStringSchema.optional(),
  notes: z.string().max(2000).optional(),
});

export const applicationUpdateSchema = applicationRequestSchema.partial();

// ---------- Software House Directory ----------
export const softwareHouseRegionSchema = z.enum(["pakistan", "international"]);
export type SoftwareHouseRegion = z.infer<typeof softwareHouseRegionSchema>;

export const softwareHouseRequestSchema = z.object({
  name: z.string().min(1).max(140),
  website: httpUrlSchema.optional(),
  region: softwareHouseRegionSchema,
  country: z.string().min(1).max(80),
  city: z.string().max(80).optional(),
  description: z.string().max(600).optional(),
  hiringFocus: z.array(z.string().min(1).max(40)).max(10).default([]),
});
export type SoftwareHouseRequest = z.infer<typeof softwareHouseRequestSchema>;

export const softwareHouseAdminUpdateSchema = softwareHouseRequestSchema.partial().extend({
  approved: z.boolean().optional(),
});

// ---------- Field Recommendation (capability-matrix -> career field) ----------
export const fieldRecommendationSchema = z.object({
  recommendedField: z.string().min(1).max(120),
  mapsToDomain: domainSchema,
  confidence: z.number().min(0).max(1),
  rationale: z.string().min(1).max(500),
  steps: z.array(z.string().min(1).max(200)).min(3).max(10),
  alternativeFields: z
    .array(z.object({ name: z.string().min(1).max(120), reason: z.string().min(1).max(200) }))
    .max(4),
});
export type FieldRecommendation = z.infer<typeof fieldRecommendationSchema>;
