import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  Rocket,
  Lock,
  Briefcase,
  Target,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  RefreshCcw,
  CalendarRange,
  Sparkles,
  Eye,
  Route,
  ClipboardList,
  ArrowRight,
  ExternalLink,
  Clock,
  Timer,
  MessageSquareQuote,
  Video,
} from "lucide-react";
import api, { apiErrorMessage } from "../../lib/api";
import { useAuthStore } from "../../stores/auth";
import { prefersReducedMotion, useReducedMotion } from "../../lib/anim";
import Reveal from "../../components/Reveal";
import PageHero from "../../components/PageHero";
import ErrorBanner from "../../components/ErrorBanner";
import EmptyState from "../../components/EmptyState";

let reduce = prefersReducedMotion();

type SkillStatus = "strong" | "developing" | "gap" | "unmeasured";
type RequirementTier = "primary" | "secondary";
type SkillKind = "technical" | "soft";

interface GapSkill {
  name: string;
  area: string;
  importance: number;
  tier: RequirementTier;
  kind: SkillKind;
  status: SkillStatus;
  score: number | null;
}

/** Weighted skill-match percentages, 0-100. */
interface FitBreakdown {
  overall: number;
  primary: number;
  secondary: number;
  technical: number;
  soft: number;
}

interface RecruiterLens {
  firstImpression: string;
  screenOutRisk: string;
  singleFix: string;
}

interface GapReport {
  role: string;
  summary: string;
  readiness: number;
  fit: FitBreakdown;
  skills: GapSkill[];
  counts: Record<SkillStatus, number>;
  kindCounts: Record<SkillKind, Record<SkillStatus, number>>;
  missing: Record<SkillKind, string[]>;
  recruiterLens: RecruiterLens;
}

interface PlanWeek {
  week: number;
  focus: string[];
  objective: string;
}

interface PlanPhase {
  name: string;
  days: string;
  goal: string;
  weeks: PlanWeek[];
  milestone: string;
}

interface PathResource {
  title: string;
  kind: "platform" | "external";
  url: string;
  note: string;
  hours: number;
}

interface PathStep {
  order: number;
  skill: string;
  area: string;
  kind: SkillKind;
  tier: RequirementTier;
  status: SkillStatus;
  objective: string;
  hours: number;
  resources: PathResource[];
  doneWhen: string;
}

interface ReadinessEta {
  weeklyHours: number;
  totalHours: number;
  weeks: number;
  readyDate: string;
  label: string;
  confidence: "low" | "medium" | "high";
  assumptions: string[];
}

interface LearningPath {
  steps: PathStep[];
  totalHours: number;
  eta: ReadinessEta;
}

interface AutopilotResponse {
  source: "ai" | "mock";
  generatedAt: string;
  report: GapReport;
  plan: { phases: PlanPhase[]; dailyRhythm: string[] };
  path: LearningPath;
}

interface StoredAutopilot extends AutopilotResponse {
  hasAssessment: boolean;
}

interface AssessmentItem {
  skill: string;
  type: "quiz" | "coding" | "interview";
  prompt: string;
  options?: string[];
  correctIndex?: number;
  rationale?: string;
  rubric?: string[];
  minutes: number;
}

interface AssessmentResponse {
  source: "ai" | "mock";
  generatedAt: string;
  suite: { title: string; focusSummary: string; items: AssessmentItem[] };
  minutes: number;
}

const FIT_ROWS: Array<{ key: keyof FitBreakdown; label: string; hint: string }> = [
  { key: "primary", label: "Must-haves", hint: "Weighted double — these decide the screen" },
  { key: "secondary", label: "Nice-to-haves", hint: "Weighted single — they break ties" },
  { key: "technical", label: "Technical", hint: "Measurable against your matrix" },
  { key: "soft", label: "Soft skills", hint: "Proved by rehearsal, not by score" },
];

