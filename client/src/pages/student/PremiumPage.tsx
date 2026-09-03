import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Sparkles, AlertTriangle, Check, Crown, CreditCard, Globe2, Fingerprint, Languages } from "lucide-react";
import api, { apiErrorMessage } from "../../lib/api";
import { useAuthStore } from "../../stores/auth";
import { prefersReducedMotion } from "../../lib/anim";
import Reveal from "../../components/Reveal";

const reduce = prefersReducedMotion();

interface Region {
  id: string;
  name: string;
  currency: string;
  price: number;
}

// Global Access Doctrine: purchasing-power-parity pricing so Adaptive+
// costs roughly the same slice of income in every market.
const REGIONS: Region[] = [
  { id: "pk", name: "Pakistan", currency: "₨", price: 999 },
  { id: "in", name: "India", currency: "₹", price: 299 },
  { id: "bd", name: "Bangladesh", currency: "৳", price: 349 },
  { id: "ng", name: "Nigeria", currency: "₦", price: 2900 },
  { id: "eg", name: "Egypt", currency: "E£", price: 149 },
  { id: "id", name: "Indonesia", currency: "Rp", price: 49000 },
  { id: "br", name: "Brazil", currency: "R$", price: 24.9 },
  { id: "us", name: "United States & global", currency: "$", price: 9.99 },
];

const FREE_FEATURES = [
  "Adaptive diagnostic & Capability Matrix",
  "AI-adapted lessons (Analogical/Diagrammatic)",
  "Code mentorship playground & 4-axis grading",
  "Ask AI domain mentor chatbot",
  "System Design Dojo — interview-grade design critiques",
  "Skill Passport — portable proof of skill for applications abroad",
];

const PREMIUM_FEATURES = [
  "Memory Twin™ — 14-day predictive skill decay forecast",
  "Rescue Reviews — 2-minute stability interventions",
  "Struggle DNA™ — full 4-axis cognitive profile & countermeasures",
  "Career Autopilot™ — paste any JD, get a 90-day hire-ready plan",
  "Priority AI adaptation pipeline & lower latency",
  "All Explorer features included",
];

export default function PremiumPage() {
  const { user, setSession } = useAuthStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [regionId, setRegionId] = useState(() => localStorage.getItem("edu-region") ?? "pk");
  const navigate = useNavigate();
  const isPremium = user?.plan === "premium";
  const region = REGIONS.find((r) => r.id === regionId) ?? REGIONS[0];
  const priceLabel = `${region.currency}${region.price.toLocaleString()}`;

  function selectRegion(id: string) {
    setRegionId(id);
    localStorage.setItem("edu-region", id);
  }

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

      <Reveal delay={0.05}>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-300">
            <Globe2 size={14} strokeWidth={2.2} />
            Global Access fair pricing — your region
          </span>
          <select
            className="input !w-auto text-xs font-semibold"
            value={regionId}
            onChange={(e) => selectRegion(e.target.value)}
            aria-label="Pricing region"
          >
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} — {r.currency}{r.price.toLocaleString()}/mo
              </option>
            ))}
          </select>
        </div>
      </Reveal>

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
                {priceLabel}<span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">/month</span>
              </div>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 mb-6 border-b border-black/20 dark:border-white/20 pb-4">
                Fair regional price for {region.name} — purchasing-power parity
                {region.id !== "us" ? " (global base: $9.99/mo)" : ""}. Same intelligence, priced for your economy.
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
                {busy ? "Activating Pro Account..." : `Upgrade to Adaptive+ (${priceLabel}/mo)`}
              </button>
            )}
          </motion.div>
        </Reveal>
      </div>

      <Reveal delay={0.26}>
        <div className="card !p-6 !bg-black dark:!bg-white !text-white dark:!text-black !border-black dark:!border-white">
          <div className="flex items-center gap-2 mb-1">
            <Globe2 size={16} strokeWidth={2.2} />
            <h2 className="font-bold">Global Access Doctrine™</h2>
          </div>
          <p className="text-xs text-neutral-300 dark:text-neutral-700 mb-4 max-w-2xl leading-relaxed">
            Great education software should not be a luxury import. Three commitments for students in
            Pakistan, South Asia, Africa, and every emerging market:
          </p>
          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <div className="rounded-xl border border-white/25 dark:border-black/25 p-3.5">
              <div className="flex items-center gap-1.5 font-bold mb-1.5">
                <Globe2 size={13} strokeWidth={2.4} />
                PPP fair pricing
              </div>
              <p className="text-neutral-300 dark:text-neutral-700 leading-relaxed">
                Adaptive+ costs the same slice of income in Karachi as in San Francisco — local currency, local reality.
              </p>
            </div>
            <div className="rounded-xl border border-white/25 dark:border-black/25 p-3.5">
              <div className="flex items-center gap-1.5 font-bold mb-1.5">
                <Languages size={13} strokeWidth={2.4} />
                Dual-language support (اردو)
              </div>
              <p className="text-neutral-300 dark:text-neutral-700 leading-relaxed">
                Every core CS term anchored in Urdu on the dashboard — learn the concept twice, master it once.
              </p>
            </div>
            <div className="rounded-xl border border-white/25 dark:border-black/25 p-3.5">
              <div className="flex items-center gap-1.5 font-bold mb-1.5">
                <Fingerprint size={13} strokeWidth={2.4} />
                Skill Passport for going abroad
              </div>
              <p className="text-neutral-300 dark:text-neutral-700 leading-relaxed">
                A verifiable, machine-readable record of measured skill — attach it to university and visa applications.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.3}>
        <div className="p-4 rounded-2xl bg-white/60 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 text-center text-xs text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto flex items-center justify-center gap-2">
          <CreditCard size={15} strokeWidth={2} className="shrink-0 text-neutral-500" />
          Demo Billing Environment: Instant one-click activation reissues JWT tokens with verified plan claims.
        </div>
      </Reveal>
    </div>
  );
}
