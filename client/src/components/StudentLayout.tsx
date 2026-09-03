import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Brain,
  BookOpen,
  Code2,
  MessageSquare,
  Activity,
  Dna,
  Compass,
  CalendarDays,
  Rocket,
  Zap,
  Crown,
  LogOut,
  Network,
  Globe2,
  GraduationCap,
  Store,
  ChevronDown,
} from "lucide-react";
import { useAuthStore } from "../stores/auth";
import { ThemeToggle } from "./ThemeToggle";
import { PageTransition } from "./PageTransition";

type NavItem = {
  to: string;
  label: string;
  desc: string;
  end?: boolean;
  Icon: typeof LayoutDashboard;
};

type NavGroup = { name: string; blurb: string; items: NavItem[] };

const GROUPS: NavGroup[] = [
  {
    name: "Learn",
    blurb: "Diagnose, study, and practice your craft",
    items: [
      { to: "/", label: "Dashboard", desc: "Your progress at a glance", end: true, Icon: LayoutDashboard },
      { to: "/diagnostic", label: "Diagnostic", desc: "Adaptive test that builds your matrix", Icon: Brain },
      { to: "/lessons", label: "Lessons", desc: "AI-rewritten lessons for your level", Icon: BookOpen },
      { to: "/practice", label: "Practice", desc: "Code exercises with AI mentorship", Icon: Code2 },
      { to: "/dojo", label: "Design Dojo", desc: "System-design drills with critique", Icon: Network },
    ],
  },
  {
    name: "Plan",
    blurb: "Map the path and get unstuck fast",
    items: [
      { to: "/compass", label: "Compass", desc: "64 domains with 10-year demand trends", Icon: Compass },
      { to: "/planner", label: "Planner", desc: "Adaptive 7-day study plan", Icon: CalendarDays },
      { to: "/chat", label: "Ask AI", desc: "General mentor chatbot, any topic", Icon: MessageSquare },
    ],
  },
  {
    name: "Insights",
    blurb: "See how you learn and what you retain",
    items: [
      { to: "/memory", label: "Memory Twin", desc: "Forecast what you will forget", Icon: Activity },
      { to: "/dna", label: "Struggle DNA", desc: "How you fail, and the fix for it", Icon: Dna },
      { to: "/passport", label: "Passport", desc: "Portable, verifiable skill record", Icon: Globe2 },
    ],
  },
  {
    name: "Career",
    blurb: "Turn proven skill into opportunity",
    items: [
      { to: "/autopilot", label: "Autopilot", desc: "Paste a JD, get a 90-day plan", Icon: Rocket },
      { to: "/scholarships", label: "Scholarships", desc: "15 funded programmes, live deadlines", Icon: GraduationCap },
      { to: "/freelance", label: "Freelance", desc: "Gigs grounded in your matrix", Icon: Store },
    ],
  },
];

