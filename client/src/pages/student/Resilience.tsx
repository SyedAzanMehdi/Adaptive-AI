import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Radar, TrendingDown, TrendingUp, Compass, ArrowRight } from "lucide-react";
import api from "../../lib/api";
import { useReducedMotion } from "../../lib/anim";
import Reveal from "../../components/Reveal";
import PageHero from "../../components/PageHero";
import EmptyState from "../../components/EmptyState";

interface DomainResilience {
  domain: string;
  label: string;
  mastery: number;
  exposure: number;
  resilience: number;
  rationale: string;
  measured: boolean;
}

interface ResilienceReport {
  overallExposure: number;
  overallResilience: number;
  confidence: "low" | "medium" | "high";
  domains: DomainResilience[];
  mostExposed: DomainResilience | null;
  pivot: {
    domain: string;
    label: string;
    resilience: number;
    rationale: string;
    nextStep: string;
  } | null;
}

// Emerging, low-automation fields to explore next. Deliberately static and
// aspirational (not measured against the student's own matrix like the
// domains above) — Domain Compass™ is where they go to measure a real path
// into one of these.
const EXPLORE_NEXT = [
  { name: "AI/ML Engineering", why: "Building and evaluating the models — the layer above what AI automates." },
  { name: "Cybersecurity", why: "Adversarial, high-stakes judgment calls that resist automation by design." },
  { name: "Systems & Infrastructure", why: "Deep, cross-system reasoning under real-world constraints." },
];

function barColor(resilience: number): string {
  if (resilience >= 60) return "bg-success";
  if (resilience >= 40) return "bg-warning";
  return "bg-danger";
}

function textColor(resilience: number): string {
  if (resilience >= 60) return "text-success";
  if (resilience >= 40) return "text-warning";
  return "text-danger";
}

