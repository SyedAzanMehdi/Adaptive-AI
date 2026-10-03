import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  ClipboardList,
  Plus,
  Trash2,
  ExternalLink,
  MapPin,
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  RefreshCcw,
  Rocket,
  X,
} from "lucide-react";
import api, { apiErrorMessage } from "../../lib/api";
import { prefersReducedMotion, useReducedMotion } from "../../lib/anim";
import Reveal from "../../components/Reveal";
import ErrorBanner from "../../components/ErrorBanner";
import EmptyState from "../../components/EmptyState";

let reduce = prefersReducedMotion();

type Stage = "saved" | "applied" | "screening" | "interview" | "offer" | "rejected";

interface Application {
  id: string;
  company: string;
  role: string;
  stage: Stage;
  stageLabel: string;
  location: string | null;
  url: string | null;
  salaryBand: string | null;
  notes: string | null;
  nextActionAt: string | null;
  daysInStage: number;
  daysInPipeline: number;
  overdue: boolean;
  stageChanges: number;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  byStage: Record<Stage, number>;
  active: number;
  submitted: number;
  progressed: number;
  responseRate: number;
  overdue: number;
  avgDaysToClose: number | null;
  headline: string;
}

interface ListResponse {
  stages: Array<{ stage: Stage; label: string }>;
  stats: Stats;
  applications: Application[];
}

interface FormState {
  company: string;
  role: string;
  stage: Stage;
  location: string;
  url: string;
  salaryBand: string;
  nextActionAt: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  company: "",
  role: "",
  stage: "saved",
  location: "",
  url: "",
  salaryBand: "",
  nextActionAt: "",
  notes: "",
};

