import { useQuery } from "@tanstack/react-query";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import api from "../../lib/api";
import { prefersReducedMotion } from "../../lib/anim";
import { useChartTheme } from "../../lib/chartTheme";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface AnalyticsData {
  users: { students: number; admins: number; suspended: number };
  diagnostic: { complete: number; inProgress: number; total: number };
  submissions: number;
  averageByDomain: Record<string, number>;
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card text-center !p-4 border-neutral-200 dark:border-neutral-800">
      <div className="text-2xl sm:text-3xl font-black text-black dark:text-white">{value}</div>
      <div className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mt-1 uppercase tracking-wider">{label}</div>
    </div>
  );
}

export default function Analytics() {
  const reduce = prefersReducedMotion();
  const ct = useChartTheme();
  const { data, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => (await api.get<AnalyticsData>("/admin/analytics")).data,
  });

  if (isLoading || !data) return <p className="text-neutral-600 dark:text-neutral-400 text-xs">Loading analytics data...</p>;

  const labels = Object.keys(data.averageByDomain).map((d) => d.replace("_", " ").toUpperCase());
  const values = Object.values(data.averageByDomain).map((avg) => Math.round(avg * 100));

  const barData = {
    labels,
    datasets: [
      {
        label: "Average Mastery",
        data: values,
        backgroundColor: ct.dark ? "rgba(229, 229, 229, 0.60)" : "rgba(23, 23, 23, 0.60)",
        hoverBackgroundColor: ct.barHover,
        borderRadius: 8,
        borderSkipped: false as const,
        maxBarThickness: 48,
      },
    ],
  };

  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: reduce ? false : { duration: 800, easing: "easeOutQuart" as const },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: ct.text, font: { size: 11, weight: 600 as const } },
      },
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
        callbacks: {
          label: (ctx: any) => ` Average Mastery: ${ctx.parsed.y}%`,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-black dark:text-white">System Analytics</h1>
        <p className="text-xs text-neutral-600 dark:text-neutral-400">Overview of student engagement, assessment completions, and average mastery.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Stat label="Students" value={data.users.students} />
        <Stat label="Admins" value={data.users.admins} />
        <Stat label="Suspended" value={data.users.suspended} />
        <Stat label="Completed Diags" value={`${data.diagnostic.complete}/${data.diagnostic.total}`} />
        <Stat label="Submissions" value={data.submissions} />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-black dark:text-white text-base">Average Mastery Score by Competency</h2>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 px-2.5 py-0.5 rounded-full">
            Aggregate Performance
          </span>
        </div>

        {labels.length === 0 ? (
          <p className="text-neutral-500 text-xs">No capability data collected yet.</p>
        ) : (
          <div className="h-64 sm:h-72 w-full pt-2">
            <Bar data={barData} options={barOptions} />
          </div>
        )}
      </div>
    </div>
  );
}
