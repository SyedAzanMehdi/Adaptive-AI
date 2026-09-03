import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  GraduationCap,
  Plane,
  CalendarClock,
  Globe,
  Landmark,
  BadgeCheck,
  Filter,
} from "lucide-react";
import api from "../../lib/api";
import { prefersReducedMotion } from "../../lib/anim";
import Reveal from "../../components/Reveal";

const reduce = prefersReducedMotion();

interface ScholarshipItem {
  id: string;
  name: string;
  country: string;
  level: string[];
  funding: "full" | "partial";
  deadline: { month: number; day: number };
  englishTest: boolean;
  gpaMin: number | null;
  fields: string[];
  summary: string;
  popularInPakistan: boolean;
  matchScore: number;
  nextDeadline: string;
  daysLeft: number;
}

interface ScholarshipResponse {
  scholarships: ScholarshipItem[];
  filters: { levels: string[]; countries: string[]; fields: string[] };
  total: number;
}

const prettyField = (f: string) => f.replace("_", " ");

function MatchRing({ score }: { score: number }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-12 h-12 shrink-0">
      <svg viewBox="0 0 44 44" className="w-full h-full -rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" strokeWidth="4" className="stroke-neutral-200 dark:stroke-neutral-800" />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          className="stroke-black dark:stroke-white"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-black dark:text-white">
        {score}
      </div>
    </div>
  );
}

export default function Scholarships() {
  const [level, setLevel] = useState("");
  const [country, setCountry] = useState("");
  const [field, setField] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["scholarships", level, country, field],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (level) params.set("level", level);
      if (country) params.set("country", country);
      if (field) params.set("field", field);
      const qs = params.toString();
      return (await api.get<ScholarshipResponse>(`/student/scholarships${qs ? `?${qs}` : ""}`)).data;
    },
  });

  const scholarships = data?.scholarships ?? [];
  const filters = data?.filters;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-white dark:from-black via-neutral-100 dark:via-neutral-900 to-white dark:to-black border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-black/5 dark:bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-800 dark:text-neutral-200 text-xs font-semibold mb-3">
              <Plane size={13} strokeWidth={2.2} />
              Scholarship Radar™ — Global Access Doctrine
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-black dark:text-white tracking-tight">
              Fully funded degrees, matched to you.
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              A curated pool of international, fully-funded scholarships with live deadline countdowns —
              built especially for students in Pakistan and the broader Global South planning to study abroad.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={reduce ? 0 : 0.08}>
        <div className="card !p-5 border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={16} strokeWidth={2.2} className="text-neutral-700 dark:text-neutral-300" />
            <h2 className="font-bold text-black dark:text-white text-sm">Narrow the radar</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="label">Degree level</label>
              <select className="input" value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="">Any level</option>
                {(filters?.levels ?? []).map((l) => (
                  <option key={l} value={l}>{prettyField(l)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Destination</label>
              <select className="input" value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value="">Anywhere</option>
                {(filters?.countries ?? []).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Field of study</label>
              <select className="input" value={field} onChange={(e) => setField(e.target.value)}>
                <option value="">Any field</option>
                {(filters?.fields ?? []).map((f) => (
                  <option key={f} value={f}>{prettyField(f)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Reveal>

      {isLoading ? (
        <div className="h-40 flex items-center justify-center text-neutral-500 text-sm">
          <svg className="animate-spin h-6 w-6 text-neutral-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      ) : scholarships.length === 0 ? (
        <div className="card text-center text-neutral-600 dark:text-neutral-400 text-sm">
          No scholarships match those filters — try widening your search.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {scholarships.map((s, i) => (
            <Reveal key={s.id} delay={reduce ? 0 : Math.min(0.05 * i, 0.3)}>
              <div className="card card-hover h-full flex flex-col gap-3 border-neutral-200 dark:border-neutral-800">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-black dark:text-white leading-snug">{s.name}</h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
                      <Globe size={12} strokeWidth={2.2} />
                      {s.country}
                    </div>
                  </div>
                  <MatchRing score={s.matchScore} />
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed flex-1">{s.summary}</p>

                <div className="flex flex-wrap gap-1.5">
                  {s.level.map((l) => (
                    <span key={l} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 capitalize">
                      {prettyField(l)}
                    </span>
                  ))}
                  {s.fields.filter((f) => f !== "any").map((f) => (
                    <span key={f} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 capitalize">
                      {prettyField(f)}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className={`inline-flex items-center gap-1 font-bold ${s.funding === "full" ? "text-black dark:text-white" : "text-neutral-600 dark:text-neutral-400"}`}>
                      <Landmark size={13} strokeWidth={2.2} />
                      {s.funding === "full" ? "Fully funded" : "Partial"}
                    </span>
                    {s.popularInPakistan && (
                      <span className="inline-flex items-center gap-1 font-semibold text-neutral-700 dark:text-neutral-300">
                        <BadgeCheck size={13} strokeWidth={2.2} />
                        PK-friendly
                      </span>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-black dark:bg-white text-white dark:text-black">
                    <CalendarClock size={13} strokeWidth={2.2} />
                    {s.daysLeft}d left
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      <Reveal delay={reduce ? 0 : 0.2}>
        <div className="card !p-5 !bg-black dark:!bg-white !text-white dark:!text-black !border-black dark:!border-white flex items-start gap-3">
          <GraduationCap size={20} strokeWidth={2} className="mt-0.5 shrink-0" />
          <p className="text-xs leading-relaxed">
            Deadlines roll over automatically to the next open cycle. Always confirm details on the official programme
            site before applying — the radar is a starting point, not a substitute for official requirements.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
