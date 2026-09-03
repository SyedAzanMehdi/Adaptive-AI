import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { BookOpen, SearchX } from "lucide-react";
import api from "../../lib/api";
import { prefersReducedMotion } from "../../lib/anim";
import DomainSelect from "../../components/DomainSelect";
import { domainLabel, useDomainFilter } from "../../lib/domains";

const reduce = prefersReducedMotion();

interface LessonSummary {
  _id: string;
  conceptId: string;
  title: string;
  domain: string;
  objectives: string[];
}

export default function Lessons() {
  const [filter, setFilter] = useDomainFilter();
  const { data, isLoading } = useQuery({
    queryKey: ["lessons"],
    queryFn: async () => (await api.get<{ lessons: LessonSummary[] }>("/lessons")).data.lessons,
  });

  const lessons = data ?? [];
  const filtered = filter === "all" ? lessons : lessons.filter((l) => l.domain === filter);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <motion.div
        initial={reduce ? {} : { y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 border border-black/20 dark:border-white/20 text-neutral-700 dark:text-neutral-300 text-xs font-semibold mb-2">
          <BookOpen size={13} strokeWidth={2.2} />
          Curriculum Catalog
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-black dark:text-white tracking-tight">Adaptive Lessons</h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm mt-1 max-w-xl">
          Lessons automatically adapt when the AI tutor detects struggle with a competency domain.
        </p>
      </motion.div>

      <motion.div
        initial={reduce ? {} : { y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: reduce ? 0 : 0.08, duration: 0.4, ease: "easeOut" }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-3"
      >
        <div className="w-full sm:w-80">
          <DomainSelect />
        </div>
        {!isLoading && (
          <span className="text-xs text-neutral-500 font-medium sm:pb-2.5">
            Showing {filtered.length} of {lessons.length} lessons
          </span>
        )}
      </motion.div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center text-neutral-500 text-sm">
          <svg className="animate-spin h-5 w-5 text-neutral-500 mr-2" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Loading curriculum catalog...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center p-10 bg-white/40 dark:bg-neutral-950/40 border-dashed">
          <SearchX size={34} strokeWidth={1.6} className="mx-auto text-neutral-600 dark:text-neutral-400 mb-3" />
          <h2 className="font-bold text-black dark:text-white mb-1">No Lessons in This Domain Yet</h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-xs mb-4 max-w-sm mx-auto">
            The adaptive catalog has no {domainLabel(filter)} lessons published right now. Switch domains or view the full curriculum.
          </p>
          <button className="btn-primary text-xs" onClick={() => setFilter("all")}>
            Show All Domains
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {filtered.map((lesson, i) => (
            <motion.div
              key={lesson.conceptId}
              initial={reduce ? {} : { y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: reduce ? 0 : 0.1 + i * 0.08, duration: 0.45, ease: "easeOut" }}
              whileHover={reduce ? {} : { y: -4 }}
            >
              <Link to={`/lessons/${lesson.conceptId}`} className="card card-hover block h-full flex flex-col justify-between !p-6">
                <div>
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <h2 className="font-bold text-black dark:text-white text-base sm:text-lg hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
                      {lesson.title}
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700 rounded-full px-2.5 py-0.5 whitespace-nowrap">
                      {lesson.domain.replace("_", " ")}
                    </span>
                  </div>
                  <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5 mb-4">
                    {lesson.objectives.slice(0, 3).map((o, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <span className="text-neutral-600 dark:text-neutral-400 font-bold">•</span>
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300">
                  <span>Open Lesson</span>
                  <span>→</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
