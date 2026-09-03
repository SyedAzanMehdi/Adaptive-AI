import { DOMAINS, type Domain } from "@edu/shared";
import { useSyncExternalStore } from "react";

export { DOMAINS, type Domain };

export type DomainFilter = Domain | "all";

export const DOMAIN_LABELS: Record<Domain, string> = {
  syntax: "Programming Syntax",
  oop: "Object-Oriented Programming",
  data_structures: "Data Structures",
  algorithms: "Algorithms",
  debugging: "Debugging & Testing",
};

export function domainLabel(domain: string): string {
  return DOMAIN_LABELS[domain as Domain] ?? domain.replace(/_/g, " ");
}

const STORAGE_KEY = "edu.domainFilter";

function isValid(v: string | null): v is DomainFilter {
  return v !== null && (v === "all" || (DOMAINS as readonly string[]).includes(v));
}

let current: DomainFilter = (() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return isValid(raw) ? raw : "all";
  } catch {
    return "all";
  }
})();

const listeners = new Set<() => void>();

export function setDomainFilter(value: DomainFilter): void {
  if (current === value) return;
  current = value;
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // storage unavailable (private mode) — selection stays in-memory
  }
  listeners.forEach((l) => l());
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

/** Selected computing domain, persisted across pages and sessions. */
export function useDomainFilter(): [DomainFilter, (value: DomainFilter) => void] {
  const value = useSyncExternalStore(subscribe, () => current, () => current);
  return [value, setDomainFilter];
}
