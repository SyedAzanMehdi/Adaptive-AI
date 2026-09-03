import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import { Dna, Lock, Target } from "lucide-react";
import api from "../../lib/api";
import { prefersReducedMotion } from "../../lib/anim";
import Reveal from "../../components/Reveal";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const reduce = prefersReducedMotion();

interface DnaResponse {
  tier: "free" | "premium";
  locked: boolean;
  archetype: string;
  tagline: string;
  axes?: { axis: string; score: number; meaning: string }[];
  countermeasures?: string[];
  message?: string;
}

export default function StruggleDNA() {
  const { data, isLoading } = useQuery({
    queryKey: ["struggle-dna"],
    queryFn: async () => (await api.get<DnaResponse>("/premium/dna")).data,
  });

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-neutral-600 dark:text-neutral-400 text-sm">
        <svg className="animate-spin h-6 w-6 text-neutral-500 mb-2" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span>Sequencing cognitive struggle profile...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card text-center max-w-xl mx-auto my-8 border-black/30 dark:border-white/30">
        <p className="text-neutral-600 dark:text-neutral-400 text-sm font-semibold">Failed to load Struggle DNA profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Reveal>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-700 dark:text-neutral-300 text-xs font-semibold mb-2">
              <Dna size={13} strokeWidth={2.2} />
              Cognitive Phenotype Profiling
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-black dark:text-white tracking-tight">Struggle DNA™</h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm mt-1 max-w-xl">
              Profiling <em>how</em> you struggle — mined from your diagnostic recovery rate, edge-case sensitivity, and design choices.
            </p>
          </div>
          {data.locked && (
            <Link to="/premium" className="btn-amber text-xs font-extrabold whitespace-nowrap self-start sm:self-auto">
              Unlock Full Profile →
            </Link>
          )}
        </div>
      </Reveal>

      {/* Archetype Card */}
      <Reveal delay={0.1}>
        <motion.div
          whileHover={reduce ? {} : { scale: 1.01 }}
          className="card bg-gradient-to-r from-neutral-100 dark:from-neutral-900 via-white/60 dark:via-neutral-950/60 to-neutral-100 dark:to-neutral-900 border-black/30 dark:border-white/30 text-center relative overflow-hidden p-8"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-black/5 dark:bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2">Your Inferred Struggle Archetype</div>
          <div className="text-3xl sm:text-5xl font-black text-black dark:text-white mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-black dark:from-white via-neutral-800 dark:via-neutral-200 to-neutral-700 dark:to-neutral-300">
            {data.archetype}
          </div>
          <p className="text-neutral-700 dark:text-neutral-300 text-xs sm:text-sm max-w-lg mx-auto font-medium leading-relaxed">{data.tagline}</p>
        </motion.div>
      </Reveal>

      {data.locked ? (
        <Reveal delay={0.2}>
          <div className="card text-center max-w-xl mx-auto border-black/30 dark:border-white/30">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-700 dark:text-neutral-300 flex items-center justify-center mb-4">
              <Lock size={28} strokeWidth={1.8} />
            </div>
            <h2 className="font-extrabold text-xl text-black dark:text-white mb-2">Full 4-Axis Profile Locked</h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed mb-6 max-w-md mx-auto">
              {data.message ?? "Upgrade to Adaptive+ Premium to view your 4-axis radar profile and personalized cognitive countermeasures."}
            </p>
            <Link to="/premium" className="btn-amber text-xs font-extrabold px-8">
              Unlock Full DNA Profile
            </Link>
          </div>
        </Reveal>
      ) : (
        <>
          <Reveal delay={0.18}>
            <div className="grid lg:grid-cols-2 gap-6">
              
              {/* Radar Chart */}
              <div className="card flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-bold text-base text-black dark:text-white">4-Axis Cognitive Profile</h2>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">Resilience, Depth Tolerance, Edge Awareness, Craft</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 px-2.5 py-0.5 rounded-full">
                    Phenotype Radar
                  </span>
                </div>

                <div className="h-64 sm:h-72 w-full pt-2">
                  <Radar
                    data={{
                      labels: (data.axes ?? []).map((a) => a.axis),
                      datasets: [
                        {
                          label: "Phenotype",
                          data: (data.axes ?? []).map((a) => a.score),
                          backgroundColor: "rgba(139, 92, 246, 0.4)",
                          borderColor: "#737373",
                          borderWidth: 2,
                          pointBackgroundColor: "#a3a3a3",
                          pointBorderColor: "#fff",
                          pointRadius: 3,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      animation: reduce ? false : { duration: 900, easing: "easeOutQuart" as const },
                      scales: {
                        r: {
                          min: 0,
                          max: 100,
                          ticks: { color: "#737373", backdropColor: "transparent", font: { size: 9 }, stepSize: 25 },
                          grid: { color: "#404040" },
                          angleLines: { color: "#404040" },
                          pointLabels: { color: "#d4d4d4", font: { size: 11, weight: 600 as const } },
                        },
                      },
                      plugins: {
                        legend: { display: false },
                        tooltip: { backgroundColor: "#000000", borderColor: "#404040", borderWidth: 1 },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Axis Detail Bars */}
              <div className="space-y-3">
                {(data.axes ?? []).map((axis, i) => (
                  <motion.div
                    key={axis.axis}
                    initial={reduce ? {} : { x: 24, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: reduce ? 0 : 0.2 + i * 0.08, duration: 0.4, ease: "easeOut" }}
                    className="card !p-4"
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-bold text-neutral-800 dark:text-neutral-200 text-xs sm:text-sm">{axis.axis}</span>
                      <span className="text-xs font-black text-neutral-600 dark:text-neutral-400">{axis.score}/100</span>
                    </div>
                    <div className="bg-white dark:bg-neutral-950 rounded-full h-2 mb-2 overflow-hidden border border-neutral-200 dark:border-neutral-800">
                      <motion.div
                        className="bg-gradient-to-r from-black dark:from-white via-neutral-600 dark:via-neutral-400 to-neutral-600 dark:to-neutral-400 h-2 rounded-full"
                        initial={reduce ? undefined : { width: 0 }}
                        animate={{ width: `${axis.score}%` }}
                        transition={{ delay: reduce ? 0 : 0.3 + i * 0.08, duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed font-mono">{axis.meaning}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Countermeasures Section */}
          <Reveal delay={0.3}>
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-600 dark:text-neutral-400 flex items-center justify-center">
                  <Target size={19} strokeWidth={2} />
                </div>
                <div>
                  <h2 className="font-bold text-base text-black dark:text-white">Targeted Countermeasures for {data.archetype}s</h2>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Actionable learning strategies prescribed to coach the underlying cause of struggle</p>
                </div>
              </div>

              <div className="space-y-3">
                {(data.countermeasures ?? []).map((c, i) => (
                  <motion.div
                    key={i}
                    initial={reduce ? {} : { y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: reduce ? 0 : 0.35 + i * 0.1, duration: 0.4, ease: "easeOut" }}
                    className="p-4 rounded-2xl bg-white/60 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 flex items-start gap-3.5"
                  >
                    <div className="w-7 h-7 rounded-xl bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-600 dark:text-neutral-400 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                      #{i + 1}
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed pt-0.5">{c}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>
        </>
      )}
    </div>
  );
}
