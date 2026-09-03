import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api, { apiErrorMessage } from "../../lib/api";

interface Curriculum {
  masteryThreshold: number;
  maxDiagnosticItems: number;
  minAttemptsPerDomain: number;
  cacheTtlHours: number;
  submissionLimitPerHour: number;
}

const fields: { key: keyof Curriculum; label: string; hint: string; step?: number }[] = [
  { key: "masteryThreshold", label: "Mastery threshold", hint: "Below this score, lessons are adapted (0-1)", step: 0.05 },
  { key: "maxDiagnosticItems", label: "Max diagnostic items", hint: "Maximum questions in a diagnostic run", step: 1 },
  { key: "minAttemptsPerDomain", label: "Min attempts per domain", hint: "Early completion requires this per domain", step: 1 },
  { key: "cacheTtlHours", label: "Adaptation cache TTL (hours)", hint: "How long generated lesson rewrites are reused", step: 1 },
  { key: "submissionLimitPerHour", label: "Submission limit / hour", hint: "Per-student code submissions per hour", step: 1 },
];

export default function CurriculumPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["curriculum"],
    queryFn: async () => (await api.get<{ curriculum: Curriculum }>("/admin/curriculum")).data.curriculum,
  });

  const [form, setForm] = useState<Curriculum | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (data && !form) setForm(data);
  }, [data, form]);

  const save = useMutation({
    mutationFn: () => api.patch("/admin/curriculum", form),
    onSuccess: () => {
      setMessage("Saved. Changes apply to subsequent diagnostics and adaptations.");
      queryClient.invalidateQueries({ queryKey: ["curriculum"] });
    },
    onError: (err) => setMessage(`Error: ${apiErrorMessage(err)}`),
  });

  if (!form) return <p className="text-neutral-600 dark:text-neutral-400 text-xs">Loading curriculum settings...</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-black dark:text-white">Curriculum Settings</h1>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
          Configure diagnostic limits, struggle adaptation thresholds, and platform rate limits.
        </p>
      </div>

      <div className="card space-y-5">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="label">{f.label}</label>
            <input
              type="number"
              step={f.step ?? 1}
              className="input font-mono text-xs"
              value={form[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: Number(e.target.value) })}
            />
            <p className="text-[11px] text-neutral-500 mt-1 font-sans">{f.hint}</p>
          </div>
        ))}
        <button className="btn-amber text-xs font-bold" disabled={save.isPending} onClick={() => save.mutate()}>
          {save.isPending ? "Saving..." : "Save Settings"}
        </button>
        {message && <p className="text-xs text-neutral-700 dark:text-neutral-300 font-semibold">{message}</p>}
      </div>
    </div>
  );
}
