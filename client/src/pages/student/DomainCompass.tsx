import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Compass, Flame, TrendingUp, ArrowRight, BookOpen, Layers, Map } from "lucide-react";
import { COMPUTING_DOMAINS, DOMAIN_FIELDS, FORECAST_YEARS, fieldOf, topViralDomains } from "../../data/computingDomains";
import { domainLabel, setDomainFilter } from "../../lib/domains";
import { prefersReducedMotion } from "../../lib/anim";
import Reveal from "../../components/Reveal";
import { useChartTheme } from "../../lib/chartTheme";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const reduce = prefersReducedMotion();

function scoreTone(score: number) {
  if (score >= 90) return "text-neutral-700 dark:text-neutral-300";
  if (score >= 80) return "text-neutral-600 dark:text-neutral-400";
  return "text-neutral-700 dark:text-neutral-300";
}

function TrendMeter({ score }: { score: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
        <span className="inline-flex items-center gap-1">
          <TrendingUp size={11} strokeWidth={2.4} />
          10-Year Viral Potential
        </span>
        <span className={scoreTone(score)}>{score}/100</span>
      </div>
      <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
        <motion.div
          initial={reduce ? {} : { width: 0 }}
          animate={{ width: `${score}%` }}
          transition={reduce ? { duration: 0 } : { duration: 0.9, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-black dark:from-white via-neutral-600 dark:via-neutral-400 to-neutral-600 dark:to-neutral-400"
        />
      </div>
    </div>
  );
}

export default function DomainCompass() {
  const navigate = useNavigate();
  const ct = useChartTheme();
  const [filter, setFilter] = useState<string>("all");
  const [domainId, setDomainId] = useState(topViralDomains[0].id);

  const domain = useMemo(() => COMPUTING_DOMAINS.find((d) => d.id === domainId) ?? COMPUTING_DOMAINS[0], [domainId]);
  const field = fieldOf(domain);

  const visible = useMemo(
    () => (filter === "all" ? COMPUTING_DOMAINS : COMPUTING_DOMAINS.filter((d) => d.field === filter)),
    [filter],
  );

  function selectDomain(id: string) {
    const next = COMPUTING_DOMAINS.find((d) => d.id === id)!;
    setDomainId(next.id);
    setFilter((f) => (f === "all" || next.field === f ? f : "all"));
    document.getElementById("compass-detail")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  const lineOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: reduce ? false : { duration: 900, easing: "easeOutQuart" },
    interaction: { mode: "index", intersect: false },
    scales: {
      x: { grid: { display: false }, ticks: { color: ct.ticks, font: { size: 10 } } },
      y: {
        min: 0,
        max: 100,
        grid: { color: ct.grid },
        ticks: { color: ct.ticks, font: { size: 10 }, stepSize: 25 },
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
        callbacks: { label: (ctx) => ` Demand Index: ${ctx.parsed.y}` },
      },
    },
  };

  const lineData = {
    labels: FORECAST_YEARS,
    datasets: [
      {
        label: "Demand Index",
        data: field.forecast,
        borderColor: ct.line,
        backgroundColor: ct.fill,
        fill: true,
        tension: 0.35,
        borderWidth: 3,
        pointRadius: 2,
        pointBackgroundColor: ct.point,
      },
    ],
  };

  function startLearningPath() {
    if (!domain.mapsTo) return;
    setDomainFilter(domain.mapsTo);
    navigate("/lessons");
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-100 dark:from-neutral-900 via-white/60 dark:via-neutral-950/60 to-neutral-100 dark:to-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-black/5 dark:bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-700 dark:text-neutral-300 text-xs font-semibold mb-3">
              <Compass size={13} strokeWidth={2.2} />
              Domain Compass™ — 10-Year Trend Radar
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-black dark:text-white tracking-tight">
              Every Computing Domain, Mapped
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              Explore {COMPUTING_DOMAINS.length} domains across {DOMAIN_FIELDS.length} fields — each with a decade-long demand
              forecast, a detailed breakdown, and a complete 4-stage study path. Pick a direction, see why it will go viral,
              and jump straight into the matching lessons.
            </p>
          </div>
        </div>
      </Reveal>

      {/* Next-decade viral picks */}
      <Reveal delay={0.1}>
        <div className="grid sm:grid-cols-3 gap-4">
          {topViralDomains.map((d, i) => (
            <motion.button
              key={d.id}
              onClick={() => selectDomain(d.id)}
              whileHover={reduce ? {} : { y: -4 }}
              className={`card text-left !p-5 border-black/20 dark:border-white/20 relative overflow-hidden ${domainId === d.id ? "ring-2 ring-black/40 dark:ring-white/40" : ""}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                  <Flame size={12} strokeWidth={2.4} />
                  Viral Pick #{i + 1}
                </span>
                <span className="text-lg font-black text-neutral-700 dark:text-neutral-300">{d.trendScore}</span>
              </div>
              <h3 className="font-bold text-black dark:text-white text-sm mb-1">{d.name}</h3>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-2">{d.blurb}</p>
            </motion.button>
          ))}
        </div>
      </Reveal>

      {/* Field filter chips */}
      <Reveal delay={0.16}>
        <div className="card !p-5">
          <span className="label inline-flex items-center gap-1.5">
            <Layers size={12} strokeWidth={2.4} />
            Field ({visible.length} {visible.length === 1 ? "domain" : "domains"})
          </span>
          <div className="flex flex-wrap gap-2 mt-1">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filter === "all"
                  ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                  : "bg-white/40 dark:bg-neutral-950/40 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
              }`}
            >
              All Fields
            </button>
            {DOMAIN_FIELDS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  filter === f.id
                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                    : "bg-white/40 dark:bg-neutral-950/40 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Domain grid */}
      <Reveal delay={0.2}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map((d) => (
            <button
              key={d.id}
              onClick={() => selectDomain(d.id)}
              className={`card text-left !p-4 flex flex-col gap-2 transition-all ${
                d.id === domainId
                  ? "ring-2 ring-black/40 dark:ring-white/40 border-black/40 dark:border-white/40"
                  : "hover:border-neutral-300 dark:hover:border-neutral-700"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-black dark:text-white text-sm leading-snug">{d.name}</h3>
                <span className={`text-sm font-black shrink-0 ${scoreTone(d.trendScore)}`}>{d.trendScore}</span>
              </div>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-2">{d.blurb}</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mt-auto">
                <Map size={11} strokeWidth={2.4} />
                Study path
              </span>
            </button>
          ))}
        </div>
      </Reveal>

      {/* Domain detail */}
      <div id="compass-detail" className="grid lg:grid-cols-2 gap-6 scroll-mt-24">
        <Reveal delay={0.24}>
          <div className="card h-full flex flex-col gap-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">{field.name}</span>
                <h2 className="font-bold text-lg text-black dark:text-white">{domain.name}</h2>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                {field.group}
              </span>
            </div>

            <TrendMeter score={domain.trendScore} />

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mb-2">About This Domain</h3>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">{domain.description}</p>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mb-3">
                Study Path — {domain.name}
              </h3>
              <div className="space-y-3">
                {domain.path.map((step, i) => (
                  <div
                    key={step.stage}
                    className="flex gap-3 p-3 rounded-2xl bg-white/60 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800"
                  >
                    <span className="shrink-0 w-7 h-7 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-black flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                        Stage {i + 1} · {step.stage}
                      </p>
                      <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed mt-0.5">{step.focus}</p>
                      <p className="text-[11px] text-neutral-500 leading-relaxed mt-1">
                        <span className="font-semibold text-neutral-600 dark:text-neutral-400">Milestone:</span> {step.milestone}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {domain.mapsTo && (
              <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20">
                <p className="text-[11px] text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  Your platform trains this directly — sets focus to {domainLabel(domain.mapsTo)} and opens matching lessons.
                </p>
                <button className="btn-primary text-xs inline-flex items-center gap-1.5 shrink-0" onClick={startLearningPath}>
                  <BookOpen size={13} strokeWidth={2.2} />
                  Learn {domainLabel(domain.mapsTo)}
                  <ArrowRight size={12} strokeWidth={2.4} />
                </button>
              </div>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.28}>
          <div className="card h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-base text-black dark:text-white">Demand Forecast 2026–2036</h2>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Relative industry demand index for {field.name}
                </p>
              </div>
            </div>
            <div className="h-56 sm:h-64 w-full pt-2">
              <Line data={lineData} options={lineOptions} />
            </div>

            <div className="mt-5 p-4 rounded-2xl bg-white/60 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mb-2 inline-flex items-center gap-1.5">
                <Flame size={12} strokeWidth={2.4} />
                Field Outlook
              </h3>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">{field.outlook}</p>
            </div>

            <div className="mt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
                Siblings in {field.name}
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {COMPUTING_DOMAINS.filter((d) => d.field === domain.field && d.id !== domain.id).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => selectDomain(s.id)}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl border bg-white/40 dark:bg-neutral-950/40 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-left transition-all"
                  >
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{s.name}</span>
                    <span className={`text-xs font-black ${scoreTone(s.trendScore)}`}>{s.trendScore}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
