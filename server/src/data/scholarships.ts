export type ScholarshipLevel = "undergrad" | "masters" | "phd" | "exchange";

export interface Scholarship {
  id: string;
  name: string;
  country: string;
  level: ScholarshipLevel[];
  funding: "full" | "partial";
  /** Annual application cycle close date (month/day). Next occurrence is computed at query time. */
  deadline: { month: number; day: number };
  englishTest: boolean;
  gpaMin: number | null;
  fields: string[];
  summary: string;
  popularInPakistan: boolean;
}

export const SCHOLARSHIP_FIELDS = [
  "computer_science",
  "engineering",
  "business",
  "sciences",
  "medicine",
  "humanities",
  "any",
] as const;

export const SCHOLARSHIPS: Scholarship[] = [
  {
    id: "chevening",
    name: "Chevening Scholarship",
    country: "United Kingdom",
    level: ["masters"],
    funding: "full",
    deadline: { month: 11, day: 5 },
    englishTest: false,
    gpaMin: null,
    fields: ["any"],
    summary:
      "Fully funded one-year UK master's for future leaders. Two years of work experience required; strong emphasis on leadership and networking essays.",
    popularInPakistan: true,
  },
  {
    id: "fulbright",
    name: "Fulbright Masters Program",
    country: "United States",
    level: ["masters"],
    funding: "full",
    deadline: { month: 4, day: 9 },
    englishTest: true,
    gpaMin: null,
    fields: ["any"],
    summary:
      "Flagship US government exchange award covering tuition, living, and travel. Pakistan is one of the largest Fulbright countries worldwide.",
    popularInPakistan: true,
  },
  {
    id: "daad-epos",
    name: "DAAD EPOS Master's",
    country: "Germany",
    level: ["masters"],
    funding: "full",
    deadline: { month: 10, day: 31 },
    englishTest: true,
    gpaMin: null,
    fields: ["engineering", "computer_science", "business", "sciences"],
    summary:
      "Monthly stipend for development-related postgraduate programmes at German universities. Tuition is free at most public universities.",
    popularInPakistan: true,
  },
  {
    id: "erasmus-mundus",
    name: "Erasmus Mundus Joint Masters",
    country: "European Union",
    level: ["masters"],
    funding: "full",
    deadline: { month: 1, day: 15 },
    englishTest: true,
    gpaMin: null,
    fields: ["any"],
    summary:
      "Study in 2–3 European countries on one joint degree. 150+ programmes across CS, engineering, data science, and more; stipend plus travel covered.",
    popularInPakistan: false,
  },
  {
    id: "mext",
    name: "MEXT Scholarship (Embassy Track)",
    country: "Japan",
    level: ["undergrad", "masters", "phd"],
    funding: "full",
    deadline: { month: 4, day: 30 },
    englishTest: false,
    gpaMin: null,
    fields: ["any"],
    summary:
      "Japanese government award covering tuition, monthly allowance, and flights. Research students apply through the embassy with a study plan.",
    popularInPakistan: false,
  },
  {
    id: "gks",
    name: "Global Korea Scholarship (GKS)",
    country: "South Korea",
    level: ["undergrad", "masters", "phd"],
    funding: "full",
    deadline: { month: 2, day: 10 },
    englishTest: false,
    gpaMin: 80,
    fields: ["any"],
    summary:
      "Korean government scholarship with a paid Korean-language year before the degree. Includes settlement and research allowances.",
    popularInPakistan: false,
  },
  {
    id: "turkiye-burslari",
    name: "Türkiye Bursları",
    country: "Türkiye",
    level: ["undergrad", "masters", "phd"],
    funding: "full",
    deadline: { month: 2, day: 20 },
    englishTest: false,
    gpaMin: 70,
    fields: ["any"],
    summary:
      "Turkish government scholarship with university placement, Turkish-language year, accommodation, and health insurance included.",
    popularInPakistan: true,
  },
  {
    id: "commonwealth-shared",
    name: "Commonwealth Shared Scholarship",
    country: "United Kingdom",
    level: ["masters"],
    funding: "full",
    deadline: { month: 12, day: 14 },
    englishTest: true,
    gpaMin: null,
    fields: ["engineering", "computer_science", "sciences", "medicine", "humanities"],
    summary:
      "Development-themed UK master's for Commonwealth citizens. Apply to a participating university and the CSC in parallel.",
    popularInPakistan: true,
  },
  {
    id: "australia-awards",
    name: "Australia Awards",
    country: "Australia",
    level: ["masters"],
    funding: "full",
    deadline: { month: 4, day: 30 },
    englishTest: true,
    gpaMin: null,
    fields: ["any"],
    summary:
      "Australian government awards focused on development impact; includes pre-departure training and a reintegration plan.",
    popularInPakistan: false,
  },
  {
    id: "eiffel",
    name: "Eiffel Excellence Scholarship",
    country: "France",
    level: ["masters", "phd"],
    funding: "partial",
    deadline: { month: 1, day: 8 },
    englishTest: false,
    gpaMin: null,
    fields: ["engineering", "computer_science", "sciences", "business"],
    summary:
      "Prestigious French government monthly allowance for top international candidates. Applications go through the admitting French institution.",
    popularInPakistan: false,
  },
  {
    id: "knight-hennessy",
    name: "Knight-Hennessy Scholars",
    country: "United States",
    level: ["masters", "phd"],
    funding: "full",
    deadline: { month: 10, day: 9 },
    englishTest: true,
    gpaMin: null,
    fields: ["any"],
    summary:
      "Full funding for any Stanford graduate programme plus a leadership development programme. Apply separately from Stanford admission.",
    popularInPakistan: false,
  },
  {
    id: "gates-cambridge",
    name: "Gates Cambridge Scholarship",
    country: "United Kingdom",
    level: ["masters", "phd"],
    funding: "full",
    deadline: { month: 12, day: 1 },
    englishTest: true,
    gpaMin: null,
    fields: ["any"],
    summary:
      "Full-cost award for outstanding applicants from outside the UK to study at Cambridge. Leadership and service to society weigh heavily.",
    popularInPakistan: false,
  },
  {
    id: "schwarzman",
    name: "Schwarzman Scholars",
    country: "China",
    level: ["masters"],
    funding: "full",
    deadline: { month: 9, day: 22 },
    englishTest: true,
    gpaMin: null,
    fields: ["any"],
    summary:
      "One-year fully funded master's in global affairs at Tsinghua University, Beijing. Built as the 21st century's Rhodes Scholarship.",
    popularInPakistan: false,
  },
  {
    id: "stipendium-hungaricum",
    name: "Stipendium Hungaricum",
    country: "Hungary",
    level: ["undergrad", "masters", "phd"],
    funding: "full",
    deadline: { month: 1, day: 15 },
    englishTest: false,
    gpaMin: null,
    fields: ["any"],
    summary:
      "Hungarian government programme with hundreds of English-taught degrees, dormitory housing, and a generous country quota for Pakistan.",
    popularInPakistan: true,
  },
  {
    id: "swiss-excellence",
    name: "Swiss Government Excellence",
    country: "Switzerland",
    level: ["phd", "exchange"],
    funding: "full",
    deadline: { month: 12, day: 31 },
    englishTest: false,
    gpaMin: null,
    fields: ["sciences", "engineering", "computer_science", "humanities"],
    summary:
      "Research and PhD fellowships at Swiss universities with one of the highest monthly stipends in Europe.",
    popularInPakistan: false,
  },
];

export function findScholarship(id: string): Scholarship | undefined {
  return SCHOLARSHIPS.find((s) => s.id === id);
}
