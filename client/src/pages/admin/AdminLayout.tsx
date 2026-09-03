import { useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { Users, Settings, BarChart3, Shield, Zap, LogOut } from "lucide-react";
import { useAuthStore } from "../../stores/auth";
import { ThemeToggle } from "../../components/ThemeToggle";
import { PageTransition } from "../../components/PageTransition";

const links = [
  { to: "/admin/users", label: "Users & Accounts", Icon: Users },
  { to: "/admin/curriculum", label: "Curriculum Settings", Icon: Settings },
  { to: "/admin/analytics", label: "Analytics & AI Metrics", Icon: BarChart3 },
  { to: "/admin/audit", label: "Audit Log & Security", Icon: Shield },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 font-sans">
      {/* Ambient glow meshes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="blob-a absolute -top-32 right-0 w-96 h-96 bg-black/5 dark:bg-white/5 rounded-full blur-3xl" />
        <div className="blob-b absolute bottom-0 left-1/4 w-96 h-96 bg-black/5 dark:bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Mobile Bar */}
      <div className="lg:hidden backdrop-blur-xl bg-white/90 dark:bg-black/90 border-b border-neutral-200 dark:border-neutral-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-neutral-500 to-neutral-600 dark:to-neutral-400 flex items-center justify-center text-xs font-black text-neutral-950">
            A
          </div>
          <span className="font-bold text-sm text-black dark:text-white">Admin Console</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white"
            aria-label="Toggle admin menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto w-64 bg-neutral-100/90 dark:bg-neutral-900/90 backdrop-blur-xl border-r border-neutral-200 dark:border-neutral-800 flex flex-col
          transform transition-transform duration-300 ease-out shadow-2xl
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="px-6 py-6 border-b border-neutral-200 dark:border-neutral-800 hidden lg:block">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shadow-lg shadow-black/10 dark:shadow-white/10">
              <Zap size={18} strokeWidth={2.4} />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-neutral-900 dark:text-neutral-100">
                Adaptive AI
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-700 dark:text-neutral-300">
                Admin Console
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {links.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-black dark:bg-white border border-black dark:border-white text-white dark:text-black shadow-lg shadow-black/10 dark:shadow-white/10"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60"
                }`
              }
            >
              <Icon size={16} strokeWidth={2.1} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 m-4 rounded-2xl bg-white/60 dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-neutral-800/80">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 border border-black/40 dark:border-white/40 text-neutral-700 dark:text-neutral-300 font-bold flex items-center justify-center text-xs shrink-0">
                {user?.name?.[0]?.toUpperCase() ?? "A"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">{user?.name}</span>
                <span className="text-[10px] text-neutral-700 dark:text-neutral-300 font-bold uppercase tracking-wider">System Admin</span>
              </div>
            </div>
            <ThemeToggle className="shrink-0" />
          </div>
          <button
            className="w-full text-xs font-semibold py-2 px-3 rounded-xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors inline-flex items-center justify-center gap-1.5"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut size={13} strokeWidth={2.2} />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-auto relative z-10">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  );
}
