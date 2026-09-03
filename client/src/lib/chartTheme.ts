import { useThemeStore } from "../stores/theme";

/** Monochrome Chart.js palette that follows the active theme. */
export function useChartTheme() {
  const theme = useThemeStore((s) => s.theme);
  const dark = theme !== "light";
  return {
    dark,
    text: dark ? "#a3a3a3" : "#525252",
    ticks: dark ? "#737373" : "#525252",
    grid: dark ? "#262626" : "#e5e5e5",
    line: dark ? "#737373" : "#404040",
    lineSoft: dark ? "#525252" : "#a3a3a3",
    point: dark ? "#a3a3a3" : "#525252",
    pointBorder: dark ? "#ffffff" : "#000000",
    barFill: dark ? "#e5e5e5" : "#171717",
    barHover: dark ? "#a3a3a3" : "#525252",
    fill: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    tooltipBg: dark ? "#000000" : "#ffffff",
    tooltipBorder: dark ? "#404040" : "#d4d4d4",
    tooltipText: dark ? "#fafafa" : "#0a0a0a",
  };
}
