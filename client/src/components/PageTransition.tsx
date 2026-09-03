import type { ReactNode } from "react";
import { motion } from "motion/react";
import { useLocation } from "react-router-dom";
import { prefersReducedMotion } from "../lib/anim";

/** Fade/slide page entrance keyed by route, honoring reduced motion. */
export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const reduce = prefersReducedMotion();
  return (
    <motion.div
      key={pathname}
      initial={reduce ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
