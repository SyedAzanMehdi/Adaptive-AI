import type { ReactNode } from "react";

interface PageHeroProps {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

/** Shared gradient-blob hero banner used at the top of every student page. */
export default function PageHero({ icon, eyebrow, title, description, actions }: PageHeroProps) {
  return (
    <div className="learning-spotlight relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-black/5 dark:bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-800 dark:text-neutral-200 text-xs font-semibold mb-3">
          {icon}
          {eyebrow}
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-black dark:text-white tracking-tight">{title}</h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
          {description}
        </p>
        {actions && <div className="flex flex-wrap gap-2 mt-4">{actions}</div>}
      </div>
    </div>
  );
}
