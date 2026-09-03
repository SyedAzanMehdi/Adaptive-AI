import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import { Brain, Zap, MessageSquare, Target, TrendingUp, ClipboardList, Compass, Dna, Crown, Languages, GraduationCap, Store } from "lucide-react";
import api from "../../lib/api";
import { useAuthStore } from "../../stores/auth";
import Reveal from "../../components/Reveal";
import CountUp from "../../components/CountUp";
import { prefersReducedMotion } from "../../lib/anim";
import { useChartTheme } from "../../lib/chartTheme";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface MatrixResponse {
  domains: Record<string, { score: number; confidence: number; attempts: number }>;
  diagnosticStatus: "not_started" | "in_progress" | "complete";
  historyLength: number;
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const reduce = prefersReducedMotion();
  const ct = useChartTheme();
  const { data, isLoading } = useQuery({
    queryKey: ["matrix"],
    queryFn: async () => (await api.get<MatrixResponse>("/student/matrix")).data,
  });

  const [termFilter, setTermFilter] = useState("");
  const { data: glossaryData } = useQuery({
    queryKey: ["glossary"],
    queryFn: async () =>
      (await api.get<{ glossary: { term: string; urdu: string; roman: string; meaning: string }[] }>("/student/glossary")).data,
  });
  const glossary = (glossaryData?.glossary ?? []).filter(
    (g) =>
      !termFilter ||
      g.term.toLowerCase().includes(termFilter.toLowerCase()) ||
      g.meaning.toLowerCase().includes(termFilter.toLowerCase())
  );

  const domains = data?.domains ?? {};
  const entries = Object.entries(domains);
  const labels = entries.map(([domain]) => domain.replace("_", " ").toUpperCase());
  const scores = entries.map(([, stat]) => Math.round(stat.score * 100));
  const weak = entries.filter(([, s]) => s.score < 0.6);
  const average = entries.length
    ? Math.round((entries.reduce((sum, [, s]) => sum + s.score, 0) / entries.length) * 100)
    : 0;

  const radarData = {
    labels,
    datasets: [
      {
        label: "Mastery",
        data: scores,
        backgroundColor: ct.fill,
        borderColor: ct.line,
        borderWidth: 2,
        pointBackgroundColor: ct.point,
        pointBorderColor: ct.pointBorder,
        pointRadius: 3,
      },
    ],
  };

  const radarOptions: ChartOptions<"radar"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: reduce ? false : { duration: 900, easing: "easeOutQuart" as const },
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { color: ct.ticks, backdropColor: "transparent", font: { size: 10 }, stepSize: 25 },
        grid: { color: ct.grid },
        angleLines: { color: ct.grid },
        pointLabels: { color: ct.text, font: { size: 11, weight: 600 as const } },
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
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-100 dark:from-neutral-900 via-white/60 dark:via-neutral-950/60 to-neutral-100 dark:to-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-black/5 dark:bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-700 dark:text-neutral-300 text-xs font-semibold mb-3">
                <Brain size={13} strokeWidth={2.2} />
                AI Tutor Engine Active
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-black dark:text-white tracking-tight">
                Welcome back, {user?.name}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm max-w-xl mt-2 leading-relaxed">
                Your personal capability map continuously analyzes your diagnostic responses and code submissions to tailor lessons in real-time.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link to="/diagnostic" className="btn-primary">
                <Zap size={15} strokeWidth={2.4} />
                <span>{data?.diagnosticStatus === "complete" ? "Retake Diagnostic" : "Run Diagnostic"}</span>
              </Link>
              <Link to="/chat" className="btn-secondary">
                <MessageSquare size={14} strokeWidth={2.2} />
                Ask AI
              </Link>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Quick Stats Grid */}
      {entries.length > 0 && (
        <Reveal delay={0.08}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card card-hover flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/10 border border-black/20 dark:border-white/20 text-neutral-600 dark:text-neutral-400 flex items-center justify-center">
                <Target size={21} strokeWidth={2} />
              </div>
              <div>
                <div className="text-2xl font-black text-black dark:text-white">
                  <CountUp to={entries.length} duration={0.7} />
                </div>
                <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Domains Tracked</div>
              </div>
            </div>

            <div className="card card-hover flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-600 dark:text-neutral-400 flex items-center justify-center">
                <TrendingUp size={21} strokeWidth={2} />
              </div>
              <div>
                <div className="text-2xl font-black text-neutral-600 dark:text-neutral-400">
                  <CountUp to={average} duration={0.9} suffix="%" />
                </div>
                <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Average Mastery Score</div>
              </div>
            </div>

            <div className="card card-hover flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-700 dark:text-neutral-300 flex items-center justify-center">
                <ClipboardList size={21} strokeWidth={2} />
              </div>
              <div>
                <div className="text-2xl font-black text-black dark:text-white">
                  <CountUp to={data?.historyLength ?? 0} duration={0.9} />
                </div>
                <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Diagnostic Responses</div>
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {/* Main Grid Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Radar Capability Matrix (Chart.js) */}
        <Reveal delay={0.12} className="lg:col-span-2">
          <div className="card h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-lg text-black dark:text-white">Capability Matrix</h2>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Real-time skill balance across CS competency domains</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700">
                  {entries.length || 5} Competencies
                </span>
              </div>

              {isLoading ? (
                <div className="h-64 flex items-center justify-center text-neutral-500 text-sm">
                  <svg className="animate-spin h-6 w-6 text-neutral-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                </div>
              ) : entries.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white/40 dark:bg-neutral-950/40 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
                  <Compass size={38} strokeWidth={1.6} className="text-neutral-600 dark:text-neutral-400 mb-2" />
                  <p className="text-neutral-700 dark:text-neutral-300 font-semibold text-sm">No Capability Vector Yet</p>
                  <p className="text-neutral-600 dark:text-neutral-400 text-xs mt-1 max-w-xs mb-4">
                    Take the diagnostic assessment to build your multi-axis capability map.
                  </p>
                  <Link to="/diagnostic" className="btn-primary text-xs">
                    Start Diagnostic Assessment
                  </Link>
                </div>
              ) : (
                <div className="h-72 w-full pt-2">
                  <Radar data={radarData} options={radarOptions} />
                </div>
              )}
            </div>
          </div>
        </Reveal>

        {/* Sidebar Status Cards */}
        <div className="space-y-6">
          <Reveal delay={0.2}>
            <div className="card">
              <h2 className="font-bold text-base text-black dark:text-white mb-3">Diagnostic Status</h2>
              <div className="p-3.5 rounded-xl bg-white/60 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between mb-4">
                <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Assessment Status:</span>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  {data?.diagnosticStatus?.replace("_", " ") ?? "NOT STARTED"}
                </span>
              </div>
              <Link to="/diagnostic" className="btn-primary w-full text-center text-xs">
                {data?.diagnosticStatus === "complete" ? "Review Results" : "Continue Diagnostic"}
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.28}>
            <div className="card">
              <h2 className="font-bold text-base text-black dark:text-white mb-3">Priority Focus Areas</h2>
              {weak.length === 0 ? (
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  All competencies are performing at or above target threshold (≥60%).
                </p>
              ) : (
                <div className="space-y-2.5">
                  {weak.map(([d, s]) => (
                    <div key={d} className="flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-xs">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200 capitalize">{d.replace("_", " ")}</span>
                      <span className="font-extrabold text-neutral-600 dark:text-neutral-400">{Math.round(s.score * 100)}%</span>
                    </div>
                  ))}
                </div>
              )}
              <Link to="/lessons" className="btn-secondary w-full text-center text-xs mt-4">
                Browse Adapted Lessons
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.32}>
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-base text-black dark:text-white flex items-center gap-2">
                  <Languages size={16} strokeWidth={2.2} />
                  Dual-Language Helper
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">اردو</span>
              </div>
              <input
                className="input text-xs mb-3"
                placeholder="Search a term…"
                value={termFilter}
                onChange={(e) => setTermFilter(e.target.value)}
              />
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {glossary.length === 0 ? (
                  <p className="text-xs text-neutral-500">No matching terms.</p>
                ) : (
                  glossary.map((g) => (
                    <div key={g.term} className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{g.term}</span>
                        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300" dir="rtl">
                          {g.urdu}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">{g.meaning}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Premium Innovation Teasers */}
      <div className="grid md:grid-cols-2 gap-6">
        <Reveal delay={0.34}>
          <Link to="/memory" className="card card-hover block relative group overflow-hidden bg-gradient-to-br from-neutral-100 dark:from-neutral-900 via-white/40 dark:via-neutral-950/40 to-neutral-100 dark:to-neutral-900">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-600 dark:text-neutral-400 flex items-center justify-center">
                  <Brain size={18} strokeWidth={2} />
                </div>
                <h2 className="font-bold text-black dark:text-white text-lg group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">Memory Twin™</h2>
              </div>
              {user?.plan === "premium" ? (
                <span className="badge-premium">
                  <Crown size={12} strokeWidth={2.4} />
                  Adaptive+
                </span>
              ) : (
                <span className="badge-free">Unlocked Teaser</span>
              )}
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Predict skill decay before it occurs. Exponential forgetting curves track retention and prompt 2-minute Rescue Reviews.
            </p>
          </Link>
        </Reveal>

        <Reveal delay={0.4}>
          <Link to="/dna" className="card card-hover block relative group overflow-hidden bg-gradient-to-br from-neutral-100 dark:from-neutral-900 via-white/40 dark:via-neutral-950/40 to-neutral-100 dark:to-neutral-900">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-600 dark:text-neutral-400 flex items-center justify-center">
                  <Dna size={18} strokeWidth={2} />
                </div>
                <h2 className="font-bold text-black dark:text-white text-lg group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">Struggle DNA™</h2>
              </div>
              {user?.plan === "premium" ? (
                <span className="badge-premium">
                  <Crown size={12} strokeWidth={2.4} />
                  Adaptive+
                </span>
              ) : (
                <span className="badge-free">Unlocked Teaser</span>
              )}
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Mine behavioral struggle patterns into a 4-axis cognitive phenotype (Resilience, Depth, Edge Awareness, Craft) with countermeasures.
            </p>
          </Link>
        </Reveal>
      </div>

      {/* Global Opportunity Layer */}
      <div className="grid md:grid-cols-2 gap-6">
        <Reveal delay={0.44}>
          <Link to="/scholarships" className="card card-hover block relative group overflow-hidden bg-gradient-to-br from-neutral-100 dark:from-neutral-900 via-white/40 dark:via-neutral-950/40 to-neutral-100 dark:to-neutral-900">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-600 dark:text-neutral-400 flex items-center justify-center">
                  <GraduationCap size={18} strokeWidth={2} />
                </div>
                <h2 className="font-bold text-black dark:text-white text-lg group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">Scholarship Radar™</h2>
              </div>
              <span className="badge-free">Free for all</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Fully funded international scholarships with live deadline countdowns — curated for students in Pakistan and the Global South planning to study abroad.
            </p>
          </Link>
        </Reveal>

        <Reveal delay={0.48}>
          <Link to="/freelance" className="card card-hover block relative group overflow-hidden bg-gradient-to-br from-neutral-100 dark:from-neutral-900 via-white/40 dark:via-neutral-950/40 to-neutral-100 dark:to-neutral-900">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-600 dark:text-neutral-400 flex items-center justify-center">
                  <Store size={18} strokeWidth={2} />
                </div>
                <h2 className="font-bold text-black dark:text-white text-lg group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">Freelance Launchpad™</h2>
              </div>
              <span className="badge-free">Free for all</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Turn your Capability Matrix into a marketplace-ready freelance profile — niche, skills, starter gigs, and an honest first rate.
            </p>
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
