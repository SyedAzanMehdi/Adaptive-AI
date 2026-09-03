export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

export const EASE_OUT = "power3.out";
export const SPRING = { type: "spring" as const, stiffness: 260, damping: 20 };
