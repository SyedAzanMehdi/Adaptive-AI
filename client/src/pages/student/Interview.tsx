import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import type { ChartOptions } from "chart.js";
import "../../lib/chartSetup";
import { Line } from "react-chartjs-2";
import {
  Video,
  Play,
  Square,
  RotateCcw,
  RefreshCcw,
  Timer,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  MessageSquareQuote,
  ClipboardList,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import api, { apiErrorMessage } from "../../lib/api";
import { useChartTheme } from "../../lib/chartTheme";
import { prefersReducedMotion, useReducedMotion } from "../../lib/anim";
import Reveal from "../../components/Reveal";
import PageHero from "../../components/PageHero";
import ErrorBanner from "../../components/ErrorBanner";
import EmptyState from "../../components/EmptyState";

let reduce = prefersReducedMotion();

type RoundKind = "screening" | "technical" | "system_design" | "behavioral";

interface Question {
  prompt: string;
  skill: string;
  probes: string[];
  goodAnswerSignals: string[];
}

interface Round {
  round: RoundKind;
  label: string;
  minutes: number;
  questions: Question[];
}

interface Script {
  role: string;
  rounds: Round[];
  closingAdvice: string;
}

interface RoundScore {
  round: RoundKind;
  label: string;
  answered: number;
  total: number;
  average: number;
}

interface Scorecard {
  role: string;
  overall: number;
  average: number;
  answered: number;
  totalQuestions: number;
  rounds: RoundScore[];
  focusRound: RoundKind | null;
  verdict: string;
  strengths: string[];
  gaps: string[];
  rehearseNext: Array<{ prompt: string; skill: string; selfScore: number }>;
  trend: "first" | "improving" | "flat" | "declining";
  delta: number | null;
  trendMessage: string;
}

interface PrepResource {
  title: string;
  kind: "platform" | "external";
  url: string;
  note: string;
  hours: number;
}

interface ScriptResponse {
  sessionId: string;
  source: "ai" | "mock";
  generatedAt: string;
  script: Script;
  minutes: number;
  questionCount: number;
  hasGapReport: boolean;
}

interface SessionResponse extends Omit<ScriptResponse, "hasGapReport"> {
  scorecard: Scorecard | null;
  scoredAt: string | null;
}

interface ScorecardResponse {
  sessionId: string;
  scoredAt: string;
  scorecard: Scorecard;
  resources: PrepResource[];
}

interface HistoryResponse {
  total: number;
  scoredCount: number;
  sessions: Array<{
    sessionId: string;
    role: string;
    source: "ai" | "mock";
    createdAt: string;
    overall: number | null;
    scored: boolean;
  }>;
  trend: Array<{ sessionId: string; role: string; overall: number; verdict: string; scoredAt: string | null }>;
}

const SCORE_LABEL: Record<number, string> = {
  1: "Froze",
  2: "Weak",
  3: "Passable",
  4: "Solid",
  5: "Nailed it",
};

function mmss(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function OverallRing({ value }: { value: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-32 h-32 mx-auto">
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
        <span className="text-2xl font-black text-black dark:text-white tabular-nums">{value}%</span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Rehearsal</span>
      </div>
    </div>
  );
}

function TrendIcon({ trend }: { trend: Scorecard["trend"] }) {
  if (trend === "improving") return <TrendingUp size={14} strokeWidth={2.4} />;
  if (trend === "declining") return <TrendingDown size={14} strokeWidth={2.4} />;
  return <Minus size={14} strokeWidth={2.4} />;
}

export default function Interview() {
  reduce = useReducedMotion();
  const queryClient = useQueryClient();
  const ct = useChartTheme();

  const [role, setRole] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, { selfScore: number; note: string }>>({});
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);

  const history = useQuery({
    queryKey: ["interview-history"],
    queryFn: async () => (await api.get<HistoryResponse>("/interview/history")).data,
  });

  // Resume the most recent rehearsal so a returning student is not staring at
  // an empty page with no memory of what they last practised.
  const latestId = activeId ?? history.data?.sessions[0]?.sessionId ?? null;

  const session = useQuery({
    queryKey: ["interview-session", latestId],
    queryFn: async () => (await api.get<SessionResponse>(`/interview/session/${latestId}`)).data,
    enabled: Boolean(latestId),
    retry: false,
  });

  const build = useMutation({
    mutationFn: async () =>
      (await api.post<ScriptResponse>("/interview/script", { role: role.trim() || undefined })).data,
    onSuccess: (data) => {
      setActiveId(data.sessionId);
      setScores({});
      setElapsed(0);
      setRunning(false);
      queryClient.invalidateQueries({ queryKey: ["interview-history"] });
    },
  });

  const submit = useMutation({
    mutationFn: async () => {
      const script = session.data?.script;
      if (!script || !latestId) throw new Error("No rehearsal to score");
      const entries = script.rounds.flatMap((round) =>
        round.questions
          .filter((q) => scores[q.prompt]?.selfScore)
          .map((q) => ({
            prompt: q.prompt,
            round: round.round,
            selfScore: scores[q.prompt].selfScore,
            note: scores[q.prompt].note.trim() || undefined,
          }))
      );
      return (await api.post<ScorecardResponse>("/interview/scorecard", { sessionId: latestId, entries })).data;
    },
    onSuccess: () => {
      setRunning(false);
      queryClient.invalidateQueries({ queryKey: ["interview-session", latestId] });
      queryClient.invalidateQueries({ queryKey: ["interview-history"] });
    },
  });

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const script = build.data?.script ?? session.data?.script ?? null;
  const scorecard = submit.data?.scorecard ?? session.data?.scorecard ?? null;
  const resources = submit.data?.resources ?? [];
  const answered = useMemo(
    () => (script ? script.rounds.reduce((n, r) => n + r.questions.filter((q) => scores[q.prompt]?.selfScore).length, 0) : 0),
    [script, scores]
  );
  const totalQuestions = script ? script.rounds.reduce((n, r) => n + r.questions.length, 0) : 0;

  const trendData = history.data?.trend ?? [];
  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        backgroundColor: ct.tooltipBg,
        borderColor: ct.tooltipBorder,
        borderWidth: 1,
        titleColor: ct.tooltipText,
        bodyColor: ct.tooltipText,
        displayColors: false,
      },
    },
    scales: {
      x: { grid: { color: ct.grid }, ticks: { color: ct.ticks, font: { size: 10 } } },
      y: {
        min: 0,
        max: 100,
        grid: { color: ct.grid },
        ticks: { color: ct.ticks, font: { size: 10 }, stepSize: 25 },
      },
    },
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <Reveal>
        <PageHero
          icon={<Video size={13} strokeWidth={2.2} />}
          eyebrow="Interview Rehearsal Studio™ — free for every student"
          title="Answer Out Loud. Score Yourself. Watch the Trend."
          description="A full mock loop — recruiter screening, technical deep-dive, system design, behavioural — built from your actual gap report when you have one. Answer every question aloud against a clock, then score yourself against the rubric. Identical answers always produce an identical verdict, so the trend line across sessions is real."
        />
      </Reveal>

      {/* Build a script */}
      <Reveal delay={reduce ? 0 : 0.08}>
        <div className="card !p-6 border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <label className="label">Target role (optional)</label>
              <input
                className="input"
                placeholder="Leave blank to use your Autopilot role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
            <button
              className="btn-primary inline-flex items-center gap-2 shrink-0"
              disabled={build.isPending}
              onClick={() => build.mutate()}
            >
              {build.isPending ? (
                <>
                  <RefreshCcw size={14} strokeWidth={2.2} className="animate-spin" />
                  Writing the script…
                </>
              ) : (
                <>
                  <Sparkles size={14} strokeWidth={2.2} />
                  {script ? "Rebuild script" : "Build my rehearsal script"}
                </>
              )}
            </button>
          </div>
          {build.error && <ErrorBanner message={apiErrorMessage(build.error)} className="mt-4" />}
          {build.data && (
            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-3 leading-relaxed">
              {build.data.questionCount} questions across {build.data.script.rounds.length} rounds ·{" "}
              {build.data.minutes} minute budget ·{" "}
              {build.data.hasGapReport
                ? "aimed at the gaps in your Career Autopilot report."
                : "role-generic — generate a Career Autopilot plan to aim these at your real gaps."}
            </p>
          )}
        </div>
      </Reveal>

      {script && (
        <>
          {/* Rehearsal controls */}
          <Reveal delay={reduce ? 0 : 0.12}>
            <div className="card !p-5 !bg-black dark:!bg-white !text-white dark:!text-black !border-black dark:!border-white">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Now rehearsing</span>
                  <h2 className="text-lg font-black">{script.role}</h2>
                  <p className="text-[11px] opacity-70 mt-0.5">
                    {answered}/{totalQuestions} answered · {script.rounds.reduce((n, r) => n + r.minutes, 0)} minute loop
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black tabular-nums">{mmss(elapsed)}</span>
                  <div className="flex items-center gap-2">
                    <button
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-black text-black dark:text-white text-[11px] font-black"
                      onClick={() => setRunning((r) => !r)}
                    >
                      {running ? <Square size={12} strokeWidth={2.6} /> : <Play size={12} strokeWidth={2.6} />}
                      {running ? "Pause" : "Start"}
                    </button>
                    <button
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/40 dark:border-black/40 text-[11px] font-bold"
                      onClick={() => {
                        setRunning(false);
                        setElapsed(0);
                      }}
                    >
                      <RotateCcw size={12} strokeWidth={2.4} />
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Rounds */}
          {script.rounds.map((round, roundIndex) => (
            <Reveal key={round.round} delay={reduce ? 0 : 0.16 + roundIndex * 0.04}>
              <div className="card !p-6 border-neutral-200 dark:border-neutral-800">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                  <div>
                    <h3 className="font-black text-black dark:text-white">{round.label}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mt-0.5">
                      Round {roundIndex + 1} of {script.rounds.length} · {round.questions.length} questions
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[11px] font-black text-black dark:text-white">
                    <Timer size={12} strokeWidth={2.4} />
                    {round.minutes} min
                  </span>
                </div>

                <div className="space-y-4">
                  {round.questions.map((q, qi) => {
                    const entry = scores[q.prompt];
                    return (
                      <div
                        key={q.prompt}
                        className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-4"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <span className="shrink-0 w-7 h-7 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-[11px] font-black tabular-nums">
                            {qi + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-black dark:text-white leading-relaxed">{q.prompt}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mt-1">{q.skill}</p>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3 mb-3">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500 mb-1.5">
                              Expect the follow-up
                            </p>
                            <ul className="space-y-1">
                              {q.probes.map((probe) => (
                                <li key={probe} className="flex items-start gap-1.5 text-[11px] text-neutral-600 dark:text-neutral-400 leading-snug">
                                  <ArrowRight size={11} strokeWidth={2.4} className="mt-0.5 shrink-0" />
                                  <span>{probe}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500 mb-1.5">
                              A strong answer shows
                            </p>
                            <ul className="space-y-1">
                              {q.goodAnswerSignals.map((signal) => (
                                <li key={signal} className="flex items-start gap-1.5 text-[11px] text-neutral-600 dark:text-neutral-400 leading-snug">
                                  <CheckCircle2 size={11} strokeWidth={2.4} className="mt-0.5 shrink-0" />
                                  <span>{signal}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800">
                          <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500 mb-1.5">
                            How did that actually go?
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                title={SCORE_LABEL[n]}
                                onClick={() =>
                                  setScores((prev) => ({
                                    ...prev,
                                    [q.prompt]: { selfScore: n, note: prev[q.prompt]?.note ?? "" },
                                  }))
                                }
                                className={`px-3 py-1.5 rounded-lg border text-[11px] font-black tabular-nums transition-colors ${
                                  entry?.selfScore === n
                                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                                    : "border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-black dark:hover:border-white"
                                }`}
                              >
                                {n}
                              </button>
                            ))}
                            {entry?.selfScore && (
                              <span className="self-center text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                                {SCORE_LABEL[entry.selfScore]}
                              </span>
                            )}
                          </div>
                          <input
                            className="input mt-2 !text-[11px]"
                            placeholder="One line: what broke? (optional)"
                            value={entry?.note ?? ""}
                            onChange={(e) =>
                              setScores((prev) => ({
                                ...prev,
                                [q.prompt]: { selfScore: prev[q.prompt]?.selfScore ?? 0, note: e.target.value },
                              }))
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          ))}

          {/* Closing advice + submit */}
          <Reveal delay={reduce ? 0 : 0.2}>
            <div className="card !p-6 border-neutral-200 dark:border-neutral-800">
              <div className="flex items-start gap-2 mb-4">
                <MessageSquareQuote size={15} strokeWidth={2.2} className="mt-0.5 shrink-0 text-neutral-600 dark:text-neutral-400" />
                <p className="text-[11px] text-neutral-700 dark:text-neutral-300 leading-relaxed">{script.closingAdvice}</p>
              </div>
              {submit.error && <ErrorBanner message={apiErrorMessage(submit.error)} className="mb-4" />}
              <button
                className="btn-primary inline-flex items-center gap-2"
                disabled={submit.isPending || answered === 0}
                onClick={() => submit.mutate()}
              >
                {submit.isPending ? (
                  <>
                    <RefreshCcw size={14} strokeWidth={2.2} className="animate-spin" />
                    Scoring…
                  </>
                ) : (
                  <>
                    <ClipboardList size={14} strokeWidth={2.2} />
                    Score this rehearsal ({answered}/{totalQuestions})
                  </>
                )}
              </button>
              {answered === 0 && (
                <p className="text-[10px] text-neutral-500 mt-2">Score at least one question to get a verdict.</p>
              )}
            </div>
          </Reveal>
        </>
      )}

      {/* Scorecard */}
      {scorecard && (
        <Reveal delay={reduce ? 0 : 0.08}>
          <div className="space-y-5">
            <div className="grid lg:grid-cols-3 gap-5">
              <div className="card !p-6 border-neutral-200 dark:border-neutral-800 text-center">
                <OverallRing value={scorecard.overall} />
                <h3 className="font-bold text-black dark:text-white mt-3">{scorecard.role}</h3>
                <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  <TrendIcon trend={scorecard.trend} />
                  {scorecard.trend}
                  {scorecard.delta !== null && (
                    <span className="tabular-nums">
                      {scorecard.delta > 0 ? "+" : ""}
                      {scorecard.delta}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
                  {scorecard.trendMessage}
                </p>
              </div>

              <div className="card !p-6 border-neutral-200 dark:border-neutral-800 lg:col-span-2">
                <h3 className="font-bold text-black dark:text-white mb-2">Verdict</h3>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">{scorecard.verdict}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {scorecard.rounds.map((r) => (
                    <div
                      key={r.round}
                      className={`rounded-xl border p-2.5 text-center ${
                        scorecard.focusRound === r.round
                          ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                          : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50"
                      }`}
                    >
                      <div className="text-lg font-black tabular-nums">{r.average.toFixed(1)}</div>
                      <div className="text-[9px] font-bold uppercase tracking-wider leading-tight opacity-70">{r.label}</div>
                      <div className="text-[9px] opacity-60 mt-0.5 tabular-nums">
                        {r.answered}/{r.total}
                      </div>
                    </div>
                  ))}
                </div>
                {scorecard.focusRound && (
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-3">
                    Rehearse this round next
                  </p>
                )}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-black dark:text-white mb-2">Strengths</p>
                    <ul className="space-y-1.5">
                      {scorecard.strengths.map((s) => (
                        <li key={s} className="flex items-start gap-1.5 text-[11px] text-neutral-600 dark:text-neutral-400 leading-snug">
                          <CheckCircle2 size={11} strokeWidth={2.4} className="mt-0.5 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-black dark:text-white mb-2">Gaps</p>
                    {scorecard.gaps.length === 0 ? (
                      <p className="text-[11px] text-neutral-500 leading-snug">
                        Nothing scored 2/5 or below. Raise the difficulty — pick a harder role.
                      </p>
                    ) : (
                      <ul className="space-y-1.5">
                        {scorecard.gaps.map((g) => (
                          <li key={g} className="flex items-start gap-1.5 text-[11px] text-neutral-600 dark:text-neutral-400 leading-snug">
                            <AlertTriangle size={11} strokeWidth={2.4} className="mt-0.5 shrink-0" />
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {scorecard.rehearseNext.length > 0 && (
              <div className="card !p-6 border-neutral-200 dark:border-neutral-800">
                <h3 className="font-bold text-black dark:text-white mb-3">Rehearse these next</h3>
                <ul className="space-y-2">
                  {scorecard.rehearseNext.map((item) => (
                    <li
                      key={item.prompt}
                      className="flex items-start justify-between gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-black dark:text-white leading-snug">{item.prompt}</p>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider mt-0.5">{item.skill}</p>
                      </div>
                      <span className="shrink-0 text-[11px] font-black tabular-nums text-neutral-700 dark:text-neutral-300">
                        {item.selfScore}/5
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {resources.length > 0 && (
              <div className="card !p-6 border-neutral-200 dark:border-neutral-800">
                <h3 className="font-bold text-black dark:text-white mb-3">Prep resources</h3>
                <div className="grid sm:grid-cols-3 gap-2">
                  {resources.map((resource) => {
                    const cls =
                      "group flex items-start gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 px-3 py-2.5 hover:border-black dark:hover:border-white transition-colors";
                    const Icon = resource.kind === "platform" ? ArrowRight : ExternalLink;
                    const body = (
                      <>
                        <Icon size={12} strokeWidth={2.4} className="mt-0.5 shrink-0 text-neutral-500 group-hover:text-black dark:group-hover:text-white" />
                        <span className="min-w-0">
                          <span className="block text-[11px] font-bold text-black dark:text-white truncate">{resource.title}</span>
                          <span className="block text-[10px] text-neutral-500 leading-snug">
                            {resource.note} · {resource.hours}h
                          </span>
                        </span>
                      </>
                    );
                    return resource.kind === "platform" ? (
                      <Link key={resource.url} to={resource.url} className={cls}>{body}</Link>
                    ) : (
                      <a key={resource.url} href={resource.url} target="_blank" rel="noreferrer" className={cls}>
                        {body}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Reveal>
      )}

      {/* History + trend */}
      {history.data && history.data.total > 0 && (
        <Reveal delay={reduce ? 0 : 0.12}>
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="card !p-6 border-neutral-200 dark:border-neutral-800">
              <h3 className="font-bold text-black dark:text-white mb-3">Rehearsal history</h3>
              <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {history.data.sessions.map((s) => (
                  <li key={s.sessionId}>
                    <button
                      disabled={submit.isPending}
                      onClick={() => {
                        setActiveId(s.sessionId);
                        setScores({});
                        setElapsed(0);
                        setRunning(false);
                        submit.reset();
                      }}
                      className={`w-full flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        latestId === s.sessionId
                          ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block text-[11px] font-bold truncate">{s.role}</span>
                        <span className="block text-[10px] opacity-60">
                          {new Date(s.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          {s.scored ? "" : " · not scored"}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs font-black tabular-nums">{s.overall !== null ? `${s.overall}%` : "—"}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card !p-6 border-neutral-200 dark:border-neutral-800">
              <h3 className="font-bold text-black dark:text-white mb-1">Score trend</h3>
              <p className="text-[10px] text-neutral-500 mb-4">
                {trendData.length < 2
                  ? "Score a second rehearsal to draw the line — one session has no trend."
                  : `${trendData.length} scored rehearsals, oldest first.`}
              </p>
              {trendData.length >= 2 ? (
                <div className="h-48">
                  <Line
                    options={chartOptions}
                    data={{
                      labels: trendData.map((t) =>
                        t.scoredAt
                          ? new Date(t.scoredAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                          : t.role
                      ),
                      datasets: [
                        {
                          label: "Overall",
                          data: trendData.map((t) => t.overall),
                          borderColor: ct.line,
                          backgroundColor: ct.fill,
                          pointBackgroundColor: ct.point,
                          pointBorderColor: ct.pointBorder,
                          pointRadius: 4,
                          tension: 0.3,
                          fill: true,
                        },
                      ],
                    }}
                  />
                </div>
              ) : (
                <div className="h-48 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center">
                  <motion.div animate={reduce ? {} : { y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-center">
                    <TrendingUp size={22} strokeWidth={1.8} className="mx-auto text-neutral-400 mb-2" />
                    <p className="text-[11px] font-bold text-neutral-500">Waiting for a second rehearsal</p>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      )}

      {!script && !history.isLoading && history.data?.total === 0 && (
        <Reveal delay={reduce ? 0 : 0.08}>
          <EmptyState
            icon={<Video size={26} strokeWidth={1.8} />}
            title="No rehearsal yet"
            description={
              <>
                Build a script above. It takes a few seconds, and the questions come from the same gap report
                your <Link to="/autopilot" className="font-bold underline underline-offset-2">Career Autopilot</Link> plan
                is built on.
              </>
            }
          />
        </Reveal>
      )}
    </div>
  );
}
