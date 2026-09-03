import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
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
} from "lucide-react";
import api, { apiErrorMessage } from "../../lib/api";
import { useAuthStore } from "../../stores/auth";
import { prefersReducedMotion } from "../../lib/anim";
import Reveal from "../../components/Reveal";

const reduce = prefersReducedMotion();

type SkillStatus = "strong" | "developing" | "gap" | "unmeasured";

interface GapSkill {
  name: string;
  area: string;
  importance: number;
  status: SkillStatus;
  score: number | null;
}

interface GapReport {
  role: string;
  summary: string;
  readiness: number;
  skills: GapSkill[];
  counts: Record<SkillStatus, number>;
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

interface AutopilotResponse {
  source: "ai" | "mock";
  generatedAt: string;
  report: GapReport;
  plan: { phases: PlanPhase[]; dailyRhythm: string[] };
}

function LockedState() {
  return (
    <div className="card text-center max-w-xl mx-auto border-black/30 dark:border-white/30 relative overflow-hidden my-8">
      <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 dark:bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="w-16 h-16 mx-auto rounded-3xl bg-black/5 dark:bg-white/5 border border-black/30 dark:border-white/30 text-neutral-700 dark:text-neutral-300 flex items-center justify-center mb-4">
        <Lock size={28} strokeWidth={1.8} />
      </div>
      <h2 className="text-2xl font-black text-black dark:text-white mb-2">Career Autopilot™ is an Adaptive+ Feature</h2>
      <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed mb-6 max-w-md mx-auto">
        Paste any job description. Autopilot diffs it against your live Capability Matrix and builds a 90-day, day-by-day plan to make you hire-ready.
      </p>
      <Link to="/premium" className="btn-amber text-xs font-extrabold px-8 inline-flex items-center gap-1.5">
        Unlock Career Autopilot with Adaptive+
      </Link>
    </div>
  );
}

function StatusChip({ status }: { status: SkillStatus }) {
  const map: Record<SkillStatus, { label: string; cls: string; Icon: typeof CheckCircle2 }> = {
    strong: { label: "Strong", cls: "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white", Icon: CheckCircle2 },
    developing: { label: "Developing", cls: "bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700", Icon: Target },
    gap: { label: "Gap", cls: "bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-400 dark:border-neutral-600", Icon: AlertTriangle },
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

function ReadinessRing({ value }: { value: number }) {
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
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Hire-ready</span>
      </div>
    </div>
  );
}

export default function Autopilot() {
  const user = useAuthStore((s) => s.user);
  const isPremium = user?.plan === "premium";

  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState("");

  const { data: existing } = useQuery({
    queryKey: ["autopilot"],
    queryFn: async () => (await api.get<AutopilotResponse>("/premium/autopilot")).data,
    enabled: isPremium,
    retry: false,
  });

  const generate = useMutation({
    mutationFn: async () =>
      (await api.post<AutopilotResponse>("/premium/autopilot", { jobDescription, targetRole: targetRole || undefined })).data,
  });

  const data = generate.data ?? existing;

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
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-white dark:from-black via-neutral-100 dark:via-neutral-900 to-white dark:to-black border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-black/5 dark:bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-800 dark:text-neutral-200 text-xs font-semibold mb-3">
              <Rocket size={13} strokeWidth={2.2} />
              Career Autopilot™ — Adaptive+ Exclusive
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-black dark:text-white tracking-tight">
              Paste a Job Description. Get Hire-Ready in 90 Days.
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              Autopilot extracts the required skills, diffs them against your live Capability Matrix,
              and generates a phased 90-day plan that closes your biggest gaps first.
            </p>
          </div>
        </div>
      </Reveal>

      {/* Input */}
      <Reveal delay={reduce ? 0 : 0.08}>
        <div className="card !p-6 border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase size={16} strokeWidth={2.2} className="text-neutral-700 dark:text-neutral-300" />
            <h2 className="font-bold text-black dark:text-white">Analyze a target role</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="label">Target role (optional)</label>
              <input
                className="input"
                placeholder="e.g. Frontend Engineer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Job description</label>
              <textarea
                className="input min-h-[120px] resize-y"
                placeholder="Paste the full job posting here (responsibilities, requirements, tech stack)…"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                {jobDescription.length}/8000 characters — minimum 60 for a reliable analysis.
              </p>
            </div>
          </div>
          {generate.error && (
            <div className="bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-700 dark:text-neutral-300 rounded-xl p-3.5 mt-4 text-xs font-medium">
              {apiErrorMessage(generate.error)}
            </div>
          )}
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
                Generate 90-day plan
              </>
            )}
          </button>
        </div>
      </Reveal>

      {data && (
        <>
          {/* Readiness + gap summary */}
          <Reveal delay={reduce ? 0 : 0.12}>
            <div className="grid lg:grid-cols-3 gap-5">
              <div className="card !p-6 border-neutral-200 dark:border-neutral-800 text-center">
                <ReadinessRing value={data.report.readiness} />
                <h3 className="font-bold text-black dark:text-white mt-3">{data.report.role}</h3>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">{data.report.summary}</p>
                <span className="inline-flex items-center gap-1 mt-3 px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  {data.source === "ai" ? "Gemini-analyzed" : "Deterministic analyzer"}
                </span>
              </div>

              <div className="card !p-6 border-neutral-200 dark:border-neutral-800 lg:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-black dark:text-white">Skill gap breakdown</h3>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                    {data.report.skills.length} skills detected
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-4">
                  {(["strong", "developing", "gap", "unmeasured"] as SkillStatus[]).map((s) => (
                    <div key={s} className="rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-2.5">
                      <div className="text-xl font-black text-black dark:text-white">{data.report.counts[s]}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">{s}</div>
                    </div>
                  ))}
                </div>
                <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {data.report.skills.map((s) => (
                    <li
                      key={s.name}
                      className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-black dark:text-white truncate">{s.name}</div>
                        <div className="text-[10px] text-neutral-600 dark:text-neutral-400">
                          {s.area}
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
            </div>
          </Reveal>

          {/* 90-day plan */}
          <Reveal delay={reduce ? 0 : 0.16}>
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
          <Reveal delay={reduce ? 0 : 0.2}>
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
