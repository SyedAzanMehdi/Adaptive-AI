/** Shared inline error block for a failed mutation/query. */
export default function ErrorBanner({ message, className = "" }: { message: string; className?: string }) {
  return (
    <div
      className={`bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-700 dark:text-neutral-300 rounded-xl p-3.5 text-xs font-medium ${className}`}
    >
      {message}
    </div>
  );
}
