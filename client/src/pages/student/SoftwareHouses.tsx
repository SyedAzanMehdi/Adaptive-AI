import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, Globe2 } from "lucide-react";
import api from "../../lib/api";

interface SoftwareHouse {
  id: string;
  name: string;
  region: "pakistan" | "international";
  country: string;
  city: string;
  description: string;
  hiringFocus: string[];
}

const REGION_OPTIONS = [
  { value: "", label: "All regions" },
  { value: "pakistan", label: "Pakistan" },
  { value: "international", label: "International (USA, UK & more)" },
];

export default function SoftwareHouses() {
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("");

  const { data } = useQuery({
    queryKey: ["software-houses", region, country],
    queryFn: async () =>
      (
        await api.get<{ softwareHouses: SoftwareHouse[] }>("/software-houses", {
          params: { region: region || undefined, country: country || undefined },
        })
      ).data.softwareHouses,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0 shadow-lg">
          <Building2 size={20} strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-black dark:text-white">Software House Directory</h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            {data?.length ?? 0} companies listed — Pakistan and international markets.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select className="input !w-auto" value={region} onChange={(e) => setRegion(e.target.value)}>
          {REGION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <input
          className="input !w-auto"
          placeholder="Filter by country (e.g. United States)"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(data ?? []).map((h) => (
          <div key={h.id} className="card border-neutral-200 dark:border-neutral-800 hover:border-black/30 dark:hover:border-white/30 transition-colors">
            <h3 className="font-bold text-sm text-black dark:text-white mb-1.5">{h.name}</h3>
            <p className="text-[11px] text-neutral-500 font-medium mb-2 inline-flex items-center gap-1">
              <Globe2 size={11} />
              {h.city ? `${h.city}, ` : ""}{h.country}
            </p>
            {h.description && <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-2">{h.description}</p>}
            {h.hiringFocus.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {h.hiringFocus.map((tag) => (
                  <span key={tag} className="text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {data && data.length === 0 && (
          <p className="text-xs text-neutral-500 col-span-full py-8 text-center">No companies match these filters yet.</p>
        )}
      </div>
    </div>
  );
}
