import { lazy, Suspense, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Zap, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { passwordMeetsPolicy } from "@edu/shared";
import { useReducedMotion } from "../lib/anim";
import api, { apiErrorMessage } from "../lib/api";
import { useAuthStore } from "../stores/auth";
import { ThemeToggle } from "../components/ThemeToggle";
import { PasswordRequirements } from "../components/PasswordRequirements";

const HeroScene = lazy(() => import("../components/three/HeroScene"));

// Matches the feel of the original GSAP timeline's overlapping entrances.
const EASE = [0.165, 0.84, 0.44, 1] as const;
const FIELD_STAGGER = 0.08;

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await api.post("/auth/register", { name, email, password });
      setSession(res.data.token, res.data.refreshToken, res.data.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col justify-between">
      <Suspense fallback={null}>
        <HeroScene />
      </Suspense>
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 dark:from-neutral-950/40 via-white/75 dark:via-neutral-950/75 to-white dark:to-neutral-950 pointer-events-none" />

      {/* Decorative ambient lighting */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-black/10 dark:bg-white/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shadow-xl shadow-black/10 dark:shadow-white/10">
            <Zap size={24} strokeWidth={2.4} />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-black dark:text-white">
            Adaptive AI
          </span>
        </div>

        <motion.h1
          initial={reduce ? false : { y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="text-3xl sm:text-5xl font-black text-center tracking-tight mb-3"
        >
          Start your <span className="bg-clip-text text-transparent bg-gradient-to-r from-neutral-700 dark:from-neutral-300 via-neutral-700 dark:via-neutral-300 to-neutral-700 dark:to-neutral-300">adaptive journey</span>
        </motion.h1>
        <motion.p
          initial={reduce ? false : { y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
          className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base mb-8 text-center max-w-lg"
        >
          Your first step is an intelligent diagnostic that builds a personal capability vector across 5 CS domains.
        </motion.p>

        {/* Card Container */}
        <motion.div
          initial={reduce ? false : { y: 44, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
          className="w-full max-w-md bg-neutral-100/90 dark:bg-neutral-900/90 backdrop-blur-2xl rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 shadow-2xl p-6 sm:p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-black dark:text-white">Create student account</h2>
              <p className="text-neutral-600 dark:text-neutral-400 text-xs mt-0.5">Free Explorer Tier — No credit card required</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-700 dark:text-neutral-300">
              Instant Access
            </span>
          </div>

          {error && (
            <div className="bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-700 dark:text-neutral-300 rounded-xl p-3.5 mb-5 text-xs font-medium flex items-center gap-2">
              <AlertTriangle size={15} strokeWidth={2.2} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <motion.div
              initial={reduce ? false : { y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.9, ease: EASE }}
            >
              <label className="label">Full Name</label>
              <input
                className="input"
                type="text"
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </motion.div>
            <motion.div
              initial={reduce ? false : { y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.9 + FIELD_STAGGER, ease: EASE }}
            >
              <label className="label">Email address</label>
              <input
                className="input"
                type="email"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </motion.div>
            <motion.div
              initial={reduce ? false : { y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.9 + FIELD_STAGGER * 2, ease: EASE }}
            >
              <label className="label">Password</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordTouched(true)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
                </button>
              </div>
              {(passwordTouched || password.length > 0) && <PasswordRequirements password={password} />}
            </motion.div>
            <motion.button
              initial={reduce ? false : { y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.9 + FIELD_STAGGER * 3, ease: EASE }}
              className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={busy || !passwordMeetsPolicy(password)}
            >
              {busy ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-black dark:text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                "Create Free Account"
              )}
            </motion.button>
          </form>

          <div className="mt-6 pt-5 border-t border-neutral-200/80 dark:border-neutral-800/80 text-center">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Already registered?{" "}
              <Link to="/login" className="text-neutral-600 dark:text-neutral-400 font-semibold hover:text-neutral-700 dark:hover:text-neutral-300 underline">
                Sign in to account
              </Link>
            </p>
          </div>
        </motion.div>

        <p className="mt-8 text-xs text-neutral-500 tracking-wide font-medium">
          Architected by <span className="text-neutral-600 dark:text-neutral-400">Syed Azan Mehdi Shah</span>
        </p>
      </div>
    </div>
  );
}
