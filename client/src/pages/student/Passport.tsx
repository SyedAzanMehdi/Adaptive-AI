import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Globe2, Download, Copy, CheckCircle2, ShieldCheck } from "lucide-react";
import api from "../../lib/api";
import { prefersReducedMotion } from "../../lib/anim";
import Reveal from "../../components/Reveal";

const reduce = prefersReducedMotion();

interface PassportData {
  passportId: string;
  holder: { name: string; email: string };
  plan: string;
  memberSince: string | null;
  issuedAt: string;
  capability: {
    diagnosticStatus: string;
    averageMastery: number;
    domains: { domain: string; mastery: number; attempts: number }[];
  };
  evidence: {
    codeSubmissions: number;
    designCritiques: number;
    autopilot: { role: string; readiness: number } | null;
  };
  verification: {
    issuer: string;
    attestation: string;
  };
}

export default function Passport() {
  const [copied, setCopied] = useState(false);
  const [resumeCopied, setResumeCopied] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["passport"],
    queryFn: async () => (await api.get<{ passport: PassportData }>("/student/passport")).data.passport,
  });

  function download() {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `skill-passport-${data.passportId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copy() {
    if (!data) return;
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function copyResume() {
    if (!data) return;
    const domains = data.capability.domains
      .map((d) => `  - ${d.domain.replace("_", " ")}: ${d.mastery}% mastery (${d.attempts} graded attempts)`)
      .join("\n");
    const resume = [
      `${data.holder.name.toUpperCase()}`,
      `${data.holder.email}`,
      "",
      "VERIFIED SKILL PASSPORT — " + data.passportId,
      `Issued ${new Date(data.issuedAt).toLocaleDateString()} by ${data.verification.issuer}`,
      "",
      "MEASURED CAPABILITY (average mastery " + data.capability.averageMastery + "%)",
      domains || "  (in progress — diagnostic and submissions pending)",
      "",
      "EVIDENCE",
      `  - ${data.evidence.codeSubmissions} mentored code submissions`,
      `  - ${data.evidence.designCritiques} system-design critiques`,
      data.evidence.autopilot
        ? `  - Career Autopilot: ${data.evidence.autopilot.role} — ${data.evidence.autopilot.readiness}% hire-ready`
        : null,
      "",
      data.verification.attestation,
    ]
      .filter((line) => line !== null)
      .join("\n");
    await navigator.clipboard.writeText(resume);
    setResumeCopied(true);
    setTimeout(() => setResumeCopied(false), 2000);
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-white dark:from-black via-neutral-100 dark:via-neutral-900 to-white dark:to-black border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-black/5 dark:bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-800 dark:text-neutral-200 text-xs font-semibold mb-3">
              <Globe2 size={13} strokeWidth={2.2} />
              Skill Passport™ — free, portable, verifiable
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-black dark:text-white tracking-tight">
              Your skills, stamped. Take them anywhere.
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              Built for international students: a machine-readable record of your measured capability —
              no transcripts to translate, no credentials to re-certify. Attach it to university
              applications, visa skill evidence, and job referrals.
            </p>
          </div>
        </div>
      </Reveal>

      {isLoading || !data ? (
        <div className="flex justify-center py-16 text-neutral-600 dark:text-neutral-400">
          <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      ) : (
        <>
          {/* Passport document */}
          <Reveal delay={reduce ? 0 : 0.08}>
            <motion.div
              whileHover={reduce ? {} : { y: -3 }}
              className="rounded-3xl border-2 border-black dark:border-white p-1.5 shadow-2xl"
            >
              <div className="rounded-[1.25rem] border border-black/40 dark:border-white/40 p-6 sm:p-8 bg-neutral-50 dark:bg-neutral-950">
                {/* Header */}
                <div className="flex items-center justify-between border-b-2 border-black dark:border-white pb-4 mb-5">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 dark:text-neutral-400">
                      {data.verification.issuer}
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-black dark:text-white tracking-tight">
                      SKILL PASSPORT
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs sm:text-sm font-bold text-black dark:text-white">{data.passportId}</div>
                    <div className="text-[10px] text-neutral-600 dark:text-neutral-400 font-semibold uppercase tracking-wider">
                      Issued {new Date(data.issuedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Holder */}
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-0.5">Holder</div>
                    <div className="font-bold text-black dark:text-white">{data.holder.name}</div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">{data.holder.email}</div>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-0.5">Status</div>
                    <div className="font-bold text-black dark:text-white capitalize">{data.plan} learner</div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">
                      {data.memberSince ? `Member since ${new Date(data.memberSince).toLocaleDateString()}` : "New member"}
                    </div>
                  </div>
                </div>

                {/* Capability */}
                <div className="mb-6">
                  <div className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2">
                    Measured capability — average mastery {data.capability.averageMastery}%
                  </div>
                  {data.capability.domains.length === 0 ? (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 p-3 rounded-xl border border-dashed border-neutral-400 dark:border-neutral-600">
                      No measured domains yet — run the diagnostic and submit code to stamp this passport with evidence.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {data.capability.domains.map((d) => (
                        <li key={d.domain} className="flex items-center gap-3">
                          <span className="w-28 shrink-0 text-[11px] font-bold uppercase tracking-wide text-neutral-700 dark:text-neutral-300 capitalize">
                            {d.domain.replace("_", " ")}
                          </span>
                          <div className="flex-1 h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                            <div className="h-full bg-black dark:bg-white rounded-full" style={{ width: `${d.mastery}%` }} />
                          </div>
                          <span className="w-14 text-right text-[11px] font-black text-black dark:text-white">
                            {d.mastery}%
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Evidence */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="rounded-xl border border-neutral-300 dark:border-neutral-700 p-3 text-center">
                    <div className="text-xl font-black text-black dark:text-white">{data.evidence.codeSubmissions}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Code submissions</div>
                  </div>
                  <div className="rounded-xl border border-neutral-300 dark:border-neutral-700 p-3 text-center">
                    <div className="text-xl font-black text-black dark:text-white">{data.evidence.designCritiques}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Design critiques</div>
                  </div>
                  <div className="rounded-xl border border-neutral-300 dark:border-neutral-700 p-3 text-center">
                    <div className="text-xl font-black text-black dark:text-white">
                      {data.evidence.autopilot ? `${data.evidence.autopilot.readiness}%` : "—"}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                      {data.evidence.autopilot ? "JD readiness" : "Autopilot"}
                    </div>
                  </div>
                </div>

                {/* Verification */}
                <div className="flex items-start gap-2.5 pt-4 border-t border-black/30 dark:border-white/30">
                  <ShieldCheck size={15} strokeWidth={2.2} className="mt-0.5 shrink-0 text-neutral-600 dark:text-neutral-400" />
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {data.verification.attestation}
                  </p>
                </div>
              </div>
            </motion.div>
          </Reveal>

          {/* Actions */}
          <Reveal delay={reduce ? 0 : 0.14}>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button className="btn-primary inline-flex items-center gap-2 text-xs" onClick={download}>
                <Download size={14} strokeWidth={2.2} />
                Download passport JSON
              </button>
              <button className="btn-secondary inline-flex items-center gap-2 text-xs" onClick={copy}>
                {copied ? <CheckCircle2 size={14} strokeWidth={2.2} /> : <Copy size={14} strokeWidth={2.2} />}
                {copied ? "Copied" : "Copy to clipboard"}
              </button>
              <button className="btn-secondary inline-flex items-center gap-2 text-xs" onClick={copyResume}>
                {resumeCopied ? <CheckCircle2 size={14} strokeWidth={2.2} /> : <Copy size={14} strokeWidth={2.2} />}
                {resumeCopied ? "Resume copied" : "Copy as resume"}
              </button>
            </div>
            <p className="text-center text-[11px] text-neutral-600 dark:text-neutral-400 mt-3 max-w-lg mx-auto leading-relaxed">
              The JSON is machine-readable: admissions portals, recruiters, and scholarship committees can
              parse it directly. Mastery scores refresh live every time you learn.
            </p>
          </Reveal>
        </>
      )}
    </div>
  );
}
