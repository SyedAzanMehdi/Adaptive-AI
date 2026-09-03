import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Editor from "@monaco-editor/react";
import { AnimatePresence, motion } from "motion/react";
import { Code2, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import api, { apiErrorMessage } from "../../lib/api";
import CountUp from "../../components/CountUp";
import DomainSelect from "../../components/DomainSelect";
import { useDomainFilter } from "../../lib/domains";
import { prefersReducedMotion, SPRING } from "../../lib/anim";

const reduce = prefersReducedMotion();

interface Exercise {
  exerciseId: string;
  conceptId: string;
  domain: string;
  title: string;
  prompt: string;
  starterCode: string;
  language: string;
}

interface Evaluation {
  correct: boolean;
  scores: { correctness: number; style: number; edgeCases: number; optimization: number };
  summary: string;
  tieredGuidance: string[];
  improvements: string[];
}

interface SubmissionResponse {
  submissionId: string;
  attemptNumber: number;
  evaluation: Evaluation;
  source: "ai" | "mock";
}

function ScorePill({ label, value }: { label: string; value: number }) {
  const color =
    value >= 75
      ? "bg-black/5 dark:bg-white/5 border-black/30 dark:border-white/30 text-neutral-700 dark:text-neutral-300"
      : value >= 50
        ? "bg-black/5 dark:bg-white/5 border-black/30 dark:border-white/30 text-neutral-700 dark:text-neutral-300"
        : "bg-black/5 dark:bg-white/5 border-black/30 dark:border-white/30 text-neutral-600 dark:text-neutral-400";
  return (
    <div className={`rounded-2xl p-3 border ${color} transition-all`}>
      <div className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-0.5">{label}</div>
      <div className="text-xl font-black">
        <CountUp to={value} duration={0.8} />%
      </div>
    </div>
  );
}

export default function Playground() {
  const queryClient = useQueryClient();
  const [filter] = useDomainFilter();
  const [selectedId, setSelectedId] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [feedback, setFeedback] = useState<(SubmissionResponse & { title: string }) | null>(null);

  const { data: exercises } = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => (await api.get<{ exercises: Exercise[] }>("/submissions/exercises")).data.exercises,
  });

  const visible = useMemo(() => {
    const all = exercises ?? [];
    return filter === "all" ? all : all.filter((e) => e.domain === filter);
  }, [exercises, filter]);

  const exercise = useMemo(
    () => visible.find((e) => e.exerciseId === selectedId) ?? null,
    [visible, selectedId]
  );

  useEffect(() => {
    if (selectedId && !visible.some((e) => e.exerciseId === selectedId)) {
      setSelectedId("");
      setCode("");
      setFeedback(null);
    }
  }, [visible, selectedId]);

  const submit = useMutation({
    mutationFn: async () => {
      const res = await api.post<SubmissionResponse>("/submissions", {
        exerciseId: selectedId,
        code,
        language: exercise?.language ?? "javascript",
      });
      return res.data;
    },
    onSuccess: (data) => {
      setFeedback({ ...data, title: exercise?.title ?? "" });
      queryClient.invalidateQueries({ queryKey: ["matrix"] });
    },
  });

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 border border-black/20 dark:border-white/20 text-neutral-700 dark:text-neutral-300 text-xs font-semibold mb-2">
            <Code2 size={13} strokeWidth={2.2} />
            Interactive Code Playground
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">Code Mentorship IDE</h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm mt-1">
            Write code in the browser. The AI mentor evaluates your solution across correctness, style, edge-case handling, and optimization.
          </p>
        </div>

        {/* Exercise Selector */}
        <div className="card !p-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <DomainSelect label="Computing Domain" />
            <div>
              <label className="label">Select Coding Challenge</label>
              <select
                className="input"
                value={selectedId}
                onChange={(e) => {
                  const ex = visible.find((x) => x.exerciseId === e.target.value);
                  setSelectedId(e.target.value);
                  setCode(ex?.starterCode ?? "");
                  setFeedback(null);
                }}
              >
                <option value="">Choose an exercise...</option>
                {visible.map((ex) => (
                  <option key={ex.exerciseId} value={ex.exerciseId}>
                    {ex.title} ({ex.domain.replace("_", " ").toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>
          {exercises && visible.length === 0 && (
            <p className="text-neutral-500 text-xs mt-3">
              No coding challenges published in this domain yet — switch the focus domain above.
            </p>
          )}
        </div>

        {exercise && (
          <>
            <div className="card !p-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-base text-black dark:text-white">{exercise.title}</h2>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400 bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 px-2.5 py-0.5 rounded-full">
                  {exercise.language}
                </span>
              </div>
              <p className="text-neutral-700 dark:text-neutral-300 text-xs sm:text-sm leading-relaxed">{exercise.prompt}</p>
            </div>

            {/* Monaco Editor Component */}
            <div className="card !p-0 overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-2xl">
              <div className="bg-white dark:bg-neutral-950 px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 font-mono">
                <span>main.{exercise.language === "javascript" ? "js" : "py"}</span>
                <span>UTF-8</span>
              </div>
              <Editor
                height="340px"
                language={exercise.language}
                value={code}
                theme="vs-dark"
                onChange={(v) => setCode(v ?? "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: { top: 12 },
                  smoothScrolling: true,
                }}
              />
              <div className="p-4 bg-white/80 dark:bg-neutral-950/80 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
                <button
                  className="btn-primary text-xs"
                  disabled={!code.trim() || submit.isPending}
                  onClick={() => submit.mutate()}
                >
                  {submit.isPending ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-3.5 w-3.5 text-black dark:text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      AI Analyzing Code...
                    </span>
                  ) : (
                    "Submit Solution →"
                  )}
                </button>
                {submit.isError && (
                  <span className="text-neutral-600 dark:text-neutral-400 text-xs font-semibold">{apiErrorMessage(submit.error)}</span>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* AI Feedback Panel */}
      <div className="space-y-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base text-black dark:text-white">AI Mentor Feedback</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">4-Axis Analysis</span>
          </div>

          <AnimatePresence mode="wait">
            {!feedback ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 text-center bg-white/40 dark:bg-neutral-950/40 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800"
              >
                <span className="mb-2 flex justify-center text-neutral-600 dark:text-neutral-400">
                  <Sparkles size={26} strokeWidth={1.8} />
                </span>
                <p className="text-neutral-700 dark:text-neutral-300 font-semibold text-xs">Ready for Evaluation</p>
                <p className="text-neutral-500 text-[11px] mt-1 leading-relaxed">
                  Select an exercise, write your code in the editor, and submit to receive multi-dimensional AI feedback.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={feedback.submissionId}
                initial={reduce ? {} : { y: 20, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={reduce ? { duration: 0 } : SPRING}
                className="space-y-4"
              >
                <div
                  className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                    feedback.evaluation.correct
                      ? "bg-black/5 dark:bg-white/5 border-black/30 dark:border-white/30 text-neutral-700 dark:text-neutral-300"
                      : "bg-black/5 dark:bg-white/5 border-black/30 dark:border-white/30 text-neutral-800 dark:text-neutral-200"
                  }`}
                >
                  <span>Attempt #{feedback.attemptNumber}</span>
                  <span>{feedback.evaluation.correct ? (
                    <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} strokeWidth={2.4} /> All Checks Passed</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5"><AlertTriangle size={14} strokeWidth={2.4} /> Needs Revision</span>
                  )}</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <ScorePill label="Correctness" value={feedback.evaluation.scores.correctness} />
                  <ScorePill label="Style" value={feedback.evaluation.scores.style} />
                  <ScorePill label="Edge Cases" value={feedback.evaluation.scores.edgeCases} />
                  <ScorePill label="Optimization" value={feedback.evaluation.scores.optimization} />
                </div>

                <div className="p-3.5 rounded-xl bg-white/60 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-mono">
                  {feedback.evaluation.summary}
                </div>

                {feedback.evaluation.tieredGuidance.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Tiered Guidance</h3>
                    <ul className="text-xs text-neutral-700 dark:text-neutral-300 space-y-1.5">
                      {feedback.evaluation.tieredGuidance.map((g, i) => (
                        <motion.li
                          key={i}
                          initial={reduce ? {} : { x: -12, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: reduce ? 0 : 0.25 + i * 0.08, duration: 0.35, ease: "easeOut" }}
                          className="p-2.5 rounded-xl bg-white/40 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 flex items-start gap-2"
                        >
                          <span className="text-neutral-600 dark:text-neutral-400 font-bold">•</span>
                          <span>{g}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {feedback.evaluation.improvements.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Suggested Fixes</h3>
                    <ul className="text-xs text-neutral-700 dark:text-neutral-300 space-y-1.5">
                      {feedback.evaluation.improvements.map((g, i) => (
                        <motion.li
                          key={i}
                          initial={reduce ? {} : { x: -12, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: reduce ? 0 : 0.35 + i * 0.08, duration: 0.35, ease: "easeOut" }}
                          className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-800 dark:text-neutral-200 flex items-start gap-2"
                        >
                          <span className="text-neutral-600 dark:text-neutral-400 font-bold">•</span>
                          <span>{g}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
