import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { prefersReducedMotion, EASE_OUT } from "../lib/anim";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}

/** GSAP entrance reveal: fades content up on mount. Honors reduced-motion. */
export default function Reveal({ children, delay = 0, y = 24, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        y,
        opacity: 0,
        duration: 0.6,
        delay,
        ease: EASE_OUT,
        clearProps: "transform",
      });
    });
    return () => ctx.revert();
  }, [delay, y]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