/** Trim empties so a PATCH never overwrites a stored value with a blank one. */
function payload(form: FormState) {
  return {
    company: form.company.trim(),
    role: form.role.trim(),
    stage: form.stage,
    location: form.location.trim() || undefined,
    url: form.url.trim() || undefined,
    salaryBand: form.salaryBand.trim() || undefined,
    nextActionAt: form.nextActionAt || undefined,
    notes: form.notes.trim() || undefined,
  };
}

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function Pipeline() {
  reduce = useReducedMotion();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Stage | "all">("all");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const list = useQuery({
    queryKey: ["applications"],
    queryFn: async () => (await api.get<ListResponse>("/applications")).data,
  });

  const create = useMutation({
    mutationFn: async () => (await api.post<{ application: Application }>("/applications", payload(form))).data,
    onSuccess: () => {
      setForm(EMPTY_FORM);
      setAdding(false);
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const advance = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: Stage }) =>
      (await api.patch<{ application: Application }>(`/applications/${id}`, { stage })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applications"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => (await api.delete<{ id: string }>(`/applications/${id}`)).data,
    onSuccess: () => {
      setConfirmId(null);
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const stats = list.data?.stats;
  const stages = list.data?.stages ?? [];
  const visible = filter === "all" ? (list.data?.applications ?? []) : (list.data?.applications ?? []).filter((a) => a.stage === filter);

  const statTiles = stats
    ? [
        { label: "In pipeline", value: String(stats.active), hint: `${stats.total} tracked in total` },
        { label: "Submitted", value: String(stats.submitted), hint: "Everything past Saved" },
        { label: "Response rate", value: `${stats.responseRate}%`, hint: `${stats.progressed} moved to screening or beyond` },
        {
          label: "Avg days to close",
          value: stats.avgDaysToClose === null ? "—" : String(stats.avgDaysToClose),
          hint: "Offer or rejection, once one lands",
        },
      ]
    : [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-white dark:from-black via-neutral-100 dark:via-neutral-900 to-white dark:to-black border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-black/5 dark:bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-800 dark:text-neutral-200 text-xs font-semibold mb-3">
              <ClipboardList size={13} strokeWidth={2.2} />
              Application Pipeline™ — free for every student
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-black dark:text-white tracking-tight">
              Track Every Application. Know Your Real Response Rate.
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              Saved rows do not count against you — only what you actually sent. The response rate and
              days-to-close are computed server-side so the number you see is the number the platform
              reports everywhere else, including your Time-to-Ready ETA.
            </p>
          </div>
        </div>
      </Reveal>

      {/* Stats */}
      {stats && (
        <Reveal delay={reduce ? 0 : 0.08}>
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {statTiles.map((tile) => (
                <div key={tile.label} className="card !p-5 border-neutral-200 dark:border-neutral-800 text-center">
                  <div className="text-3xl font-black text-black dark:text-white tabular-nums">{tile.value}</div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mt-1">
                    {tile.label}
                  </div>
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug">{tile.hint}</div>
                </div>
              ))}
            </div>

            <div className="card !p-5 !bg-black dark:!bg-white !text-white dark:!text-black !border-black dark:!border-white">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Where you stand</span>
              <p className="text-sm font-bold mt-1 leading-relaxed">{stats.headline}</p>
              {stats.overdue > 0 && (
                <p className="inline-flex items-center gap-1.5 text-[11px] font-bold mt-2">
                  <AlertTriangle size={12} strokeWidth={2.4} />
                  {stats.overdue} application{stats.overdue === 1 ? "" : "s"} past the follow-up date you set.
                </p>
              )}
            </div>
          </div>
        </Reveal>
      )}

      {/* Add / filter bar */}
      <Reveal delay={reduce ? 0 : 0.12}>
        <div className="card !p-5 border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-colors ${
                  filter === "all"
                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                    : "border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-black dark:hover:border-white"
                }`}
              >
                All {stats ? `(${stats.total})` : ""}
              </button>
              {stages.map((s) => (
                <button
                  key={s.stage}
                  onClick={() => setFilter(s.stage)}
                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-colors ${
                    filter === s.stage
                      ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                      : "border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-black dark:hover:border-white"
                  }`}
                >
                  {s.label} {stats ? `(${stats.byStage[s.stage] ?? 0})` : ""}
                </button>
              ))}
            </div>
            <button
              className="btn-primary !py-2 !px-4 text-xs inline-flex items-center gap-2"
              onClick={() => {
                setAdding((v) => !v);
                create.reset();
              }}
            >
              {adding ? <X size={13} strokeWidth={2.6} /> : <Plus size={13} strokeWidth={2.6} />}
              {adding ? "Close" : "Add application"}
            </button>
          </div>

          {adding && (
            <motion.div initial={reduce ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5 pt-5 border-t border-neutral-200 dark:border-neutral-800">
                <div>
                  <label className="label">Company</label>
                  <input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme Corp" />
                </div>
                <div>
                  <label className="label">Role</label>
                  <input className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Frontend Engineer" />
                </div>
                <div>
                  <label className="label">Stage</label>
                  <select className="input" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as Stage })}>
                    {stages.map((s) => (
                      <option key={s.stage} value={s.stage}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Location (optional)</label>
                  <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Remote / Berlin" />
                </div>
                <div>
                  <label className="label">Posting URL (optional)</label>
                  <input className="input" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://…" />
                </div>
                <div>
                  <label className="label">Salary band (optional)</label>
                  <input className="input" value={form.salaryBand} onChange={(e) => setForm({ ...form, salaryBand: e.target.value })} placeholder="$90k–$120k" />
                </div>
                <div>
                  <label className="label">Follow-up date (optional)</label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={form.nextActionAt}
                    onChange={(e) => setForm({ ...form, nextActionAt: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Notes (optional)</label>
                  <input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Referrer, next step, what they asked for…" />
                </div>
              </div>

              {create.error && <ErrorBanner message={apiErrorMessage(create.error)} className="mt-4" />}

              <button
                className="btn-primary mt-4 inline-flex items-center gap-2"
                disabled={create.isPending || form.company.trim().length === 0 || form.role.trim().length === 0}
                onClick={() => create.mutate()}
              >
                {create.isPending ? (
                  <>
                    <RefreshCcw size={14} strokeWidth={2.2} className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} strokeWidth={2.2} />
                    Save application
                  </>
                )}
              </button>
            </motion.div>
          )}
        </div>
      </Reveal>

      {/* Rows */}
      <Reveal delay={reduce ? 0 : 0.16}>
        <div className="space-y-3">
          {advance.error && <ErrorBanner message={apiErrorMessage(advance.error)} />}

          {visible.map((app) => (
            <motion.div
              key={app.id}
              layout={reduce ? false : undefined}
              className="card !p-5 border-neutral-200 dark:border-neutral-800"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-black text-black dark:text-white">{app.company}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                        app.stage === "offer"
                          ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                          : app.stage === "rejected"
                            ? "border-neutral-300 dark:border-neutral-700 text-neutral-400 line-through"
                            : "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      {app.stageLabel}
                    </span>
                    {app.overdue && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-300">
                        <AlertTriangle size={10} strokeWidth={2.6} />
                        Overdue
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mt-0.5">{app.role}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                    <span>{app.daysInStage}d in stage</span>
                    <span>{app.daysInPipeline}d in pipeline</span>
                    <span>{app.stageChanges} stage change{app.stageChanges === 1 ? "" : "s"}</span>
                    {app.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={10} strokeWidth={2.4} />
                        {app.location}
                      </span>
                    )}
                    {app.nextActionAt && (
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock size={10} strokeWidth={2.4} />
                        Follow up {formatDate(app.nextActionAt)}
                      </span>
                    )}
                    {app.salaryBand && <span>{app.salaryBand}</span>}
                    {app.url && (
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-bold hover:text-black dark:hover:text-white transition-colors"
                      >
                        <ExternalLink size={10} strokeWidth={2.4} />
                        Posting
                      </a>
                    )}
                  </div>
                  {app.notes && (
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed mt-2">{app.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    className="input !py-1.5 !text-[11px] !w-auto"
                    value={app.stage}
                    disabled={advance.isPending}
                    onChange={(e) => advance.mutate({ id: app.id, stage: e.target.value as Stage })}
                  >
                    {stages.map((s) => (
                      <option key={s.stage} value={s.stage}>{s.label}</option>
                    ))}
                  </select>
                  {confirmId === app.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        className="px-2.5 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-[10px] font-black"
                        disabled={remove.isPending}
                        onClick={() => remove.mutate(app.id)}
                      >
                        Confirm
                      </button>
                      <button
                        className="px-2.5 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-[10px] font-bold text-neutral-600 dark:text-neutral-400"
                        onClick={() => setConfirmId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className="p-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-colors"
                      aria-label={`Delete ${app.company} ${app.role}`}
                      onClick={() => setConfirmId(app.id)}
                    >
                      <Trash2 size={13} strokeWidth={2.2} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {list.isLoading && (
            <div className="flex justify-center py-12 text-neutral-500">
              <RefreshCcw size={18} strokeWidth={2} className="animate-spin" />
            </div>
          )}

          {!list.isLoading && visible.length === 0 && (
            <EmptyState
              icon={<ClipboardList size={26} strokeWidth={1.8} />}
              title={
                filter === "all" ? "Nothing tracked yet" : `Nothing in ${stages.find((s) => s.stage === filter)?.label ?? "this stage"}`
              }
              description={
                filter === "all" ? (
                  <>
                    Add the roles you are actually chasing. Pair this with{" "}
                    <Link to="/autopilot" className="font-bold underline underline-offset-2 inline-flex items-center gap-1">
                      Career Autopilot <Rocket size={11} strokeWidth={2.4} />
                    </Link>{" "}
                    so every application goes out with the gaps already named.
                  </>
                ) : (
                  "Move an application into this stage from its row above."
                )
              }
            />
          )}
        </div>
      </Reveal>
    </div>
  );
}