export default function StudentLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const isPremium = user?.plan === "premium";

  const isAtPath = (to: string, end?: boolean) =>
    end ? location.pathname === to : location.pathname === to || location.pathname.startsWith(to + "/");
  const groupActive = (g: NavGroup) => g.items.some((it) => isAtPath(it.to, it.end));

  useEffect(() => {
    setOpenGroup(null);
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!openGroup) return;
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenGroup(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenGroup(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openGroup]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 font-sans selection:bg-black dark:selection:bg-white selection:text-white dark:selection:text-black">
      {/* Background glow meshes (slow ambient drift) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="blob-a absolute -top-40 -left-40 w-96 h-96 bg-black/10 dark:bg-white/10 rounded-full blur-3xl" />
        <div className="blob-b absolute top-1/3 -right-40 w-96 h-96 bg-black/10 dark:bg-white/10 rounded-full blur-3xl" />
        <div className="blob-c absolute -bottom-40 left-1/3 w-96 h-96 bg-black/5 dark:bg-white/5 rounded-full blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-neutral-200/80 dark:border-neutral-800/80 pt-[env(safe-area-inset-top)] shadow-2xl">
        <div className="max-w-7xl 2xl:max-w-[1728px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group shrink-0 whitespace-nowrap">
            <div className="w-10 h-10 rounded-xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shadow-lg shadow-black/10 dark:shadow-white/10 group-hover:scale-105 transition-transform">
              <Zap size={19} strokeWidth={2.4} />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-extrabold text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-black dark:from-white via-neutral-800 dark:via-neutral-200 to-neutral-600 dark:to-neutral-400">
                Adaptive AI
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-600 dark:text-neutral-400">
                Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav — four labeled, expandable groups (readable + adjustable) */}
          <nav ref={navRef} className="hidden lg:flex items-center gap-1" aria-label="Primary">
            {GROUPS.map((g) => {
              const open = openGroup === g.name;
              const active = groupActive(g);
              return (
                <div key={g.name} className="relative">
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-haspopup="true"
                    title={g.blurb}
                    onClick={() => setOpenGroup((v) => (v === g.name ? null : g.name))}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors duration-200 ${
                      open || active
                        ? "bg-black dark:bg-white text-white dark:text-black shadow-md shadow-black/10 dark:shadow-white/10"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-100"
                    }`}
                  >
                    {g.name}
                    <ChevronDown
                      size={13}
                      strokeWidth={2.4}
                      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    />
                  </button>

                  {open && (
                    <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-2xl shadow-black/10 dark:shadow-black/60 p-2 z-50">
                      <p className="px-3 pt-1.5 pb-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                        {g.blurb}
                      </p>
                      <div className="flex flex-col gap-0.5">
                        {g.items.map((it) => (
                          <NavLink
                            key={it.to}
                            to={it.to}
                            end={it.end}
                            title={it.desc}
                            className={({ isActive }) =>
                              `flex items-start gap-3 px-3 py-2 rounded-xl transition-colors duration-150 ${
                                isActive
                                  ? "bg-black dark:bg-white text-white dark:text-black"
                                  : "text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                              }`
                            }
                          >
                            {({ isActive }) => (
                              <>
                                <it.Icon size={16} strokeWidth={2.2} className="mt-0.5 shrink-0" />
                                <span className="flex flex-col min-w-0 text-left">
                                  <span className="text-xs font-semibold">{it.label}</span>
                                  <span
                                    className={`text-[11px] leading-snug ${
                                      isActive
                                        ? "text-neutral-300 dark:text-neutral-600"
                                        : "text-neutral-600 dark:text-neutral-400"
                                    }`}
                                  >
                                    {it.desc}
                                  </span>
                                </span>
                              </>
                            )}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* User Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to="/premium"
              className={
                isPremium
                  ? "badge-premium hover:scale-105 transition-transform whitespace-nowrap"
                  : "badge-free hover:bg-neutral-700/80 transition-colors whitespace-nowrap"
              }
            >
              {isPremium ? (
                <>
                  <Crown size={12} strokeWidth={2.4} />
                  Adaptive+
                </>
              ) : (
                "Explorer Free"
              )}
            </Link>

            <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-neutral-200 dark:border-neutral-800 text-xs whitespace-nowrap">
              <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center font-bold text-neutral-600 dark:text-neutral-400">
                {user?.name?.[0]?.toUpperCase() ?? "S"}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{user?.name}</span>
                <span className="text-[10px] text-neutral-600 dark:text-neutral-400 capitalize">
                  {user?.profile?.levelTier ?? "Student"}
                </span>
              </div>
            </div>

            <ThemeToggle />

            <button
              className="btn-secondary !py-1.5 !px-3 text-xs hidden md:inline-flex whitespace-nowrap"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <LogOut size={13} strokeWidth={2.2} />
              Log out
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                {menuOpen ? (
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav Menu — grouped, labeled sections */}
        {menuOpen && (
          <nav
            className="lg:hidden border-t border-neutral-200 dark:border-neutral-800 px-4 py-4 space-y-5 bg-white/95 dark:bg-black/95 backdrop-blur-xl max-h-[calc(100vh-64px)] overflow-y-auto"
            aria-label="Primary mobile"
          >
            {GROUPS.map((g) => (
              <div key={g.name}>
                <div className="flex items-baseline gap-2 px-1 pb-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-800 dark:text-neutral-200">
                    {g.name}
                  </span>
                  <span className="text-[10px] text-neutral-600 dark:text-neutral-400">{g.blurb}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {g.items.map(({ to, label, desc, end, Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={end}
                      title={desc}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                          isActive
                            ? "bg-black dark:bg-white text-white dark:text-black shadow-lg shadow-black/10 dark:shadow-white/10"
                            : "bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800/80 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                        }`
                      }
                    >
                      <Icon size={15} strokeWidth={2.2} className="shrink-0" />
                      <span>{label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                Logged in as <strong className="text-neutral-800 dark:text-neutral-200">{user?.name}</strong>
              </span>
              <button
                className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                <LogOut size={13} strokeWidth={2.2} />
                Log out
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl 2xl:max-w-[1728px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 z-10">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  );
}
