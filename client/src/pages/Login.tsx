import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { Zap, AlertTriangle } from "lucide-react";
import { prefersReducedMotion, EASE_OUT } from "../lib/anim";
import api, { apiErrorMessage } from "../lib/api";
import { useAuthStore } from "../stores/auth";
import { ThemeToggle } from "../components/ThemeToggle";

const HeroScene = lazy(() => import("../components/three/HeroScene"));

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: EASE_OUT } })
        .from(".hero-title", { y: 30, opacity: 0, duration: 0.7 })
        .from(".hero-sub", { y: 20, opacity: 0, duration: 0.6 }, "-=0.45")
        .from(".hero-card", { y: 44, opacity: 0, scale: 0.97, duration: 0.7 }, "-=0.35")
        .from(".hero-field", { y: 14, opacity: 0, stagger: 0.08, duration: 0.45 }, "-=0.3");
    }, rootRef);
    return () => ctx.revert();
  }, []);

  async function performLogin(loginEmail: string, loginPass: string) {
    setBusy(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { email: loginEmail, password: loginPass });
      setSession(res.data.token, res.data.refreshToken, res.data.user);
      navigate(res.data.user.role === "admin" ? "/admin" : "/", { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    performLogin(email, password);
  }

  return (
    <div ref={rootRef} className="relative min-h-screen overflow-hidden bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col justify-between">
      <Suspense fallback={null}>
        <HeroScene />
      </Suspense>
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 dark:from-neutral-950/40 via-white/75 dark:via-neutral-950/75 to-white dark:to-neutral-950 pointer-events-none" />

      {/* Decorative ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-black/10 dark:bg-white/10 rounded-full blur-[140px] pointer-events-none" />

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

        <h1 className="hero-title text-3xl sm:text-5xl font-black text-center tracking-tight mb-3">
          Learning that <span className="bg-clip-text text-transparent bg-gradient-to-r from-neutral-700 dark:from-neutral-300 via-neutral-700 dark:via-neutral-300 to-neutral-700 dark:to-neutral-300">adapts to you</span>
        </h1>
        <p className="hero-sub text-neutral-600 dark:text-neutral-400 text-sm sm:text-base mb-8 text-center max-w-lg">
          An AI tutor that diagnoses your CS capability vector, rewrites lessons to your level, and mentors code in real-time.
        </p>

        {/* Card Container */}
        <div className="hero-card w-full max-w-md bg-neutral-100/90 dark:bg-neutral-900/90 backdrop-blur-2xl rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 shadow-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-black dark:text-white">Welcome back</h2>
              <p className="text-neutral-600 dark:text-neutral-400 text-xs mt-0.5">Sign in to your learning account</p>
            </div>
          </div>

          {error && (
            <div className="bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-700 dark:text-neutral-300 rounded-xl p-3.5 mb-5 text-xs font-medium flex items-center gap-2">
              <AlertTriangle size={15} strokeWidth={2.2} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div className="hero-field">
              <label className="label">Email address</label>
              <input
                className="input"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="hero-field">
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="hero-field btn-primary w-full mt-2" disabled={busy}>
              {busy ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-black dark:text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Authenticating...
                </span>
              ) : (
                "Sign in to account"
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-neutral-200/80 dark:border-neutral-800/80 text-center">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Don't have a learner account yet?{" "}
              <Link to="/register" className="text-neutral-600 dark:text-neutral-400 font-semibold hover:text-neutral-700 dark:hover:text-neutral-300 underline">
                Create student account
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-8 text-xs text-neutral-500 tracking-wide font-medium">
          Architected by <span className="text-neutral-600 dark:text-neutral-400">Syed Azan Mehdi Shah</span>
        </p>
      </div>
    </div>
  );
}
