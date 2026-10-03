import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Trash2 } from "lucide-react";
import api, { apiErrorMessage } from "../../lib/api";

interface SoftwareHouse {
  id: string;
  name: string;
  region: "pakistan" | "international";
  country: string;
  city: string;
  description: string;
  hiringFocus: string[];
  approved: boolean;
  addedBy: string | null;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "approved", label: "Published" },
  { value: "pending", label: "Unpublished" },
];

const emptyForm = { name: "", region: "pakistan", country: "", city: "", description: "", hiringFocus: "" };

export default function AdminSoftwareHouses() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const { data: houses } = useQuery({
    queryKey: ["admin-software-houses", status],
    queryFn: async () =>
      (await api.get<{ softwareHouses: SoftwareHouse[] }>("/admin/software-houses", { params: { status: status || undefined } }))
        .data.softwareHouses,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-software-houses"] });

  const create = useMutation({
    mutationFn: () =>
      api.post("/admin/software-houses", {
        ...form,
        hiringFocus: form.hiringFocus
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }),
    onSuccess: () => {
      invalidate();
      setShowAdd(false);
      setForm(emptyForm);
      setError("");
    },
    onError: (err) => setError(apiErrorMessage(err)),
  });

  const patch = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.patch(`/admin/software-houses/${id}`, body),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/software-houses/${id}`),
    onSuccess: invalidate,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-black dark:text-white">Software House Directory</h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Admin-managed only. Add, edit, unpublish, or remove entries.</p>
        </div>
        <button className="btn-primary text-xs" onClick={() => { setShowAdd((v) => !v); setError(""); }}>
          {showAdd ? "Cancel" : "+ Add Software House"}
        </button>
      </div>

      {showAdd && (
        <div className="card border-black/30 dark:border-white/30 space-y-3">
          <h2 className="font-bold text-black dark:text-white text-sm">Add Software House</h2>
          {error && <div className="bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-700 dark:text-neutral-300 rounded-xl p-3 text-xs">{error}</div>}
          <div className="grid md:grid-cols-2 gap-3">
            <input className="input" placeholder="Company name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <select className="input" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
              <option value="pakistan">Pakistan</option>
              <option value="international">International</option>
            </select>
            <input className="input" placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            <input className="input" placeholder="City (optional)" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <input className="input md:col-span-2" placeholder="Hiring focus, comma-separated (e.g. Web, AI/ML)" value={form.hiringFocus} onChange={(e) => setForm({ ...form, hiringFocus: e.target.value })} />
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
            {create.isPending ? "Adding..." : "Add to Directory"}
          </button>
        </div>
      )}

      <div className="flex gap-2">
        {STATUS_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => setStatus(o.value)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              status === o.value
                ? "bg-black dark:bg-white text-white dark:text-black border-transparent"
                : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="card !p-0 overflow-x-auto border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-white/80 dark:bg-neutral-950/80 text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 font-mono text-[11px] uppercase tracking-wider">
              <th className="px-4 py-3.5">Name</th>
              <th className="px-4 py-3.5">Region</th>
              <th className="px-4 py-3.5">Country</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
            {(houses ?? []).map((h) => (
              <tr key={h.id} className="hover:bg-neutral-100/40 dark:hover:bg-neutral-900/40 transition-colors">
                <td className="px-4 py-3 font-semibold text-neutral-800 dark:text-neutral-200">{h.name}</td>
                <td className="px-4 py-3 capitalize text-neutral-600 dark:text-neutral-400">{h.region}</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{h.country}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5 border ${
                    h.approved
                      ? "bg-black/5 dark:bg-white/5 border-black/30 dark:border-white/30 text-neutral-800 dark:text-neutral-200"
                      : "bg-neutral-200 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
                  }`}>
                    {h.approved ? "Published" : "Unpublished"}
                  </span>
                </td>
                <td className="px-4 py-3 space-x-2 whitespace-nowrap font-medium">
                  {!h.approved && (
                    <button
                      className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors inline-flex items-center gap-1"
                      onClick={() => patch.mutate({ id: h.id, body: { approved: true } })}
                    >
                      <CheckCircle2 size={12} />
                      Publish
                    </button>
                  )}
                  {h.approved && (
                    <button
                      className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors inline-flex items-center gap-1"
                      onClick={() => patch.mutate({ id: h.id, body: { approved: false } })}
                    >
                      <XCircle size={12} />
                      Unpublish
                    </button>
                  )}
                  <button
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors inline-flex items-center gap-1"
                    onClick={() => { if (confirm(`Delete "${h.name}" permanently?`)) remove.mutate(h.id); }}
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {houses && houses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">Nothing here.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
