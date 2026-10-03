import { Check, X } from "lucide-react";
import { PASSWORD_REQUIREMENTS } from "@edu/shared";

export function PasswordRequirements({ password }: { password: string }) {
  return (
    <div className="mt-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/60 p-3">
      <p className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
        Your password must contain:
      </p>
      <ul className="space-y-1">
        {PASSWORD_REQUIREMENTS.map((req) => {
          const met = req.test(password);
          return (
            <li
              key={req.id}
              className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
                met ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-500 dark:text-neutral-500"
              }`}
            >
              {met ? <Check size={12} strokeWidth={2.6} /> : <X size={12} strokeWidth={2.2} />}
              {req.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
