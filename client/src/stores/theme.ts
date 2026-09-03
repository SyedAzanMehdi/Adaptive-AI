import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light";

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark",
      toggleTheme: () =>
        set((state) => {
          const next: Theme = state.theme === "dark" ? "light" : "dark";
          applyTheme(next);
          return { theme: next };
        }),
      setTheme: (t) => {
        applyTheme(t);
        set({ theme: t });
      },
    }),
    { name: "edu-theme" }
  )
);

// Apply persisted theme immediately on import (before React renders)
const stored = (() => {
  try {
    const raw = localStorage.getItem("edu-theme");
    if (raw) return (JSON.parse(raw) as { state?: { theme?: Theme } }).state?.theme ?? "dark";
  } catch {}
  return "dark";
})();
applyTheme(stored);
