import { ChevronDown, Layers } from "lucide-react";
import { DOMAINS, DOMAIN_LABELS, useDomainFilter, type DomainFilter } from "../lib/domains";

export default function DomainSelect({ label = "Focus Domain" }: { label?: string }) {
  const [value, setValue] = useDomainFilter();

  return (
    <div>
      <span className="label">{label}</span>
      <div className="relative">
        <Layers
          size={14}
          strokeWidth={2.2}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600 dark:text-neutral-400 pointer-events-none"
        />
        <select
          className="input !pl-9 !pr-9 appearance-none cursor-pointer text-sm font-semibold"
          value={value}
          onChange={(e) => setValue(e.target.value as DomainFilter)}
          aria-label="Focus computing domain"
        >
          <option value="all">All Computing Domains</option>
          {DOMAINS.map((d) => (
            <option key={d} value={d}>
              {DOMAIN_LABELS[d]}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          strokeWidth={2.4}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
        />
      </div>
    </div>
  );
}