export default function Resilience() {
  const reduce = useReducedMotion();
  const { data, isLoading, error } = useQuery({
    queryKey: ["resilience"],
    queryFn: async () => (await api.get<ResilienceReport>("/student/resilience")).data,
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Reveal>
        <PageHero
          icon={<Radar size={13} strokeWidth={2.2} />}
          eyebrow="AI-Resilience Score™ — free for every student"
          title="How Exposed Are Your Skills to AI?"
          description="Not a generic industry forecast — this is computed from your own measured Capability Matrix, weighted by how much of your actual strength sits in work AI can already automate. It evolves as AI capability advances, not just as you learn."
        />
      </Reveal>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center text-neutral-500 text-sm">Loading your resilience report…</div>
      ) : error || !data ? (
        <EmptyState
          icon={<Radar size={26} strokeWidth={1.8} />}
          title="Couldn't load your resilience report"
          description="Something went wrong fetching your Capability Matrix. Try refreshing the page."
        />
      ) : data.domains.every((d) => !d.measured) ? (
        <EmptyState
          icon={<Radar size={26} strokeWidth={1.8} />}
          title="No measured skills yet"
          description={
            <>
              Take the adaptive diagnostic first — your AI-Resilience Score is computed from the same Capability
              Matrix it builds. <Link to="/diagnostic" className="font-bold underline underline-offset-2">Start the diagnostic</Link>.
            </>
          }
        />
      ) : (
        <>
          {/* Overall score */}
          <Reveal delay={reduce ? 0 : 0.08}>
            <div className="card !p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-black/5 dark:bg-white/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
                  Your AI-Resilience Score
                </div>
                <div className={`text-5xl sm:text-7xl font-black tracking-tight mb-2 ${textColor(data.overallResilience)}`}>
                  {data.overallResilience}
                  <span className="text-2xl sm:text-3xl text-neutral-400 dark:text-neutral-600">/100</span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed">
                  {data.overallExposure}% of your measured strength currently sits in work AI can already do —
                  confidence: <span className="font-semibold">{data.confidence}</span> ({data.domains.filter((d) => d.measured).length}/{data.domains.length} domains measured).
                </p>
              </div>
            </div>
          </Reveal>

          {/* Per-domain breakdown */}
          <Reveal delay={reduce ? 0 : 0.14}>
            <div className="card">
              <h2 className="font-bold text-base text-black dark:text-white mb-1">Domain Breakdown</h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-5">
                Ranked most-exposed first. A domain only counts once you've attempted at least one diagnostic question in it.
              </p>
              <div className="space-y-4">
                {data.domains.map((d, i) => (
                  <motion.div
                    key={d.domain}
                    initial={reduce ? {} : { x: 16, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: reduce ? 0 : 0.18 + i * 0.06, duration: 0.4, ease: "easeOut" }}
                    className={d.measured ? "" : "opacity-40"}
                  >
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200 text-xs sm:text-sm">{d.label}</span>
                      <span className={`text-xs font-black ${d.measured ? textColor(d.resilience) : "text-neutral-400"}`}>
                        {d.measured ? `${d.resilience} resilience` : "not measured"}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-neutral-950 rounded-full h-2 mb-2 overflow-hidden border border-neutral-200 dark:border-neutral-800">
                      <motion.div
                        className={`${d.measured ? barColor(d.resilience) : "bg-neutral-300 dark:bg-neutral-700"} h-2 rounded-full`}
                        initial={reduce ? undefined : { width: 0 }}
                        animate={{ width: `${d.measured ? d.resilience : 0}%` }}
                        transition={{ delay: reduce ? 0 : 0.22 + i * 0.06, duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">{d.rationale}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Most exposed + pivot */}
          <div className="grid md:grid-cols-2 gap-6">
            {data.mostExposed && (
              <Reveal delay={reduce ? 0 : 0.3}>
                <div className="card h-full">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-danger/10 border border-danger/30 text-danger flex items-center justify-center">
                      <TrendingDown size={18} strokeWidth={2} />
                    </div>
                    <h2 className="font-bold text-black dark:text-white">Most Exposed Today</h2>
                  </div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1">{data.mostExposed.label}</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{data.mostExposed.rationale}</p>
                </div>
              </Reveal>
            )}

            {data.pivot && (
              <Reveal delay={reduce ? 0 : 0.36}>
                <div className="card h-full">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-success/10 border border-success/30 text-success flex items-center justify-center">
                      <TrendingUp size={18} strokeWidth={2} />
                    </div>
                    <h2 className="font-bold text-black dark:text-white">Your Pivot Path</h2>
                  </div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1">{data.pivot.label}</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3">{data.pivot.nextStep}</p>
                  <Link to="/lessons" className="btn-secondary text-xs inline-flex items-center gap-1.5">
                    Study this domain <ArrowRight size={13} strokeWidth={2.4} />
                  </Link>
                </div>
              </Reveal>
            )}
          </div>

          {/* Explore next — emerging low-automation fields */}
          <Reveal delay={reduce ? 0 : 0.42}>
            <div className="card !p-6 !bg-black dark:!bg-white !text-white dark:!text-black !border-black dark:!border-white">
              <div className="flex items-center gap-2 mb-1">
                <Compass size={16} strokeWidth={2.2} />
                <h2 className="font-bold">Explore Next</h2>
              </div>
              <p className="text-xs text-neutral-300 dark:text-neutral-700 mb-4 max-w-2xl leading-relaxed">
                Emerging fields with structurally low automation exposure — not yet measured on your matrix, but worth
                a look. Dive deeper in Domain Compass™.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 text-xs">
                {EXPLORE_NEXT.map((f) => (
                  <div key={f.name} className="rounded-xl border border-white/25 dark:border-black/25 p-3.5">
                    <div className="font-bold mb-1.5">{f.name}</div>
                    <p className="text-neutral-300 dark:text-neutral-700 leading-relaxed">{f.why}</p>
                  </div>
                ))}
              </div>
              <Link to="/compass" className="btn-secondary text-xs inline-flex items-center gap-1.5 mt-4">
                Open Domain Compass <ArrowRight size={13} strokeWidth={2.4} />
              </Link>
            </div>
          </Reveal>
        </>
      )}
    </div>
  );
}
