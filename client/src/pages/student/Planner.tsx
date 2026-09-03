import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Map, BookOpen, Code2, MessageSquare, RefreshCcw, Brain, ArrowRight } from "lucide-react";
import api from "../../lib/api";
import { DOMAIN_LABELS } from "../../lib/domains";
import { prefersReducedMotion } from "../../lib/anim";
import Reveal from "../../components/Reveal";

const reduce = prefersReducedMotion();

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

const CORE = ["syntax", "oop", "data_structures", "algorithms", "debugging"];

function buildPlan(
  matrix: Record<string, { score: number }>,
  lessons: LessonSummary[],
  exercises: Exercise[]
): PlanDay[] {
  const ranked = [...CORE].sort((a, b) => (matrix[a]?.score ?? 0.5) - (matrix[b]?.score ?? 0.5));
  const hasSignal = Object.keys(matrix).length > 0;

  // Interleaved spacing: weakest domain repeats most (weights 3,2,1,1,1), days 1-6.
  const remaining = ranked.map((_, i) => Math.max(1, 3 - i));
  const focus: string[] = [];
  let cursor = 0;
  while (focus.length < 6 && remaining.some((r) => r > 0)) {
    if (remaining[cursor % ranked.length] > 0) {
      remaining[cursor % ranked.length] -= 1;
      focus.push(ranked[cursor % ranked.length]);
    }
    cursor += 1;
  }

  const days: PlanDay[] = focus.map((domain, i) => ({
    day: i + 1,
    domain,
    score: hasSignal ? matrix[domain]?.score ?? null : null,
    lesson: lessons.find((l) => l.domain === domain) ?? null,
    exercise: exercises.find((e) => e.domain === domain) ?? null,
    needsRecall: (matrix[domain]?.score ?? 1) < 0.6,
  }));

  days.push({ day: 7, domain: null, score: null, lesson: null, exercise: null, needsRecall: false });
  return days;
}

export default function Planner() {
  const { data: matrix } = useQuery({
    queryKey: ["matrix"],
    queryFn: async () => (await api.get<MatrixResponse>("/student/matrix")).data,
  });
  const { data: lessons } = useQuery({
    queryKey: ["lessons"],
    queryFn: async () => (await api.get<{ lessons: LessonSummary[] }>("/lessons")).data.lessons,
  });
  const { data: exercises } = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => (await api.get<{ exercises: Exercise[] }>("/submissions/exercises")).data.exercises,
  });

  const days = useMemo(
    () => buildPlan(matrix?.domains ?? {}, lessons ?? [], exercises ?? []),
    [matrix, lessons, exercises]
  );
  const personalized = Object.keys(matrix?.domains ?? {}).length > 0;
  const weakest = useMemo(() => {
    const entries = Object.entries(matrix?.domains ?? {});
    if (entries.length === 0) return null;
    return entries.sort((a, b) => a[1].score - b[1].score)[0];
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
                  Priority signal: {DOMAIN_LABELS[weakest[0] as keyof typeof DOMAIN_LABELS] ?? weakest[0]} at{" "}
                  {Math.round(weakest[1].score * 100)}% mastery
                </span>
              )}
            </div>
          </div>
        </div>
      </Reveal>

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
                        <Link to="/practice" className="hover:text-black dark:hover:text-white underline underline-offset-2">
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
              <li>1. Ranks your five competencies weakest-first from the live matrix.</li>
              <li>2. Interleaves them over six days with spacing weights 3-2-1-1-1, so fragile skills recur most.</li>
              <li>3. Pairs each focus day with an adaptive lesson, a mentored exercise, and a recall drill when mastery is under 60%.</li>
              <li>4. Day 7 re-baselines with a fresh diagnostic — then the plan rebuilds itself.</li>
            </ul>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
