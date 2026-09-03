import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Store,
  Sparkles,
  RefreshCcw,
  Banknote,
  Target,
  Briefcase,
  Copy,
  Check,
} from "lucide-react";
import api, { apiErrorMessage } from "../../lib/api";
import { prefersReducedMotion } from "../../lib/anim";
import Reveal from "../../components/Reveal";

const reduce = prefersReducedMotion();

interface FreelanceGig {
  title: string;
  pitch: string;
  priceBand: string;
}

interface FreelanceProfilePayload {
  headline: string;
  niche: string;
  skills: string[];
  positioning: string;
  gigs: FreelanceGig[];
  hourlyRateUsd: number;
}

interface FreelanceResponse {
  source: "ai" | "mock";
  generatedAt: string;
  profile: FreelanceProfilePayload;
}

export default function Freelance() {
  const queryClient = useQueryClient();
  const [focus, setFocus] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: existing, isError } = useQuery({
    queryKey: ["freelance"],
    queryFn: async () => (await api.get<FreelanceResponse>("/freelance/latest")).data,
    retry: false,
  });

  const generate = useMutation({
    mutationFn: async () =>
      (await api.post<FreelanceResponse>("/freelance/generate", { focus: focus.trim() || undefined })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["freelance"] }),
  });

  const data = generate.data ?? existing;

  async function copyProfile() {
    if (!data) return;
    const p = data.profile;
    const text = [
      p.headline,
      "",
      `Niche: ${p.niche}`,
      `Hourly rate: $${p.hourlyRateUsd}/hr`,
      `Skills: ${p.skills.join(", ")}`,
      "",
      p.positioning,
      "",
      "Starter gigs:",
      ...p.gigs.map((g) => `- ${g.title} (${g.priceBand}): ${g.pitch}`),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-white dark:from-black via-neutral-100 dark:via-neutral-900 to-white dark:to-black border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-black/5 dark:bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-800 dark:text-neutral-200 text-xs font-semibold mb-3">
              <Store size={13} strokeWidth={2.2} />
              Freelance Launchpad™ — Global Access Doctrine
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-black dark:text-white tracking-tight">
              Turn your matrix into your first paying clients.
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              Pakistan is one of the world's largest freelance markets. The Launchpad reads your live Capability
              Matrix and drafts an honest, marketplace-ready profile — niche, skills, starter gigs, and a realistic rate.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={reduce ? 0 : 0.08}>
        <div className="card !p-6 border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} strokeWidth={2.2} className="text-neutral-700 dark:text-neutral-300" />
            <h2 className="font-bold text-black dark:text-white text-sm">Point the Launchpad</h2>
          </div>
          <label className="label">Optional focus area</label>
          <input
            className="input"
            placeholder="e.g. backend automation scripts, React dashboards, data cleaning…"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
          />
          {generate.error && (
            <div className="bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-700 dark:text-neutral-300 rounded-xl p-3.5 mt-4 text-xs font-medium">
              {apiErrorMessage(generate.error)}
            </div>
          )}
          <button
            className="btn-primary mt-4 inline-flex items-center gap-2"
            disabled={generate.isPending}
            onClick={() => generate.mutate()}
          >
            {generate.isPending ? (
              <>
                <RefreshCcw size={14} strokeWidth={2.2} className="animate-spin" />
                Drafting your profile…
              </>
            ) : (
              <>
                <Sparkles size={14} strokeWidth={2.2} />
                {data ? "Regenerate profile" : "Generate my freelance profile"}
              </>
            )}
          </button>
          {isError && !data && (
            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-2">
              No profile yet — generate one from your latest matrix.
            </p>
          )}
        </div>
      </Reveal>

      {data && (
        <>
          <Reveal delay={reduce ? 0 : 0.12}>
            <div className="card !p-6 border-neutral-200 dark:border-neutral-800">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <h3 className="text-lg font-black text-black dark:text-white leading-snug">{data.profile.headline}</h3>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mt-1">
                    Niche: {data.profile.niche}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-black">
                    <Banknote size={14} strokeWidth={2.2} />
                    ${data.profile.hourlyRateUsd}/hr
                  </span>
                  <button
                    className="btn-secondary text-xs inline-flex items-center gap-1.5"
                    onClick={copyProfile}
                  >
                    {copied ? <Check size={14} strokeWidth={2.2} /> : <Copy size={14} strokeWidth={2.2} />}
                    {copied ? "Copied" : "Copy profile"}
                  </button>
                </div>
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mt-3">{data.profile.positioning}</p>

              <div className="flex flex-wrap gap-1.5 mt-4">
                {data.profile.skills.map((s) => (
                  <span key={s} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300">
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Built from your live Capability Matrix
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-700 dark:text-neutral-300">
                  {data.source === "ai" ? "Gemini-drafted" : "Deterministic draft"}
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={reduce ? 0 : 0.16}>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Briefcase size={16} strokeWidth={2.2} className="text-neutral-700 dark:text-neutral-300" />
                <h2 className="font-bold text-black dark:text-white text-sm">Starter gigs to win your first reviews</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-5">
                {data.profile.gigs.map((g) => (
                  <div key={g.title} className="card card-hover h-full flex flex-col gap-3 border-neutral-200 dark:border-neutral-800">
                    <h3 className="font-bold text-black dark:text-white text-sm leading-snug">{g.title}</h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed flex-1">{g.pitch}</p>
                    <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 text-[11px] font-bold text-black dark:text-white">
                      {g.priceBand}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={reduce ? 0 : 0.2}>
            <div className="card !p-5 !bg-black dark:!bg-white !text-white dark:!text-black !border-black dark:!border-white">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
                First-client playbook
              </span>
              <ul className="mt-2 grid sm:grid-cols-3 gap-3 text-xs">
                <li>Under-price the first 2 gigs to collect reviews, then raise to your rate band.</li>
                <li>Reply to every brief within a few hours — response speed drives ranking.</li>
                <li>Link your Skill Passport so clients can verify your skills independently.</li>
              </ul>
            </div>
          </Reveal>
        </>
      )}
    </div>
  );
}
