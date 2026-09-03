import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { Zap } from "lucide-react";
import api from "../../lib/api";
import MarkdownLite from "../../components/MarkdownLite";
import { prefersReducedMotion } from "../../lib/anim";

interface LessonResponse {
  lesson: { conceptId: string; title: string; domain: string; objectives: string[] };
  content: string;
  adaptation: {
    used: boolean;
    tier?: string;
    style?: string;
    cached?: boolean;
    source?: string;
    reason?: string;
  };
}

export default function LessonPage() {
  const { conceptId } = useParams();
  const reduce = prefersReducedMotion();
  const { data, isLoading, error } = useQuery({
    queryKey: ["lesson", conceptId],
    queryFn: async () => (await api.get<LessonResponse>(`/lessons/${conceptId}`)).data,
    enabled: !!conceptId,
  });

  const fadeUp = (delay: number) => ({
    initial: reduce ? {} : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay: reduce ? 0 : delay, ease: "easeOut" as const },
  });

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center text-neutral-600 dark:text-neutral-400 text-sm">
        <svg className="animate-spin h-5 w-5 text-neutral-500 mr-2" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span>Loading lesson & evaluating adaptation triggers...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card max-w-2xl mx-auto border-black/30 dark:border-white/30 text-neutral-700 dark:text-neutral-300">
        <p className="text-sm font-semibold">Failed to load lesson content.</p>
        <Link to="/lessons" className="btn-secondary text-xs mt-3 inline-block">Back to Lessons</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div {...fadeUp(0)}>
        <Link to="/lessons" className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300">
          ← Back to All Lessons
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400 bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 px-2.5 py-0.5 rounded-full mb-2 inline-block">
              {data.lesson.domain.replace("_", " ")}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-black dark:text-white tracking-tight">{data.lesson.title}</h1>
          </div>

          <Link to="/practice" className="btn-primary text-xs font-bold whitespace-nowrap self-start sm:self-auto">
            Practice Code →
          </Link>
        </div>
      </motion.div>

      {data.adaptation.used && (
        <motion.div
          {...fadeUp(0.08)}
          className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/30 dark:border-white/30 text-xs text-neutral-800 dark:text-neutral-200 flex items-start gap-3"
        >
          <span className="animate-soft-pulse mt-0.5">
            <Zap size={18} strokeWidth={2.2} />
          </span>
          <div>
            <div className="font-bold text-neutral-700 dark:text-neutral-300 mb-0.5">
              Personalized AI Adaptation Triggered ({data.adaptation.tier} tier · {data.adaptation.style} style
              {data.adaptation.cached ? " · cached" : ""})
            </div>
            {data.adaptation.reason && (
              <p className="text-neutral-700 dark:text-neutral-300 text-xs leading-relaxed">{data.adaptation.reason}</p>
            )}
          </div>
        </motion.div>
      )}

      <motion.div {...fadeUp(0.16)} className="card !p-6 sm:!p-8 leading-relaxed">
        <MarkdownLite content={data.content} />
      </motion.div>

      <motion.div {...fadeUp(0.24)} className="flex flex-wrap gap-3">
        <Link to="/practice" className="btn-primary text-xs">
          Open Playground & Practice Code
        </Link>
        <Link to="/chat" className="btn-secondary text-xs">
          Ask AI Mentor Questions
        </Link>
      </motion.div>
    </div>
  );
}