function LockedState() {
  return (
    <div className="card text-center max-w-xl mx-auto border-black/30 dark:border-white/30 relative overflow-hidden my-8">
      <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 dark:bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="w-16 h-16 mx-auto rounded-3xl bg-black/5 dark:bg-white/5 border border-black/30 dark:border-white/30 text-neutral-700 dark:text-neutral-300 flex items-center justify-center mb-4">
        <Lock size={28} strokeWidth={1.8} />
      </div>
      <h2 className="text-2xl font-black text-black dark:text-white mb-2">Career Autopilot™ is an Adaptive+ Feature</h2>
      <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed mb-6 max-w-md mx-auto">
        Paste any job description. Autopilot scores your match against it, names every missing skill,
        builds the assessment that proves the gaps, and plans the exact hours to close them.
      </p>
      <Link to="/premium" className="btn-amber text-xs font-extrabold px-8 inline-flex items-center gap-1.5">
        Unlock Career Autopilot with Adaptive+
      </Link>
    </div>
  );
}

function StatusChip({ status }: { status: SkillStatus }) {
  // Distinct hues per status, not just gray weight — a flat monochrome scale
  // is hard to tell apart at a glance for colorblind/low-vision users.
  const map: Record<SkillStatus, { label: string; cls: string; Icon: typeof CheckCircle2 }> = {
    strong: { label: "Strong", cls: "bg-success/10 text-success border-success/40", Icon: CheckCircle2 },
    developing: { label: "Developing", cls: "bg-warning/10 text-warning border-warning/40", Icon: Target },
    gap: { label: "Gap", cls: "bg-danger/10 text-danger border-danger/40", Icon: AlertTriangle },
    unmeasured: { label: "Unmeasured", cls: "bg-transparent text-neutral-600 dark:text-neutral-400 border-neutral-400 dark:border-neutral-600 border-dashed", Icon: HelpCircle },
  };
  const { label, cls, Icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${cls}`}>
      <Icon size={11} strokeWidth={2.4} />
      {label}
    </span>
  );
}

function TierChip({ tier }: { tier: RequirementTier }) {
  const primary = tier === "primary";
  return (
    <span
      className={`px-1.5 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-widest ${
        primary
          ? "border-black dark:border-white text-black dark:text-white"
          : "border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400"
      }`}
      title={primary ? "Must-have requirement — costs double when missing" : "Nice-to-have requirement"}
    >
      {primary ? "Must" : "Nice"}
    </span>
  );
}

function ImportanceDots({ level }: { level: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" title={`Importance ${level}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${i < level ? "bg-black dark:bg-white" : "bg-neutral-300 dark:bg-neutral-700"}`}
        />
      ))}
    </span>
  );
}

function MatchRing({ value }: { value: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="8" className="stroke-neutral-200 dark:stroke-neutral-800" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className="stroke-black dark:stroke-white"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-black dark:text-white">{value}%</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Match</span>
      </div>
    </div>
  );
}

function FitBar({ label, hint, value }: { label: string; hint: string; value: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-[11px] font-bold text-black dark:text-white">{label}</span>
        <span className="text-[11px] font-black text-black dark:text-white tabular-nums">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-black dark:bg-white"
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
      <p className="text-[10px] text-neutral-500 dark:text-neutral-500 mt-1 leading-snug">{hint}</p>
    </div>
  );
}

/** Platform resources route inside the SPA; external ones open a new tab. */
function ResourceLink({ resource }: { resource: PathResource }) {
  const cls =
    "group flex items-start gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 px-2.5 py-2 hover:border-black dark:hover:border-white transition-colors";
  const Icon = resource.kind === "platform" ? ArrowRight : ExternalLink;
  const body = (
    <>
      <Icon size={12} strokeWidth={2.4} className="mt-0.5 shrink-0 text-neutral-500 group-hover:text-black dark:group-hover:text-white" />
      <span className="min-w-0">
        <span className="block text-[11px] font-bold text-black dark:text-white truncate">{resource.title}</span>
        <span className="block text-[10px] text-neutral-500 dark:text-neutral-400 leading-snug">
          {resource.note} · {resource.hours}h
        </span>
      </span>
    </>
  );
  return resource.kind === "platform" ? (
    <Link to={resource.url} className={cls}>{body}</Link>
  ) : (
    <a href={resource.url} target="_blank" rel="noreferrer" className={cls}>{body}</a>
  );
}

function MissingTile({ kind, skills }: { kind: SkillKind; skills: string[] }) {
  const technical = kind === "technical";
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-black uppercase tracking-wider text-black dark:text-white">
          Missing {technical ? "technical" : "soft"} skills
        </h4>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black dark:bg-white text-white dark:text-black tabular-nums">
          {skills.length}
        </span>
      </div>
      {skills.length === 0 ? (
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
          Nothing missing on this axis — the posting asks for {technical ? "craft" : "communication"} you already show.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {skills.map((s) => (
            <li key={s} className="flex items-start gap-2 text-[11px] text-neutral-700 dark:text-neutral-300 leading-snug">
              <AlertTriangle size={12} strokeWidth={2.2} className="mt-0.5 shrink-0 text-neutral-500" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AssessmentCard({ item }: { item: AssessmentItem }) {
  const typeLabel = item.type === "quiz" ? "Quiz" : item.type === "coding" ? "Build" : "Interview";
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-xs font-black text-black dark:text-white truncate">{item.skill}</h4>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{typeLabel}</span>
        </div>
        <span className="inline-flex items-center gap-1 shrink-0 text-[10px] font-bold text-neutral-600 dark:text-neutral-400">
          <Timer size={11} strokeWidth={2.4} />
          {item.minutes} min
        </span>
      </div>

      <p className="text-[11px] text-neutral-700 dark:text-neutral-300 leading-relaxed">{item.prompt}</p>

      {item.type === "quiz" && item.options ? (
        <ol className="space-y-1.5">
          {item.options.map((option, i) => (
            <li
              key={i}
              className={`text-[11px] rounded-lg border px-2.5 py-1.5 leading-snug ${
                i === item.correctIndex
                  ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold"
                  : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
              }`}
            >
              {String.fromCharCode(65 + i)}. {option}
            </li>
          ))}
        </ol>
      ) : (
        <ul className="space-y-1.5">
          {(item.rubric ?? []).map((criterion) => (
            <li key={criterion} className="flex items-start gap-2 text-[11px] text-neutral-600 dark:text-neutral-400 leading-snug">
              <CheckCircle2 size={12} strokeWidth={2.2} className="mt-0.5 shrink-0" />
              <span>{criterion}</span>
            </li>
          ))}
        </ul>
      )}

      {(item.rationale || (item.type === "quiz" && item.rubric)) && (
        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed pt-2 border-t border-neutral-200 dark:border-neutral-800">
          {item.rationale}
        </p>
      )}
    </div>
  );
}

export default function Autopilot() {
  reduce = useReducedMotion();
  const user = useAuthStore((s) => s.user);
  const isPremium = user?.plan === "premium";
  const queryClient = useQueryClient();

  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [weeklyHours, setWeeklyHours] = useState(10);

  const { data: existing } = useQuery({
    queryKey: ["autopilot"],
    queryFn: async () => (await api.get<StoredAutopilot>("/premium/autopilot")).data,
    enabled: isPremium,
    retry: false,
  });

  const buildAssessment = useMutation({
    mutationFn: async () =>
      (await api.post<AssessmentResponse>("/premium/autopilot/assessment", { maxItems: 8 })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["autopilot"] }),
  });

  const generate = useMutation({
    mutationFn: async () =>
      (
        await api.post<AutopilotResponse>("/premium/autopilot", {
          jobDescription,
          targetRole: targetRole || undefined,
          weeklyHours,
        })
      ).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["autopilot"] });
      // Probes aimed at the previous gaps no longer describe this role.
      queryClient.removeQueries({ queryKey: ["autopilot-assessment"] });
      buildAssessment.reset();
    },
  });

  const hasAssessment = existing?.hasAssessment ?? false;
  const { data: storedAssessment } = useQuery({
    queryKey: ["autopilot-assessment"],
    queryFn: async () => (await api.get<AssessmentResponse>("/premium/autopilot/assessment")).data,
    enabled: isPremium && hasAssessment && !buildAssessment.data,
    retry: false,
  });

  const data = generate.data ?? existing;
  const assessment = buildAssessment.data ?? storedAssessment;

  if (!isPremium) {
    return (
      <div className="max-w-6xl mx-auto">
        <LockedState />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <Reveal>
        <PageHero
          icon={<Rocket size={13} strokeWidth={2.2} />}
          eyebrow="Career Autopilot™ — Adaptive+ Exclusive"
          title="Paste a Job Description. Get Hire-Ready in 90 Days."
          description="Autopilot extracts the required skills, scores your match against the must-haves and nice-to-haves separately, tells you how a recruiter reads the profile in the first pass, then plans the exact hours that close the gap."
          actions={
            <>
              <Link
                to="/interview"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-[11px] font-bold text-neutral-700 dark:text-neutral-300 hover:border-black dark:hover:border-white transition-colors"
              >
                <Video size={12} strokeWidth={2.4} />
                Rehearse the interview
              </Link>
              <Link
                to="/pipeline"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-[11px] font-bold text-neutral-700 dark:text-neutral-300 hover:border-black dark:hover:border-white transition-colors"
              >
                <ClipboardList size={12} strokeWidth={2.4} />
                Track applications
              </Link>
            </>
          }
        />
      </Reveal>

      {/* Input */}
      <Reveal delay={reduce ? 0 : 0.08}>
        <div className="card !p-6 border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase size={16} strokeWidth={2.2} className="text-neutral-700 dark:text-neutral-300" />
            <h2 className="font-bold text-black dark:text-white">Analyze a target role</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1 space-y-4">
              <div>
                <label className="label">Target role (optional)</label>
                <input
                  className="input"
                  placeholder="e.g. Frontend Engineer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="weekly-hours">
                  Hours per week: <span className="font-black text-black dark:text-white tabular-nums">{weeklyHours}</span>
                </label>
                <input
                  id="weekly-hours"
                  type="range"
                  min={1}
                  max={40}
                  step={1}
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="w-full accent-black dark:accent-white"
                />
                <p className="text-[10px] text-neutral-500 mt-1 leading-snug">
                  Drives your Time-to-Ready ETA. Be honest — the plan is only as real as this number.
                </p>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Job description</label>
              <textarea
                className="input min-h-[160px] resize-y"
                placeholder="Paste the full job posting here (responsibilities, requirements, tech stack)…"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                {jobDescription.length}/8000 characters — minimum 60 for a reliable analysis.
              </p>
            </div>
          </div>
          {generate.error && <ErrorBanner message={apiErrorMessage(generate.error)} className="mt-4" />}
          <button
            className="btn-primary mt-4 inline-flex items-center gap-2"
            disabled={generate.isPending || jobDescription.trim().length < 60}
            onClick={() => generate.mutate()}
          >
            {generate.isPending ? (
              <>
                <RefreshCcw size={14} strokeWidth={2.2} className="animate-spin" />
                Analyzing JD…
              </>
            ) : (
              <>
                <Sparkles size={14} strokeWidth={2.2} />
                Generate match + 90-day plan
              </>
            )}
          </button>
        </div>
      </Reveal>

      {data && (
        <>
          {/* Skill match + fit breakdown */}
          <Reveal delay={reduce ? 0 : 0.12}>
            <div className="grid lg:grid-cols-3 gap-5">
              <div className="card !p-6 border-neutral-200 dark:border-neutral-800 text-center">
                <MatchRing value={data.report.fit.overall} />
                <h3 className="font-bold text-black dark:text-white mt-3">{data.report.role}</h3>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">{data.report.summary}</p>
                <span className="inline-flex items-center gap-1 mt-3 px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  {data.source === "ai" ? "Gemini-analyzed" : "Deterministic analyzer"}
                </span>
              </div>

              <div className="card !p-6 border-neutral-200 dark:border-neutral-800">
                <h3 className="font-bold text-black dark:text-white mb-4">Skill match breakdown</h3>
                <div className="space-y-4">
                  {FIT_ROWS.map((row) => (
                    <FitBar key={row.key} label={row.label} hint={row.hint} value={data.report.fit[row.key]} />
                  ))}
                </div>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-4 leading-relaxed pt-3 border-t border-neutral-200 dark:border-neutral-800">
                  Must-haves count double. Skills with no matrix signal earn 35% partial credit — you may
                  already know them, you have just never been measured.
                </p>
              </div>

              {/* Recruiter Lens™ */}
              <div className="card !p-6 !bg-black dark:!bg-white !text-white dark:!text-black !border-black dark:!border-white">
                <div className="flex items-center gap-2 mb-3">
                  <Eye size={15} strokeWidth={2.2} />
                  <h3 className="font-bold text-sm">Recruiter Lens™</h3>
                </div>
                <p className="text-[10px] uppercase tracking-widest font-black opacity-60 mb-1">First impression</p>
                <p className="text-[11px] leading-relaxed mb-3">{data.report.recruiterLens.firstImpression}</p>
                <p className="text-[10px] uppercase tracking-widest font-black opacity-60 mb-1">Screen-out risk</p>
                <p className="text-[11px] leading-relaxed mb-3">{data.report.recruiterLens.screenOutRisk}</p>
                <p className="text-[10px] uppercase tracking-widest font-black opacity-60 mb-1">The single fix</p>
                <p className="text-[11px] leading-relaxed font-semibold">{data.report.recruiterLens.singleFix}</p>
              </div>
            </div>
          </Reveal>

          {/* Gap analysis */}
          <Reveal delay={reduce ? 0 : 0.16}>
            <div className="card !p-6 border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-black dark:text-white">Gap analysis</h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  {data.report.skills.length} requirements detected
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-4">
                {(["strong", "developing", "gap", "unmeasured"] as SkillStatus[]).map((s) => (
                  <div key={s} className="rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-2.5">
                    <div className="text-xl font-black text-black dark:text-white tabular-nums">{data.report.counts[s]}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">{s}</div>
                  </div>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <MissingTile kind="technical" skills={data.report.missing.technical} />
                <MissingTile kind="soft" skills={data.report.missing.soft} />
              </div>
              <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {data.report.skills.map((s) => (
                  <li
                    key={s.name}
                    className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-black dark:text-white truncate">{s.name}</span>
                        <TierChip tier={s.tier} />
                      </div>
                      <div className="text-[10px] text-neutral-600 dark:text-neutral-400">
                        {s.area} · {s.kind}
                        {s.score !== null ? ` · ${Math.round(s.score * 100)}% mastery` : " · no matrix signal yet"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <ImportanceDots level={s.importance} />
                      <StatusChip status={s.status} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Customized Learning Path + Time-to-Ready ETA */}
          <Reveal delay={reduce ? 0 : 0.2}>
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Route size={16} strokeWidth={2.2} className="text-neutral-700 dark:text-neutral-300" />
                  <h2 className="font-bold text-black dark:text-white">Your learning path</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-[11px] font-black">
                    <Clock size={12} strokeWidth={2.4} />
                    {data.path.eta.label}
                  </span>
                  <span className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
                    {data.path.eta.confidence} confidence
                  </span>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Total effort", value: `${data.path.totalHours}h` },
                  { label: "Per week", value: `${data.path.eta.weeklyHours}h` },
                  { label: "Ready by", value: new Date(data.path.eta.readyDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-4 text-center">
                    <div className="text-2xl font-black text-black dark:text-white tabular-nums">{stat.value}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mt-0.5">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {data.path.steps.map((step) => (
                  <motion.div
                    key={step.order}
                    whileHover={reduce ? {} : { y: -2 }}
                    className="card !p-5 border-neutral-200 dark:border-neutral-800"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="shrink-0 w-8 h-8 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-black tabular-nums">
                          {step.order}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold text-black dark:text-white">{step.skill}</h3>
                            <TierChip tier={step.tier} />
                            <StatusChip status={step.status} />
                          </div>
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mt-0.5">
                            {step.area} · {step.kind}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-neutral-600 dark:text-neutral-400">
                        <Clock size={12} strokeWidth={2.4} />
                        {step.hours}h
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-700 dark:text-neutral-300 leading-relaxed mb-3">{step.objective}</p>

                    <div className="grid sm:grid-cols-2 gap-2 mb-3">
                      {step.resources.map((resource) => (
                        <ResourceLink key={resource.url + resource.title} resource={resource} />
                      ))}
                    </div>

                    <p className="text-[10px] text-neutral-600 dark:text-neutral-400 leading-relaxed pt-2.5 border-t border-neutral-200 dark:border-neutral-800">
                      <strong className="font-black uppercase tracking-wider text-black dark:text-white">Done when: </strong>
                      {step.doneWhen}
                    </p>
                  </motion.div>
                ))}
              </div>

              <ul className="mt-4 space-y-1.5">
                {data.path.eta.assumptions.map((assumption) => (
                  <li key={assumption} className="flex items-start gap-2 text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    <HelpCircle size={11} strokeWidth={2.4} className="mt-0.5 shrink-0" />
                    <span>{assumption}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Automated Assessment Generator */}
          <Reveal delay={reduce ? 0 : 0.24}>
            <div className="card !p-6 border-neutral-200 dark:border-neutral-800">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <ClipboardList size={16} strokeWidth={2.2} className="text-neutral-700 dark:text-neutral-300" />
                  <h2 className="font-bold text-black dark:text-white">Automated Assessment Generator™</h2>
                </div>
                <button
                  className="btn-secondary !py-2 !px-4 text-xs inline-flex items-center gap-2"
                  disabled={buildAssessment.isPending}
                  onClick={() => buildAssessment.mutate()}
                >
                  {buildAssessment.isPending ? (
                    <>
                      <RefreshCcw size={13} strokeWidth={2.2} className="animate-spin" />
                      Building probes…
                    </>
                  ) : (
                    <>
                      <Target size={13} strokeWidth={2.4} />
                      {assessment ? "Regenerate assessment" : "Generate assessment"}
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                One probe per weak requirement — a quiz where an answer is objectively right, a build where
                you ship something, or a structured interview question with a rubric. Scoring this suite
                scores the gaps, not your general knowledge.
              </p>

              {buildAssessment.error && (
                <ErrorBanner message={apiErrorMessage(buildAssessment.error)} className="mb-4" />
              )}

              {assessment ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="min-w-0">
                      <h3 className="text-sm font-black text-black dark:text-white">{assessment.suite.title}</h3>
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed mt-0.5">
                        {assessment.suite.focusSummary}
                      </p>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-[11px] font-black">
                      <Timer size={12} strokeWidth={2.4} />
                      {assessment.minutes} min total
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {assessment.suite.items.map((item) => (
                      <AssessmentCard key={item.skill} item={item} />
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState
                  className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center"
                  icon={<MessageSquareQuote size={22} strokeWidth={1.8} />}
                  title="No assessment yet"
                  description="Generate one to turn this gap report into something you can actually sit and answer."
                />
              )}
            </div>
          </Reveal>

          {/* 90-day plan */}
          <Reveal delay={reduce ? 0 : 0.28}>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CalendarRange size={16} strokeWidth={2.2} className="text-neutral-700 dark:text-neutral-300" />
                <h2 className="font-bold text-black dark:text-white">Your 90-day plan</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-5">
                {data.plan.phases.map((p, i) => (
                  <motion.div
                    key={p.name}
                    whileHover={reduce ? {} : { y: -4 }}
                    className="card !p-5 border-neutral-200 dark:border-neutral-800 flex flex-col gap-3 h-full"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">{p.days}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black dark:bg-white text-white dark:text-black">
                        Phase {i + 1}
                      </span>
                    </div>
                    <h3 className="font-bold text-black dark:text-white -mt-1">{p.name}</h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{p.goal}</p>
                    <ul className="space-y-2.5 flex-1">
                      {p.weeks.map((w) => (
                        <li key={w.week} className="rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-2.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Week {w.week}</span>
                            <span className="text-[10px] font-semibold text-neutral-700 dark:text-neutral-300 truncate max-w-[65%]">
                              {w.focus.join(" + ")}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">{w.objective}</p>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                      Milestone: {p.milestone}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Daily rhythm */}
          <Reveal delay={reduce ? 0 : 0.32}>
            <div className="card !p-5 !bg-black dark:!bg-white !text-white dark:!text-black !border-black dark:!border-white">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
                Daily rhythm — 50 focused minutes
              </span>
              <ul className="mt-2 grid sm:grid-cols-3 gap-3 text-xs">
                {data.plan.dailyRhythm.map((step) => (
                  <li key={step} className="flex items-start gap-2">
                    <CheckCircle2 size={14} strokeWidth={2.2} className="mt-0.5 shrink-0" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </>
      )}
    </div>
  );
}
