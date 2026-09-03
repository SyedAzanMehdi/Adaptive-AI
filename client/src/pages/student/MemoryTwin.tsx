import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Lock, Activity, Rocket, AlertTriangle, CheckCircle2 } from "lucide-react";
import api from "../../lib/api";
import { useAuthStore } from "../../stores/auth";
import { prefersReducedMotion } from "../../lib/anim";
import Reveal from "../../components/Reveal";
import { useChartTheme } from "../../lib/chartTheme";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const reduce = prefersReducedMotion();

interface DomainMemory {
  domain: string;
  retention: number;
  stabilityDays: number;
  forecast: number[];
  daysUntilDanger: number | null;
}

interface MemoryResponse {
  domains: DomainMemory[];
  atRisk: DomainMemory[];
}

function LockedState() {
  return (
    <div className="card text-center max-w-xl mx-auto border-black/30 dark:border-white/30 relative overflow-hidden my-8">
      <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 dark:bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="w-16 h-16 mx-auto rounded-3xl bg-black/5 dark:bg-white/5 border border-black/30 dark:border-white/30 text-neutral-700 dark:text-neutral-300 flex items-center justify-center mb-4">
        <Lock size={28} strokeWidth={1.8} />
      </div>
      <h2 className="text-2xl font-black text-black dark:text-white mb-2">Memory Twin™ is an Adaptive+ Feature</h2>
      <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed mb-6 max-w-md mx-auto">
        Your memory follows an exponential decay curve R(t) = e^(-t/S). The Memory Twin models yours from practice timestamps and forecasts when skills fade below 50%.
      </p>
      <Link to="/premium" className="btn-amber text-xs font-extrabold px-8 inline-flex items-center gap-1.5">
        Unlock Memory Twin with Adaptive+
      </Link>
    </div>
  );
}

