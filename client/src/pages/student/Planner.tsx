import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Map, BookOpen, Code2, MessageSquare, RefreshCcw, Brain, ArrowRight } from "lucide-react";
import api from "../../lib/api";
import { DOMAIN_LABELS } from "../../lib/domains";
import { prefersReducedMotion, useReducedMotion } from "../../lib/anim";
import Reveal from "../../components/Reveal";
import { studyRotation, rankSkills, skillGuidance, type SkillSignal } from "../../lib/learning";
import ErrorBanner from "../../components/ErrorBanner";
import { apiErrorMessage } from "../../lib/api";

let reduce = prefersReducedMotion();

interface MatrixResponse {
  domains: Record<string, { score: number; confidence: number; attempts: number }>;
}

interface LessonSummary {
  conceptId: string;
  title: string;
  domain: string;
}

interface Exercise {
  exerciseId: string;
  title: string;
  domain: string;
}

interface PlanDay {
  day: number;
  domain: string | null;
  score: number | null;
  lesson: LessonSummary | null;
  exercise: Exercise | null;
  needsRecall: boolean;
}

function buildPlan(
  matrix: Record<string, SkillSignal>,
  lessons: LessonSummary[],
  exercises: Exercise[]
): PlanDay[] {
  const focus = studyRotation(matrix);

  const days: PlanDay[] = focus.map((domain, i) => ({
    day: i + 1,
    domain,
    score: matrix[domain]?.attempts > 0 ? matrix[domain].score : null,
    lesson: lessons.find((l) => l.domain === domain) ?? null,
    exercise: exercises.find((e) => e.domain === domain) ?? null,
    needsRecall: matrix[domain]?.attempts > 0 && matrix[domain].score < 0.6,
  }));

  days.push({ day: 7, domain: null, score: null, lesson: null, exercise: null, needsRecall: false });
  return days;
}

