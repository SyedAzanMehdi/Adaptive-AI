/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        // Restrained accent on top of the monochrome base: CTAs, links, and
        // premium cues. Everything else stays grayscale by design.
        accent: {
          DEFAULT: "#3b82f6",
          hover: "#2563eb",
          light: "#60a5fa",
        },
        // Status hues — used only for gap/developing/strong/unmeasured
        // indicators so they read at a glance instead of relying solely on
        // gray weight (a flat monochrome scale is hard to parse for
        // colorblind/low-vision users).
        success: {
          DEFAULT: "#10b981",
          light: "#34d399",
        },
        warning: {
          DEFAULT: "#f59e0b",
          light: "#fbbf24",
        },
        danger: {
          DEFAULT: "#ef4444",
          light: "#f87171",
        },
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.08)",
        "glass-sm": "0 4px 16px 0 rgba(0, 0, 0, 0.05)",
        "glow-indigo": "0 0 25px -5px rgba(99, 102, 241, 0.4)",
        "glow-cyan": "0 0 25px -5px rgba(6, 182, 212, 0.4)",
        "glow-amber": "0 0 25px -5px rgba(245, 158, 11, 0.4)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2.5s infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};