export default function MemoryTwin() {
  const user = useAuthStore((s) => s.user);
  const isPremium = user?.plan === "premium";
  const ct = useChartTheme();

  const { data, isLoading } = useQuery({
    queryKey: ["memory-twin"],
    queryFn: async () => (await api.get<MemoryResponse>("/premium/memory")).data,
    enabled: isPremium,
    retry: false,
  });

  if (!isPremium) return <LockedState />;
  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-neutral-600 dark:text-neutral-400 text-sm">
        <svg className="animate-spin h-6 w-6 text-neutral-500 mb-2" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span>Computing per-domain forgetting curves...</span>
      </div>
    );
  }

  if (!data || data.domains.length === 0) {
    return (
      <div className="card text-center max-w-xl mx-auto my-8">
        <h2 className="text-xl font-bold text-black dark:text-white mb-2">No Memory Traces Recorded</h2>
        <p className="text-neutral-600 dark:text-neutral-400 text-xs mb-4">
          Complete the diagnostic assessment to build your baseline Memory Twin forecast.
        </p>
        <Link to="/diagnostic" className="btn-primary text-xs inline-block">Take Diagnostic Assessment</Link>
      </div>
    );
  }

  // Average forecast across domains, day 0..14.
  const labels = Array.from({ length: 15 }, (_, day) => (day === 0 ? "Today" : `+${day}d`));
  const retention = Array.from({ length: 15 }, (_, day) =>
    Math.round((data.domains.reduce((sum, d) => sum + d.forecast[day], 0) / data.domains.length) * 100)
  );

  const lineData = {
    labels,
    datasets: [
      {
        label: "Predicted Recall",
        data: retention,
        borderColor: ct.line,
        backgroundColor: ct.fill,
        fill: true,
        tension: 0.35,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: "50% Danger Threshold",
        data: Array(15).fill(50),
        borderColor: ct.lineSoft,
        borderDash: [5, 5],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const lineOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: reduce ? false : { duration: 1000, easing: "easeOutQuart" as const },
    interaction: { mode: "index" as const, intersect: false },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: ct.text, font: { size: 10, weight: 600 as const }, maxRotation: 0 },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: ct.grid },
        ticks: { color: ct.ticks, font: { size: 10 }, stepSize: 25, callback: (v: any) => `${v}%` },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: ct.tooltipBg,
        borderColor: ct.tooltipBorder,
        borderWidth: 1,
        titleColor: ct.tooltipText,
        bodyColor: ct.tooltipText,
        filter: (item: any) => item.datasetIndex === 0,
        callbacks: { label: (ctx: any) => ` Predicted Recall: ${ctx.parsed.y}%` },
      },
    },
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Reveal>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-800 dark:text-neutral-200 text-xs font-semibold mb-2">
              <Activity size={13} strokeWidth={2.2} />
              Predictive Skill-Decay Forecast
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-black dark:text-white tracking-tight">Memory Twin™</h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm mt-1 max-w-xl">
              Fitted to your real practice history via R(t) = e^(-t/S). Predicts retention and highlights domains approaching the 50% danger line.
            </p>
          </div>
          <Link to="/rescue" className="btn-amber text-xs font-bold self-start sm:self-auto inline-flex items-center gap-1.5">
            <Rocket size={14} strokeWidth={2.2} />
            Launch Rescue Review
          </Link>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-base text-black dark:text-white">14-Day Skill Retention Forecast</h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Average predicted recall percentage over the next two weeks without practice</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400 bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 px-2.5 py-0.5 rounded-full">
              Spacing Effect Model
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>
      </Reveal>

      {/* Domain Cards */}
      <Reveal delay={0.18}>
        <div className="grid md:grid-cols-2 gap-4">
          {data.domains.map((d, i) => (
            <motion.div
              key={d.domain}
              initial={reduce ? {} : { y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: reduce ? 0 : 0.1 + i * 0.06, duration: 0.4, ease: "easeOut" }}
              className="card card-hover !p-5 flex flex-col justify-between"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-neutral-900 dark:text-neutral-100 capitalize text-sm">{d.domain.replace("_", " ")}</span>
                <span
                  className={`text-xs font-extrabold rounded-full px-3 py-0.5 border ${
                    d.retention >= 0.7
                      ? "bg-black/5 dark:bg-white/5 border-black/30 dark:border-white/30 text-neutral-700 dark:text-neutral-300"
                      : d.retention >= 0.4
                        ? "bg-black/5 dark:bg-white/5 border-black/30 dark:border-white/30 text-neutral-700 dark:text-neutral-300"
                        : "bg-black/5 dark:bg-white/5 border-black/30 dark:border-white/30 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  {Math.round(d.retention * 100)}% Recall
                </span>
              </div>

              <div className="w-full bg-white dark:bg-neutral-950 rounded-full h-2 mb-3 overflow-hidden border border-neutral-200 dark:border-neutral-800">
                <div
                  className={`h-2 rounded-full ${d.retention >= 0.7 ? "bg-black dark:bg-white" : d.retention >= 0.4 ? "bg-black dark:bg-white" : "bg-black dark:bg-white"}`}
                  style={{ width: `${Math.round(d.retention * 100)}%` }}
                />
              </div>

              <div className="text-xs text-neutral-600 dark:text-neutral-400 flex justify-between items-center pt-2 border-t border-neutral-200/80 dark:border-neutral-800/80">
                <span>Stability: <strong className="text-neutral-800 dark:text-neutral-200">{d.stabilityDays} days</strong></span>
                {d.daysUntilDanger !== null ? (
                  <span className="text-neutral-600 dark:text-neutral-400 font-bold inline-flex items-center gap-1">
                    <AlertTriangle size={12} strokeWidth={2.4} />
                    Danger in {d.daysUntilDanger === 0 ? "<1 day" : `${d.daysUntilDanger}d`}
                  </span>
                ) : (
                  <span className="text-neutral-700 dark:text-neutral-300 font-semibold inline-flex items-center gap-1">
                    <CheckCircle2 size={12} strokeWidth={2.4} />
                    Stable (&gt;14d)
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </Reveal>

      {/* Rescue Banner */}
      <Reveal delay={0.26}>
        <div className="card bg-gradient-to-r from-neutral-100 dark:from-neutral-900 via-white dark:via-neutral-950 to-neutral-100 dark:to-neutral-900 border-black/30 dark:border-white/30 text-black dark:text-white flex flex-col md:flex-row items-center justify-between gap-6 p-6 sm:p-8">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-black/10 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 text-[10px] font-bold uppercase tracking-wider mb-2">
              Micro-session Intervention
            </div>
            <h2 className="font-extrabold text-xl text-black dark:text-white">Rescue Review Micro-Session</h2>
            <p className="text-neutral-700 dark:text-neutral-300 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">
              Target your weakest memory with 2 rapid micro-questions to measurably increase memory stability days.
            </p>
          </div>
          <Link to="/rescue" className="btn-primary text-xs font-bold whitespace-nowrap inline-flex items-center gap-1.5">
            Start Rescue Session
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