export default function Planner() {
  reduce = useReducedMotion();
  const [minutes, setMinutes] = useState(25);
  const { data: matrix, isLoading, error } = useQuery({
    queryKey: ["matrix"],
    queryFn: async () => (await api.get<MatrixResponse>("/student/matrix")).data,
  });
  const { data: lessons, isLoading: lessonsLoading, error: lessonsError } = useQuery({
    queryKey: ["lessons"],
    queryFn: async () => (await api.get<{ lessons: LessonSummary[] }>("/lessons")).data.lessons,
  });
  const { data: exercises, isLoading: exercisesLoading, error: exercisesError } = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => (await api.get<{ exercises: Exercise[] }>("/submissions/exercises")).data.exercises,
  });

  const days = useMemo(
    () => buildPlan(matrix?.domains ?? {}, lessons ?? [], exercises ?? []),
    [matrix, lessons, exercises]
  );
  const personalized = Object.values(matrix?.domains ?? {}).some((s) => s.attempts > 0);
  const weakest = useMemo(() => {
    const entries = Object.entries(matrix?.domains ?? {});
    if (entries.length === 0) return null;
    const domain = rankSkills(matrix?.domains ?? {})[0];
    return entries.find(([key]) => key === domain) ?? null;
  }, [matrix]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-white dark:from-black via-neutral-100 dark:via-neutral-900 to-white dark:to-black border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-black/5 dark:bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-800 dark:text-neutral-200 text-xs font-semibold mb-3">
              <Map size={13} strokeWidth={2.2} />
              PathFinder™ — Adaptive Study Planner
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-black dark:text-white tracking-tight">Your Next 7 Days, Planned</h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              A deterministic scheduler built from your live capability matrix: weakest competencies
              get spaced repetition first, every day pairs a lesson with a mentored exercise, and day 7
              re-baselines the whole map.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
              {personalized ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold">
                  Personalized from {Object.keys(matrix?.domains ?? {}).length} competency signals
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-700 dark:text-neutral-300 font-semibold">
                  Balanced rotation — take the diagnostic to personalize
                </span>
              )}
              {weakest && (
                <span className="inline-flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                Priority signal: {DOMAIN_LABELS[weakest[0] as keyof typeof DOMAIN_LABELS] ?? weakest[0]} — {weakest[1].attempts > 0 ? `${Math.round(weakest[1].score * 100)}% mastery` : "not measured yet"}
                </span>
              )}
            </div>
          </div>
        </div>
      </Reveal>

      {(error || lessonsError || exercisesError) && <ErrorBanner message={apiErrorMessage(error || lessonsError || exercisesError)} />}
      <div className="learning-spotlight flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <span className="learning-eyebrow">Make room for progress</span>
          <h2 className="text-xl font-black mt-2">{minutes} minutes, one focused session</h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">{minutes <= 15 ? "Start with a worked example and a short recall drill." : minutes <= 30 ? "Learn the idea, then apply it in one mentored exercise." : "Add a second attempt, edge cases, and a reflection on the feedback."}</p>
        </div>
        <div className="sm:w-60 shrink-0">
          <label htmlFor="study-minutes" className="label">Daily time budget: {minutes} min</label>
          <input id="study-minutes" type="range" min={10} max={60} step={5} value={minutes} onChange={(event) => setMinutes(Number(event.target.value))} className="w-full accent-blue-600" />
          <div className="flex justify-between text-xs text-neutral-500"><span>10 min</span><span>60 min</span></div>
        </div>
      </div>

      {isLoading || lessonsLoading || exercisesLoading ? <p role="status" className="text-sm text-neutral-500">Building your study path…</p> : !error && !lessonsError && !exercisesError && (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {days.map((d, i) => (
          <Reveal key={d.day} delay={reduce ? 0 : 0.08 + i * 0.06}>
            <motion.div
              whileHover={reduce ? {} : { y: -4 }}
              className={`card h-full flex flex-col gap-4 !p-5 ${d.day === 7 ? "border-black/40 dark:border-white/40" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                  Day {d.day}
                </span>
                {d.score !== null && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-700 dark:text-neutral-300">
                    {Math.round(d.score * 100)}% mastery
                  </span>
                )}
              </div>

              {d.domain === null ? (
                <>
                  <h2 className="font-bold text-black dark:text-white text-base -mt-2">Integration & Re-baseline</h2>
                  <ul className="text-xs text-neutral-700 dark:text-neutral-300 space-y-2.5">
                    <li className="flex items-start gap-2">
                      <Brain size={13} strokeWidth={2.2} className="mt-0.5 shrink-0 text-neutral-600 dark:text-neutral-400" />
                      <Link to="/diagnostic" className="hover:text-black dark:hover:text-white underline underline-offset-2">
                        Re-run the diagnostic to refresh your matrix
                      </Link>
                    </li>
                    <li className="flex items-start gap-2">
                      <Code2 size={13} strokeWidth={2.2} className="mt-0.5 shrink-0 text-neutral-600 dark:text-neutral-400" />
                      <Link to="/practice" className="hover:text-black dark:hover:text-white underline underline-offset-2">
                        Free practice — pick any domain challenge
                      </Link>
                    </li>
                    <li className="flex items-start gap-2">
                      <RefreshCcw size={13} strokeWidth={2.2} className="mt-0.5 shrink-0 text-neutral-600 dark:text-neutral-400" />
                      <span>PathFinder re-plans next week from the updated signals.</span>
                    </li>
                  </ul>
                </>
              ) : (
                <>
                  <h2 className="font-bold text-black dark:text-white text-base -mt-2">
                    {DOMAIN_LABELS[d.domain as keyof typeof DOMAIN_LABELS] ?? d.domain}
                  </h2>
                  <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 p-3">
                    <p className="learning-eyebrow">{skillGuidance(matrix?.domains[d.domain]).label} · {minutes} min</p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">{skillGuidance(matrix?.domains[d.domain]).reason}</p>
                    <p className="text-xs font-semibold mt-2 text-neutral-700 dark:text-neutral-300">{minutes <= 15 ? `${minutes - 3} min example · 3 min recall` : `${Math.round(minutes * 0.35)} min learn · ${minutes - Math.round(minutes * 0.35) - 5} min practice · 5 min reflect`}</p>
                  </div>
                  <ul className="text-xs text-neutral-700 dark:text-neutral-300 space-y-2.5">
                    {d.lesson && (
                      <li className="flex items-start gap-2">
                        <BookOpen size={13} strokeWidth={2.2} className="mt-0.5 shrink-0 text-neutral-600 dark:text-neutral-400" />
                        <Link to={`/lessons/${d.lesson.conceptId}`} className="hover:text-black dark:hover:text-white underline underline-offset-2">
                          Adaptive lesson: {d.lesson.title}
                        </Link>
                      </li>
                    )}
                    {d.exercise && (
                      <li className="flex items-start gap-2">
                        <Code2 size={13} strokeWidth={2.2} className="mt-0.5 shrink-0 text-neutral-600 dark:text-neutral-400" />
                        <Link to={`/practice?exercise=${encodeURIComponent(d.exercise.exerciseId)}`} className="hover:text-black dark:hover:text-white underline underline-offset-2">
                          Mentored exercise: {d.exercise.title}
                        </Link>
                      </li>
                    )}
                    {!d.lesson && !d.exercise && (
                      <li className="flex items-start gap-2">
                        <Code2 size={13} strokeWidth={2.2} className="mt-0.5 shrink-0 text-neutral-600 dark:text-neutral-400" />
                        <Link to="/practice" className="hover:text-black dark:hover:text-white underline underline-offset-2">
                          No adaptive content yet — open free practice for this domain
                        </Link>
                      </li>
                    )}
                    {d.needsRecall && (
                      <li className="flex items-start gap-2">
                        <RefreshCcw size={13} strokeWidth={2.2} className="mt-0.5 shrink-0 text-neutral-600 dark:text-neutral-400" />
                        <span>2-min recall drill: re-solve one problem from memory, no notes.</span>
                      </li>
                    )}
                    <li className="flex items-start gap-2">
                      <MessageSquare size={13} strokeWidth={2.2} className="mt-0.5 shrink-0 text-neutral-600 dark:text-neutral-400" />
                      <Link to="/chat" className="hover:text-black dark:hover:text-white underline underline-offset-2">
                        Ask the mentor one question about this domain
                      </Link>
                    </li>
                  </ul>
                </>
              )}

              <div className="mt-auto pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                <span>{d.domain === null ? "Weekly close-out" : d.needsRecall ? "Spacing: high priority" : "Spacing: maintenance"}</span>
                <ArrowRight size={12} strokeWidth={2.4} />
              </div>
            </motion.div>
          </Reveal>
        ))}

        <Reveal delay={reduce ? 0 : 0.08 + 7 * 0.06}>
          <div className="card h-full flex flex-col gap-3 !p-5 !bg-black dark:!bg-white !text-white dark:!text-black !border-black dark:!border-white">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
              How PathFinder schedules
            </span>
            <h2 className="font-bold text-base -mt-1">The algorithm</h2>
            <ul className="text-xs text-neutral-300 dark:text-neutral-700 space-y-2 leading-relaxed">
              <li>1. Ranks competencies by mastery gaps and confidence; unmeasured skills need exploration.</li>
              <li>2. Revisits the top three priorities 3, 2, and 1 times over six days. Without evidence, rotates across all five domains.</li>
              <li>3. Pairs each focus day with an adaptive lesson, a mentored exercise, and a recall drill when mastery is under 60%.</li>
              <li>4. Day 7 re-baselines with a fresh diagnostic — then the plan rebuilds itself.</li>
            </ul>
          </div>
        </Reveal>
      </div>
      )}
    </div>
  );
}
