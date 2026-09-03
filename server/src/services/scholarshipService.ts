import { SCHOLARSHIPS, type Scholarship, type ScholarshipLevel } from "../data/scholarships.js";

export interface ScholarshipFilters {
  level?: string;
  country?: string;
  field?: string;
}

export interface MatchedScholarship extends Scholarship {
  matchScore: number;
  nextDeadline: string;
  daysLeft: number;
}

const DAY_MS = 86_400_000;

export function nextDeadline(month: number, day: number, from = new Date()): { iso: string; daysLeft: number } {
  const year = from.getFullYear();
  let next = new Date(Date.UTC(year, month - 1, day));
  if (next.getTime() <= from.getTime()) {
    next = new Date(Date.UTC(year + 1, month - 1, day));
  }
  const daysLeft = Math.ceil((next.getTime() - from.getTime()) / DAY_MS);
  return { iso: next.toISOString(), daysLeft };
}

export function matchScholarships(filters: ScholarshipFilters): MatchedScholarship[] {
  const level = filters.level?.trim().toLowerCase();
  const country = filters.country?.trim().toLowerCase();
  const field = filters.field?.trim().toLowerCase();

  return SCHOLARSHIPS
    .filter((s) => !level || s.level.includes(level as ScholarshipLevel))
    .filter((s) => !country || s.country.toLowerCase().includes(country) || country.includes(s.country.toLowerCase()))
    .filter((s) => !field || s.fields.includes("any") || s.fields.includes(field))
    .map((s) => {
      let score = 40;
      score += level ? 20 : 10;
      score += country ? 20 : 10;
      score += field ? (s.fields.includes("any") ? 15 : 20) : 10;
      if (s.funding === "full") score += 5;
      if (s.popularInPakistan) score += 5;

      const { iso, daysLeft } = nextDeadline(s.deadline.month, s.deadline.day);
      return { ...s, matchScore: Math.min(100, score), nextDeadline: iso, daysLeft };
    })
    .sort((a, b) => b.matchScore - a.matchScore || a.daysLeft - b.daysLeft);
}

export const SCHOLARSHIP_FILTER_OPTIONS = {
  levels: ["undergrad", "masters", "phd", "exchange"],
  countries: [...new Set(SCHOLARSHIPS.map((s) => s.country))].sort(),
  fields: ["computer_science", "engineering", "business", "sciences", "medicine", "humanities"],
};
