import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Shared dashed-border empty-state card. */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = "card !p-10 text-center border-dashed border-neutral-300 dark:border-neutral-700",
}: EmptyStateProps) {
  return (
    <div className={className}>
      <span className="mx-auto mb-3 flex w-fit text-neutral-400">{icon}</span>
      <h2 className="font-black text-black dark:text-white mb-1">{title}</h2>
      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
