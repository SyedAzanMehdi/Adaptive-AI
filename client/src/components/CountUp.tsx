import { useEffect, useRef } from "react";
import { animate } from "motion/react";
import { prefersReducedMotion } from "../lib/anim";

interface CountUpProps {
  to: number;
  duration?: number;
  suffix?: string;
}

/** Animated number that eases from 0 to `to`. */
export default function CountUp({ to, duration = 0.9, suffix = "" }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (prefersReducedMotion()) {
      ref.current.textContent = `${to}${suffix}`;
      return;
    }
    const controls = animate(0, to, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = `${Math.round(v)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [to, duration, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}
