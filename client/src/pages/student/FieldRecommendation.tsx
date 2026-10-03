import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import "../../lib/chartSetup";
import { Compass as CompassIcon, Sparkles, ListChecks, AlertTriangle } from "lucide-react";
import api, { apiErrorMessage } from "../../lib/api";
import { CAREER_FIELDS, type FieldRecommendation as FieldRecommendationType } from "@edu/shared";
import { useChartTheme } from "../../lib/chartTheme";

export default function FieldRecommendation() {
  const theme = useChartTheme();

  const { data, isLoading, error } = useQuery({
    queryKey: ["field-recommendation"],
    queryFn: async () =>
      (await api.get<{ recommendation: FieldRecommendationType; source: "ai" | "mock" }>("/student/field-recommendation")).data,
    retry: false,
  });

  const field = useMemo(
    () => CAREER_FIELDS.find((f) => f.name === data?.recommendation.recommendedField),
    [data]
  );

  const lineOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: theme.ticks, font: { size: 10 } } },
      y: { grid: { color: theme.grid }, ticks: { color: theme.ticks, font: { size: 10 } }, min: 0, max: 100 },
    },
  };

  const lineData = field
    ? {
        labels: field.forecast.map((p) => p.year),
        datasets: [
          {
            label: field.name,
            data: field.forecast.map((p) => p.demandIndex),
            borderColor: theme.line,
            backgroundColor: theme.fill,
            fill: true,
            tension: 0.35,
            pointRadius: 3,
          },
        ],
      }
    : null;

  if (isLoading) {
    return <div className="flex justify-center py-16 text-neutral-600 dark:text-neutral-400 text-sm">Analyzing your capability matrix...</div>;
  }

  if (error) {
    const code = (error as any)?.response?.data?.error?.code;
    return (
      <div className="card border-black/30 dark:border-white/30 max-w-lg mx-auto text-center py-10">
        <AlertTriangle size={24} className="mx-auto mb-3 text-neutral-500" />
        <h2 className="font-bold text-black dark:text-white mb-1">
          {code === "DIAGNOSTIC_INCOMPLETE" ? "Finish a bit more of your diagnostic first" : "Could not load a recommendation"}
        </h2>
        <p className="text-xs text-neutral-600 dark:text-neutral-400">{apiErrorMessage(error)}</p>
      </div>
    );
  }

  const rec = data!.recommendation;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0 shadow-lg">
          <CompassIcon size={20} strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-black dark:text-white">Your Recommended Field</h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Built from your actual diagnostic scores, not a guess.{" "}
            {data?.source === "mock" && <span className="opacity-70">(deterministic fallback — AI mentor unavailable right now)</span>}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-5">
        <div className="card border-black/30 dark:border-white/30 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-neutral-700 dark:text-neutral-300" />
            <h2 className="text-xl font-bold text-black dark:text-white">{rec.recommendedField}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5 border border-black/30 dark:border-white/30 bg-black/5 dark:bg-white/5 text-neutral-700 dark:text-neutral-300">
              {Math.round(rec.confidence * 100)}% confidence
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5 border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400">
              maps to {rec.mapsToDomain.replace("_", " ")}
            </span>
          </div>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{rec.rationale}</p>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2 flex items-center gap-1.5">
              <ListChecks size={13} />
              Step-by-step plan
            </h3>
            <ol className="space-y-2">
              {rec.steps.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-neutral-700 dark:text-neutral-300">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[11px] font-bold flex items-center justify-center text-neutral-600 dark:text-neutral-400">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-4">
          {lineData && (
            <div className="card border-neutral-200 dark:border-neutral-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                Illustrative demand trend (not sourced market data)
              </h3>
              <div className="h-48">
                <Line options={lineOptions} data={lineData} />
              </div>
            </div>
          )}

          {rec.alternativeFields.length > 0 && (
            <div className="card border-neutral-200 dark:border-neutral-800 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Also worth considering</h3>
              {rec.alternativeFields.map((alt) => (
                <div key={alt.name} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80 p-3">
                  <p className="text-xs font-bold text-black dark:text-white mb-0.5">{alt.name}</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">{alt.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
