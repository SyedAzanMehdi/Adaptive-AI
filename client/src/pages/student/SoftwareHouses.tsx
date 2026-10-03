import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Globe2, Plus, ExternalLink, Clock } from "lucide-react";
import api, { apiErrorMessage } from "../../lib/api";

interface SoftwareHouse {
  id: string;
  name: string;
  website: string;
  region: "pakistan" | "international";
  country: string;
  city: string;
  description: string;
  hiringFocus: string[];
  approved: boolean;
  mine: boolean;
}

const REGION_OPTIONS = [
  { value: "", label: "All regions" },
  { value: "pakistan", label: "Pakistan" },
  { value: "international", label: "International (USA, UK & more)" },
];

const emptyForm = { name: "", website: "", region: "pakistan", country: "", city: "", description: "", hiringFocus: "" };

export default function SoftwareHouses() {
  const queryClient = useQueryClient();
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const { data } = useQuery({
    queryKey: ["software-houses", region, country],
    queryFn: async () =>
      (
        await api.get<{ softwareHouses: SoftwareHouse[] }>("/software-houses", {
          params: { region: region || undefined, country: country || undefined },
        })
      ).data.softwareHouses,
  });

  const { data: mine } = useQuery({
    queryKey: ["software-houses-mine"],
    queryFn: async () => (await api.get<{ softwareHouses: SoftwareHouse[] }>("/software-houses/mine")).data.softwareHouses,
  });

  const create = useMutation({
    mutationFn: () =>
      api.post("/software-houses", {
        ...form,
        hiringFocus: form.hiringFocus
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["software-houses"] });
      queryClient.invalidateQueries({ queryKey: ["software-houses-mine"] });
      setShowAdd(false);
      setForm(emptyForm);
      setError("");
    },
    onError: (err) => setError(apiErrorMessage(err)),
  });

  const pendingCount = useMemo(() => (mine ?? []).filter((h) => !h.approved).length, [mine]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
        <button className="btn-primary text-xs inline-flex items-center gap-1.5" onClick={() => { setShowAdd((v) => !v); setError(""); }}>
          <Plus size={14} />
          {showAdd ? "Cancel" : "Add a Software House"}
        </button>
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
        {pendingCount > 0 && (
          <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 inline-flex items-center gap-1.5">
            <Clock size={13} />
            {pendingCount} of your submissions awaiting admin approval
          </span>
        )}
      </div>

      {showAdd && (
        <div className="card border-black/30 dark:border-white/30 space-y-3">
          <h2 className="font-bold text-black dark:text-white text-sm">Submit a Software House</h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Your submission goes to an admin for review before it appears in the public directory.
          </p>
          {error && <div className="bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-700 dark:text-neutral-300 rounded-xl p-3 text-xs">{error}</div>}
          <div className="grid md:grid-cols-2 gap-3">
            <input className="input" placeholder="Company name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="input" placeholder="Website (https://...)" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            <select className="input" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
              <option value="pakistan">Pakistan</option>
              <option value="international">International</option>
            </select>
            <input className="input" placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            <input className="input" placeholder="City (optional)" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <input className="input" placeholder="Hiring focus, comma-separated (e.g. Web, AI/ML)" value={form.hiringFocus} onChange={(e) => setForm({ ...form, hiringFocus: e.target.value })} />
          </div>
          <textarea
            className="input !h-20"
            placeholder="Short description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <button
            className="btn-amber text-xs font-bold disabled:opacity-50"
            disabled={create.isPending || !form.name.trim() || !form.country.trim()}
            onClick={() => create.mutate()}
          >
            {create.isPending ? "Submitting..." : "Submit for Review"}
          </button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(data ?? []).map((h) => (
          <div key={h.id} className="card border-neutral-200 dark:border-neutral-800 hover:border-black/30 dark:hover:border-white/30 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="font-bold text-sm text-black dark:text-white">{h.name}</h3>
              {h.website && (
                <a href={h.website} target="_blank" rel="noreferrer" className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 shrink-0">
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
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
