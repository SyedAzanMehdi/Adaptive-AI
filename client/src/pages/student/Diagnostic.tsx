import { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { Brain, AlertTriangle, PartyPopper, Check, X } from "lucide-react";
import api, { apiErrorMessage } from "../../lib/api";
import { prefersReducedMotion, SPRING } from "../../lib/anim";

interface Question {
  prompt: string;
  code?: string;
  choices: string[];
  domain: string;
  difficulty: number;
  rationale?: string;
}

type Phase =
  | { kind: "idle" }
  | { kind: "question"; question: Question; index: number; maxItems: number }
  | { kind: "feedback"; wasCorrect: boolean; rationale: string; next?: { question: Question; index: number }; matrix?: Record<string, unknown> }
  | { kind: "done"; matrix: Record<string, { score: number }> }
  | { kind: "error"; message: string };

const reduce = prefersReducedMotion();
const slide = reduce
  ? { initial: {}, animate: {}, exit: {}, transition: { duration: 0 } }
  : {
      initial: { x: 48, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -48, opacity: 0 },
      transition: { duration: 0.3, ease: "easeOut" as const },
    };

export default function Diagnostic() {
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [busy, setBusy] = useState(false);
  const [maxItems, setMaxItems] = useState(10);
  const queryClient = useQueryClient();

  async function start() {
    setBusy(true);
    try {
      const res = await api.post("/student/diagnostic/start");
      if (res.data.status === "complete") {
        setPhase({ kind: "done", matrix: res.data.matrix });
      } else {
        setMaxItems(res.data.maxItems);
        setPhase({
          kind: "question",
          question: res.data.question,
          index: res.data.questionIndex,
          maxItems: res.data.maxItems,
        });
      }
    } catch (err) {
      setPhase({ kind: "error", message: apiErrorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  async function answer(selectedIndex: number) {
    if (phase.kind !== "question") return;
    setBusy(true);
    try {
      const res = await api.post("/student/diagnostic/answer", { selectedIndex });
      queryClient.invalidateQueries({ queryKey: ["matrix"] });
      if (res.data.completed) {
        setPhase({ kind: "done", matrix: res.data.matrix });
      } else {
        setPhase({
          kind: "feedback",
          wasCorrect: res.data.wasCorrect,
          rationale: res.data.rationale,
          next: { question: res.data.question, index: res.data.questionIndex },
        });
      }
    } catch (err) {
      setPhase({ kind: "error", message: apiErrorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  if (phase.kind === "idle") {
    return (
      <motion.div
        initial={reduce ? {} : { y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="card max-w-2xl mx-auto text-center relative overflow-hidden"
      >
        <div className="w-16 h-16 mx-auto rounded-3xl bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-600 dark:text-neutral-400 flex items-center justify-center mb-4">
          <Brain size={30} strokeWidth={1.8} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white mb-3">Intelligent Diagnostic Assessment</h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-6 max-w-md mx-auto">
          Our AI engine generates dynamic, adaptive problem-solving questions. Correct answers elevate question difficulty, while incorrect ones pinpoint specific competency gaps.
        </p>
        <motion.button
          whileHover={reduce ? {} : { scale: 1.03 }}
          whileTap={reduce ? {} : { scale: 0.97 }}
          className="btn-primary text-sm px-8"
          onClick={start}
          disabled={busy}
        >
          {busy ? "Initializing Assessment..." : "Begin Diagnostic Assessment"}
        </motion.button>
      </motion.div>
    );
  }

  if (phase.kind === "error") {
    return (
      <div className="card max-w-2xl mx-auto border-black/30 dark:border-white/30">
        <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400 mb-3 font-semibold">
          <AlertTriangle size={18} strokeWidth={2.2} />
          <span>Diagnostic Error</span>
        </div>
        <p className="text-neutral-700 dark:text-neutral-300 text-sm mb-4">{phase.message}</p>
        <button className="btn-secondary text-xs" onClick={() => setPhase({ kind: "idle" })}>
          Retry Assessment
        </button>
      </div>
    );
  }

  if (phase.kind === "done") {
    return (
      <motion.div
        initial={reduce ? {} : { scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={reduce ? { duration: 0 } : SPRING}
        className="card max-w-2xl mx-auto border-black/30 dark:border-white/30 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-black/10 dark:bg-white/10 border border-black/30 dark:border-white/30 text-neutral-700 dark:text-neutral-300 flex items-center justify-center">
            <PartyPopper size={24} strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-black dark:text-white">Diagnostic Complete!</h1>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Your User Capability Matrix is generated and saved to database.</p>
          </div>
        </div>

        <div className="my-6 space-y-3">
          {Object.entries(phase.matrix).map(([domain, stat], i) => (
            <motion.div
              key={domain}
              initial={reduce ? {} : { x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: reduce ? 0 : 0.15 + i * 0.08, duration: 0.4, ease: "easeOut" }}
              className="p-3.5 rounded-2xl bg-white/60 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800"
            >
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-neutral-800 dark:text-neutral-200 capitalize">{domain.replace("_", " ")}</span>
                <span className="text-neutral-600 dark:text-neutral-400 font-extrabold">{Math.round(stat.score * 100)}%</span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-black dark:from-white via-neutral-600 dark:via-neutral-400 to-neutral-600 dark:to-neutral-400 h-2.5 rounded-full"
                  initial={reduce ? undefined : { width: 0 }}
                  animate={{ width: `${Math.round(stat.score * 100)}%` }}
                  transition={{ delay: reduce ? 0 : 0.3 + i * 0.08, duration: 0.7, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/" className="btn-primary text-xs">Go to Dashboard</Link>
          <Link to="/lessons" className="btn-secondary text-xs">Browse Adapted Lessons</Link>
        </div>
      </motion.div>
    );
  }

  if (phase.kind === "feedback") {
    return (
      <motion.div {...slide} key="feedback" className={`card max-w-2xl mx-auto border ${phase.wasCorrect ? "border-black/30 dark:border-white/30" : "border-black/30 dark:border-white/30"}`}>
        <div className="flex items-center gap-3 mb-3">
          <motion.div
            initial={reduce ? {} : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={reduce ? { duration: 0 } : { ...SPRING, delay: 0.1 }}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black ${
              phase.wasCorrect ? "bg-black/10 dark:bg-white/10 border border-black/40 dark:border-white/40 text-neutral-700 dark:text-neutral-300" : "bg-black/10 dark:bg-white/10 border border-black/40 dark:border-white/40 text-neutral-600 dark:text-neutral-400"
            }`}
          >
            {phase.wasCorrect ? <Check size={20} strokeWidth={3} /> : <X size={20} strokeWidth={3} />}
          </motion.div>
          <div>
            <h2 className={`text-lg font-bold ${phase.wasCorrect ? "text-neutral-700 dark:text-neutral-300" : "text-neutral-600 dark:text-neutral-400"}`}>
              {phase.wasCorrect ? "Correct Answer!" : "Incorrect"}
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Diagnostic adaptation logic updated</p>
          </div>
        </div>

        {phase.rationale && (
          <div className="p-4 rounded-xl bg-white/70 dark:bg-neutral-950/70 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs leading-relaxed mb-6 font-mono">
            {phase.rationale}
          </div>
        )}

        <button
          className="btn-primary text-xs"
          disabled={busy}
          onClick={() => {
            if (phase.next) {
              setPhase({
                kind: "question",
                question: phase.next.question,
                index: phase.next.index,
                maxItems,
              });
            }
          }}
        >
          Continue to Next Question →
        </button>
      </motion.div>
    );
  }

  const { question, index } = phase;
  return (
    <div className="card max-w-2xl mx-auto">
      <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 mb-3">
        <span className="font-semibold text-neutral-600 dark:text-neutral-400">
          Question {index + 1} of {maxItems}
        </span>
        <span className="capitalize px-2.5 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium">
          {question.domain.replace("_", " ")} · Lvl {question.difficulty}/5
        </span>
      </div>

      <div className="w-full bg-white dark:bg-neutral-950 rounded-full h-2 mb-6 overflow-hidden border border-neutral-200 dark:border-neutral-800">
        <motion.div
          className="bg-gradient-to-r from-black dark:from-white to-neutral-600 dark:to-neutral-400 h-2 rounded-full"
          animate={{ width: `${((index + 1) / maxItems) * 100}%` }}
          transition={reduce ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={index} {...slide}>
          <h2 className="text-base sm:text-lg font-bold text-black dark:text-white mb-4 leading-snug">{question.prompt}</h2>
          
          {question.code && (
            <div className="rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-4 mb-5 overflow-x-auto">
              <pre className="font-mono text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
                <code>{question.code}</code>
              </pre>
            </div>
          )}

          <div className="space-y-2.5">
            {question.choices.map((choice, idx) => (
              <motion.button
                key={idx}
                whileHover={reduce ? {} : { scale: 1.01, x: 2 }}
                disabled={busy}
                onClick={() => answer(idx)}
                className="w-full text-left p-3.5 rounded-2xl bg-white/60 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 hover:border-black/50 dark:hover:border-white/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-800 dark:text-neutral-200 text-xs sm:text-sm font-medium transition-all duration-200 disabled:opacity-50 flex items-center gap-3"
              >
                <span className="w-6 h-6 rounded-lg bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono text-neutral-600 dark:text-neutral-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{choice}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {busy && (
        <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 mt-4 animate-pulse">
          <svg className="animate-spin h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Evaluating response & adapting difficulty...</span>
        </div>
      )}
    </div>
  );
}
