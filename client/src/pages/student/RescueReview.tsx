import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import api, { apiErrorMessage } from "../../lib/api";
import { useAuthStore } from "../../stores/auth";
import { prefersReducedMotion, SPRING } from "../../lib/anim";

const reduce = prefersReducedMotion();

interface Question {
  prompt: string;
  code?: string;
  choices: string[];
  rationale?: string;
}

type Phase =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "question"; meta: { domain: string; retention: number }; question: Question; index: number; total: number }
  | { kind: "feedback"; wasCorrect: boolean; rationale: string; next?: { question: Question; index: number }; meta: { domain: string; retention: number }; total: number }
  | { kind: "done"; domain: string; newRetention: number | null; stabilityDays: number | null; message: string }
  | { kind: "error"; message: string };

export default function RescueReview() {
  const user = useAuthStore((s) => s.user);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const queryClient = useQueryClient();

  if (user?.plan !== "premium" && user?.role !== "admin") {
    return <Navigate to="/premium" replace />;
  }

  async function start() {
    setPhase({ kind: "loading" });
    try {
      const res = await api.post("/premium/memory/rescue");
      setPhase({
        kind: "question",
        meta: { domain: res.data.domain, retention: res.data.retention },
        question: res.data.question,
        index: 0,
        total: res.data.totalQuestions,
      });
    } catch (err) {
      setPhase({ kind: "error", message: apiErrorMessage(err) });
    }
  }

  async function answer(selectedIndex: number) {
    if (phase.kind !== "question") return;
    try {
      const res = await api.post("/premium/memory/rescue/answer", { selectedIndex });
      queryClient.invalidateQueries({ queryKey: ["memory-twin"] });
      if (res.data.completed) {
        setPhase({
          kind: "done",
          domain: res.data.domain,
          newRetention: res.data.newRetention,
          stabilityDays: res.data.stabilityDays,
          message: res.data.message,
        });
      } else {
        setPhase({
          kind: "feedback",
          wasCorrect: res.data.wasCorrect,
          rationale: res.data.rationale,
          next: { question: res.data.question, index: res.data.questionIndex },
          meta: phase.meta,
          total: phase.total,
        });
      }
    } catch (err) {
      setPhase({ kind: "error", message: apiErrorMessage(err) });
    }
  }

  if (phase.kind === "idle") {
    return (
      <motion.div
        initial={reduce ? {} : { y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="card max-w-2xl mx-auto text-center"
      >
        <h1 className="text-2xl font-bold text-black dark:text-white mb-3">Rescue Review</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          Two quick questions targeting your weakest memory trace. Each successful recall
          measurably increases that domain's memory stability.
        </p>
        <button className="btn-primary" onClick={start}>Begin rescue</button>
      </motion.div>
    );
  }

  if (phase.kind === "loading") {
    return <div className="card max-w-2xl mx-auto text-center text-neutral-500">Analyzing your memory traces...</div>;
  }

  if (phase.kind === "error") {
    return (
      <div className="card max-w-2xl mx-auto">
        <p className="text-neutral-700 dark:text-neutral-300">{phase.message}</p>
        <Link to="/memory" className="btn-secondary mt-4 inline-block">Back to Memory Twin</Link>
      </div>
    );
  }

  if (phase.kind === "done") {
    return (
      <motion.div
        initial={reduce ? {} : { scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={reduce ? { duration: 0 } : SPRING}
        className="card max-w-2xl mx-auto text-center"
      >
        <motion.div
          initial={reduce ? {} : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={reduce ? { duration: 0 } : { ...SPRING, delay: 0.15 }}
          className="w-16 h-16 mx-auto rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-4"
        >
          <CheckCircle2 size={34} strokeWidth={2} />
        </motion.div>
        <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Rescue complete</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">{phase.message}</p>
        {phase.newRetention !== null && (
          <div className="flex justify-center gap-8 mb-6">
            <div>
              <div className="text-2xl font-bold text-black dark:text-white">{Math.round(phase.newRetention * 100)}%</div>
              <div className="text-xs text-neutral-500">recall now</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-black dark:text-white">{phase.stabilityDays}d</div>
              <div className="text-xs text-neutral-500">memory stability</div>
            </div>
          </div>
        )}
        <div className="flex justify-center gap-3">
          <Link to="/memory" className="btn-primary">Back to Memory Twin</Link>
          <button className="btn-secondary" onClick={() => setPhase({ kind: "idle" })}>Rescue again</button>
        </div>
      </motion.div>
    );
  }

  if (phase.kind === "feedback") {
    return (
      <div className="card max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <motion.span
            initial={reduce ? {} : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={reduce ? { duration: 0 } : { ...SPRING, delay: 0.1 }}
            className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-black dark:text-white text-xl font-bold ${phase.wasCorrect ? "bg-black dark:bg-white" : "bg-neutral-400"}`}
          >
            {phase.wasCorrect ? "\u2713" : "\u2717"}
          </motion.span>
          <h2 className={`text-xl font-bold `}>
            {phase.wasCorrect ? "Memory reinforced" : "Trace weakened"}
          </h2>
        </div>
        {phase.rationale && <p className="text-neutral-600 dark:text-neutral-400 mb-6">{phase.rationale}</p>}
        <button
          className="btn-primary"
          onClick={() => {
            if (phase.next) {
              setPhase({ kind: "question", meta: phase.meta, question: phase.next.question, index: phase.next.index, total: phase.total });
            }
          }}
        >
          Continue
        </button>
      </div>
    );
  }

  const { question, index, total, meta } = phase;
  return (
    <div className="card max-w-2xl mx-auto">
      <div className="flex justify-between text-sm text-neutral-500 mb-3">
        <span>Rescue question {index + 1} of {total}</span>
        <span className="capitalize">
          {meta.domain.replace("_", " ")} · recall {Math.round(meta.retention * 100)}%
        </span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={reduce ? {} : { x: 48, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -48, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <h2 className="text-lg font-semibold text-black dark:text-white mb-3">{question.prompt}</h2>
          {question.code && (
            <pre className="bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-lg p-4 text-sm overflow-x-auto mb-4">
              <code>{question.code}</code>
            </pre>
          )}
          <div className="space-y-2">
            {question.choices.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => answer(idx)}
                className="w-full text-left border border-neutral-300 dark:border-neutral-700 rounded-lg px-4 py-3 hover:border-black dark:hover:border-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <span className="font-mono text-neutral-600 dark:text-neutral-400 mr-2">{String.fromCharCode(65 + idx)}.</span>
                {choice}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
