import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  Network,
  Clock,
  RefreshCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Footprints,
  ListChecks,
  Ruler,
} from "lucide-react";
import api, { apiErrorMessage } from "../../lib/api";
import { prefersReducedMotion } from "../../lib/anim";
import Reveal from "../../components/Reveal";

const reduce = prefersReducedMotion();

interface DojoChallenge {
  id: string;
  title: string;
  difficulty: "Intro" | "Core" | "Advanced";
  minutes: number;
  blurb: string;
  functional: string[];
  nonFunctional: string[];
}

interface FrameworkStep {
  step: number;
  name: string;
  focus: string;
}

interface CritiqueScores {
  requirements: number;
  estimation: number;
  dataModeling: number;
  scalability: number;
}

interface CritiqueResult {
  scores: CritiqueScores;
  verdict: string;
  strengths: string[];
  gaps: string[];
  nextSteps: string[];
}

interface ChallengesResponse {
  framework: FrameworkStep[];
  challenges: DojoChallenge[];
}

interface CritiqueResponse {
  source: "ai" | "mock";
  generatedAt: string;
  challenge: { id: string; title: string; difficulty: string };
  critique: CritiqueResult;
}

interface HistoryItem {
  challengeId: string;
  notesExcerpt: string;
  critique: CritiqueResult;
  source: "ai" | "mock";
  createdAt: string;
}

const AXES: { key: keyof CritiqueScores; label: string }[] = [
  { key: "requirements", label: "Requirements" },
  { key: "estimation", label: "Estimation" },
  { key: "dataModeling", label: "Data Modeling" },
  { key: "scalability", label: "Scalability" },
];

const DIFFICULTY_CLS: Record<DojoChallenge["difficulty"], string> = {
  Intro: "bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700",
  Core: "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white",
  Advanced: "bg-white dark:bg-black text-neutral-800 dark:text-neutral-200 border-neutral-500 dark:border-neutral-500 border-dashed",
};

function AxisBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">{label}</span>
        <span className="text-[11px] font-black text-black dark:text-white">{value}/5</span>
      </div>
      <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-black dark:bg-white transition-all duration-700"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function Dojo() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const { data: challengeData } = useQuery({
    queryKey: ["dojo-challenges"],
    queryFn: async () => (await api.get<ChallengesResponse>("/dojo/challenges")).data,
  });

  const { data: historyData } = useQuery({
    queryKey: ["dojo-history"],
    queryFn: async () => (await api.get<{ critiques: HistoryItem[] }>("/dojo/history")).data,
  });

  const critique = useMutation({
    mutationFn: async () =>
      (await api.post<CritiqueResponse>("/dojo/critique", { challengeId: selectedId, notes })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dojo-history"] });
    },
  });

  const challenges = challengeData?.challenges ?? [];
  const selected = challenges.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-white dark:from-black via-neutral-100 dark:via-neutral-900 to-white dark:to-black border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-black/5 dark:bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-800 dark:text-neutral-200 text-xs font-semibold mb-3">
              <Network size={13} strokeWidth={2.2} />
              System Design Dojo™ — free for every student
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-black dark:text-white tracking-tight">
              Train system design like a sport. Walk into interviews like an architect.
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              Pick a real interview challenge, draft your design in the five-step framework, and get a
              rubric critique on requirements, estimation, data modeling, and scalability — the exact
              axes senior engineers grade.
            </p>
          </div>
        </div>
      </Reveal>

      {/* The five-step framework */}
      <Reveal delay={reduce ? 0 : 0.06}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {(challengeData?.framework ?? []).map((f) => (
            <div key={f.step} className="card !p-4 border-neutral-200 dark:border-neutral-800">
              <div className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-1">
                Step {f.step}
              </div>
              <div className="font-bold text-sm text-black dark:text-white mb-1">{f.name}</div>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">{f.focus}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Challenge grid */}
      <Reveal delay={reduce ? 0 : 0.1}>
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ListChecks size={16} strokeWidth={2.2} className="text-neutral-700 dark:text-neutral-300" />
            <h2 className="font-bold text-black dark:text-white">Pick a challenge</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedId(c.id);
                  critique.reset();
                }}
                className={`card !p-5 text-left transition-all duration-200 border ${
                  selectedId === c.id
                    ? "!border-black dark:!border-white ring-2 ring-black/10 dark:ring-white/10"
                    : "border-neutral-200 dark:border-neutral-800 hover:-translate-y-0.5"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${DIFFICULTY_CLS[c.difficulty]}`}>
                    {c.difficulty}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-600 dark:text-neutral-400">
                    <Clock size={11} strokeWidth={2.4} />
                    {c.minutes} min
                  </span>
                </div>
                <h3 className="font-bold text-black dark:text-white">{c.title}</h3>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed mt-1">{c.blurb}</p>
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Selected challenge: brief + notes + critique */}
      {selected && (
        <Reveal delay={reduce ? 0 : 0.05}>
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="card !p-6 border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-black dark:text-white">Interview brief — {selected.title}</h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">{selected.difficulty}</span>
              </div>
              <div className="mb-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-1.5">Functional requirements</div>
                <ul className="space-y-1.5">
                  {selected.functional.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 size={13} strokeWidth={2.4} className="mt-0.5 shrink-0 text-neutral-600 dark:text-neutral-400" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-1.5">Non-functional targets</div>
                <ul className="space-y-1.5">
                  {selected.nonFunctional.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                      <Ruler size={13} strokeWidth={2.4} className="mt-0.5 shrink-0 text-neutral-600 dark:text-neutral-400" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="card !p-6 border-neutral-200 dark:border-neutral-800">
              <h3 className="font-bold text-black dark:text-white mb-3">Your design draft</h3>
              <textarea
                className="input min-h-[180px] resize-y text-xs leading-relaxed"
                placeholder="Walk through all five steps: requirements you'd clarify, back-of-envelope estimates, data model + API, high-level architecture, and how you scale it…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
                {notes.length}/6000 characters — minimum 80 for a meaningful critique.
              </p>
              {critique.error && (
                <div className="bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-700 dark:text-neutral-300 rounded-xl p-3.5 mt-3 text-xs font-medium">
                  {apiErrorMessage(critique.error)}
                </div>
              )}
              <button
                className="btn-primary mt-4 inline-flex items-center gap-2"
                disabled={critique.isPending || notes.trim().length < 80}
                onClick={() => critique.mutate()}
              >
                {critique.isPending ? (
                  <>
                    <RefreshCcw size={14} strokeWidth={2.2} className="animate-spin" />
                    Grading your design…
                  </>
                ) : (
                  <>
                    <Sparkles size={14} strokeWidth={2.2} />
                    Get AI critique
                  </>
                )}
              </button>
            </div>
          </div>
        </Reveal>
      )}

      {critique.data && (
        <Reveal delay={reduce ? 0 : 0.04}>
          <div className="card !p-6 border-neutral-200 dark:border-neutral-800">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h3 className="font-bold text-black dark:text-white">Critique — {critique.data.challenge.title}</h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                {critique.data.source === "ai" ? "Gemini-graded" : "Deterministic rubric"}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {AXES.map(({ key, label }) => (
                  <AxisBar key={key} label={label} value={critique.data.critique.scores[key]} />
                ))}
                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  {critique.data.critique.verdict}
                </p>
              </div>

              <div className="grid sm:grid-cols-1 gap-4">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-1.5">Strengths</div>
                  <ul className="space-y-1.5">
                    {critique.data.critique.strengths.map((s) => (
                      <li key={s} className="flex items-start gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                        <CheckCircle2 size={13} strokeWidth={2.4} className="mt-0.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-1.5">Gaps</div>
                  <ul className="space-y-1.5">
                    {critique.data.critique.gaps.map((g) => (
                      <li key={g} className="flex items-start gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                        <AlertTriangle size={13} strokeWidth={2.4} className="mt-0.5 shrink-0" />
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-1.5">Next steps</div>
                  <ul className="space-y-1.5">
                    {critique.data.critique.nextSteps.map((n) => (
                      <li key={n} className="flex items-start gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                        <Footprints size={13} strokeWidth={2.4} className="mt-0.5 shrink-0" />
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {/* History */}
      {(historyData?.critiques ?? []).length > 0 && (
        <Reveal delay={reduce ? 0 : 0.08}>
          <div className="card !p-6 border-neutral-200 dark:border-neutral-800">
            <h3 className="font-bold text-black dark:text-white mb-3">Recent critiques</h3>
            <ul className="space-y-2.5">
              {(historyData?.critiques ?? []).slice(0, 5).map((h) => (
                <li key={h.createdAt} className="rounded-xl border border-neutral-200 dark:border-neutral-800 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-black dark:text-white capitalize">{h.challengeId.replace(/-/g, " ")}</span>
                    <span className="text-[10px] text-neutral-600 dark:text-neutral-400 shrink-0">
                      {new Date(h.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-2">{h.critique.verdict}</p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      )}

      {/* Interview cadence — inverted card */}
      <Reveal delay={reduce ? 0 : 0.12}>
        <div className="card !p-5 !bg-black dark:!bg-white !text-white dark:!text-black !border-black dark:!border-white">
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
            Weekly dojo rhythm — 3 sessions, 45 minutes each
          </span>
          <ul className="mt-2 grid sm:grid-cols-3 gap-3 text-xs">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} strokeWidth={2.2} className="mt-0.5 shrink-0" />
              <span>Session 1: draft a fresh design without help, timed.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} strokeWidth={2.2} className="mt-0.5 shrink-0" />
              <span>Session 2: submit for critique and rebuild the weakest axis.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} strokeWidth={2.2} className="mt-0.5 shrink-0" />
              <span>Session 3: explain your design aloud in 10 minutes, cold.</span>
            </li>
          </ul>
        </div>
      </Reveal>
    </div>
  );
}
