import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Sparkles, AlertTriangle, Check, Crown, CreditCard } from "lucide-react";
import api, { apiErrorMessage } from "../../lib/api";
import { useAuthStore } from "../../stores/auth";
import { prefersReducedMotion, useReducedMotion } from "../../lib/anim";
import Reveal from "../../components/Reveal";

let reduce = prefersReducedMotion();

const PRICE_LABEL = "$9.99";

const FREE_FEATURES = [
  "Adaptive diagnostic & Capability Matrix",
  "AI-adapted lessons (Analogical/Diagrammatic)",
  "Code mentorship playground & 4-axis grading",
  "Ask AI domain mentor chatbot",
  "System Design Dojo — interview-grade design critiques",
  "Interview Rehearsal Studio™ — timed mock loops with a scored trend line",
  "Application Pipeline™ — response rate and days-to-close, computed for you",
  "AI-Resilience Score™ — automation exposure and your pivot path",
  "Freelance Launchpad — matrix-grounded gigs and rate positioning",
];

const PREMIUM_FEATURES = [
  "Memory Twin™ — 14-day predictive skill decay forecast",
  "Rescue Reviews — 2-minute stability interventions",
  "Struggle DNA™ — full 4-axis cognitive profile & countermeasures",
  "Career Autopilot™ — skill-match %, tiered gap analysis, 90-day plan",
  "Recruiter Lens™ — how your profile reads in the first pass, and the screen-out risk",
  "Automated Assessment Generator™ — one targeted probe per weak requirement",
  "Customized Learning Path + Time-to-Ready ETA™ — the exact hours to job-ready",
  "Priority AI adaptation pipeline & lower latency",
  "All Explorer features included",
];

export default function PremiumPage() {
  reduce = useReducedMotion();
  const { user, setSession } = useAuthStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const isPremium = user?.plan === "premium";

  async function subscribe() {
    setBusy(true);
    setError("");
    try {
      const res = await api.post("/premium/upgrade", { plan: "premium" });
      setSession(res.data.token, res.data.refreshToken, res.data.user);
      navigate("/memory", { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Reveal>
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-800 dark:text-neutral-200 text-xs font-semibold mb-3">
            <Sparkles size={13} strokeWidth={2.2} />
            Transformative Learning Moat
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-black dark:text-white tracking-tight mb-3">
            Unlock <span className="bg-clip-text text-transparent bg-gradient-to-r from-black dark:from-white via-neutral-700 dark:via-neutral-300 to-neutral-800 dark:to-neutral-200">Adaptive+ Premium</span>
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed">
            Stop skill decay before it happens. Experience the world's first Memory Twin and Struggle DNA cognitive profiler.
          </p>
        </div>
      </Reveal>

      {error && (
        <div className="bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-700 dark:text-neutral-300 rounded-2xl p-4 text-xs font-semibold text-center max-w-md mx-auto flex items-center justify-center gap-2">
          <AlertTriangle size={15} strokeWidth={2.2} className="shrink-0" />
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 items-stretch">
        
        {/* Free Plan */}
        <Reveal delay={0.1}>
          <div className="card h-full flex flex-col justify-between !bg-neutral-100/60 dark:!bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 p-6 sm:p-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Basic Tier</span>
                <span className="badge-free">Current Baseline</span>
              </div>
              <h2 className="text-2xl font-black text-black dark:text-white">Explorer</h2>
              <div className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-neutral-100 my-4">
                Free
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-6 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                Core diagnostic, adaptive lesson delivery, and static mentorship.
              </p>

              <ul className="space-y-3 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 mb-8">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="text-neutral-700 dark:text-neutral-300 mt-0.5 shrink-0"><Check size={15} strokeWidth={3} /></span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-white/60 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 text-center text-xs text-neutral-600 dark:text-neutral-400">
              Active Plan
            </div>
          </div>
        </Reveal>

        {/* Premium Plan */}
        <Reveal delay={0.2}>
          <motion.div
            whileHover={reduce ? {} : { y: -4 }}
            className="card h-full flex flex-col justify-between border-2 border-black/50 dark:border-white/50 !bg-gradient-to-b !from-neutral-100 dark:!from-neutral-900 via-white/30 dark:via-neutral-950/30 !to-neutral-100 dark:!to-neutral-900 shadow-lg p-6 sm:p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 dark:bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <span className="absolute top-4 right-4 bg-gradient-to-r from-black dark:from-white to-neutral-500 text-white dark:text-neutral-950 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-lg shadow-black/10 dark:shadow-white/10">
              PRO INNOVATION
            </span>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">Predictive Tier</span>
              </div>
              <h2 className="text-2xl font-black text-black dark:text-white">Adaptive+</h2>
              <div className="text-3xl sm:text-4xl font-black text-neutral-800 dark:text-neutral-200 my-4 flex items-baseline gap-1">
                {PRICE_LABEL}<span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">/month</span>
              </div>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 mb-6 border-b border-black/20 dark:border-white/20 pb-4">
                One plan, one price — the same predictive intelligence for every student.
              </p>

              <ul className="space-y-3 text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 mb-8">
                {PREMIUM_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="text-neutral-700 dark:text-neutral-300 mt-0.5 shrink-0"><Crown size={15} strokeWidth={2.6} /></span>
                    <span className="font-medium">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {isPremium ? (
              <div className="badge-premium justify-center py-3 text-xs font-bold inline-flex items-center gap-1.5">
                <Check size={15} strokeWidth={3} />
                You have Adaptive+ Active
              </div>
            ) : (
              <button className="btn-amber w-full text-xs font-black uppercase tracking-wider" onClick={subscribe} disabled={busy}>
                {busy ? "Activating Pro Account..." : `Upgrade to Adaptive+ (${PRICE_LABEL}/mo)`}
              </button>
            )}
          </motion.div>
        </Reveal>
      </div>

      <Reveal delay={0.3}>
        <div className="p-4 rounded-2xl bg-white/60 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 text-center text-xs text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto flex items-center justify-center gap-2">
          <CreditCard size={15} strokeWidth={2} className="shrink-0 text-neutral-500" />
          Demo Billing Environment: Instant one-click activation reissues JWT tokens with verified plan claims.
        </div>
      </Reveal>
    </div>
  );
}
