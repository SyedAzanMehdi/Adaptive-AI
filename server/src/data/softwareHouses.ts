// Curated starter directory, seeded once at boot if the collection is empty
// (see bootstrap.ts). Admin-managed only — students browse but cannot add,
// edit, or submit entries. Admins can add/edit/unpublish/delete freely.
export interface SoftwareHouseSeed {
  name: string;
  region: "pakistan" | "international";
  country: string;
  city: string;
  description: string;
  hiringFocus: string[];
}

export const SOFTWARE_HOUSES: SoftwareHouseSeed[] = [
  // --- Pakistan ---
  {
    name: "Systems Limited",
    region: "pakistan",
    country: "Pakistan",
    city: "Lahore",
    description: "One of Pakistan's largest IT services and digital transformation companies, publicly listed on the PSX.",
    hiringFocus: ["Enterprise Software", "ERP", "Cloud"],
  },
  {
    name: "NetSol Technologies",
    region: "pakistan",
    country: "Pakistan",
    city: "Lahore",
    description: "Global leader in asset/lease management software, with a major R&D base in Pakistan.",
    hiringFocus: ["FinTech", "Enterprise Software", ".NET"],
  },
  {
    name: "Arbisoft",
    region: "pakistan",
    country: "Pakistan",
    city: "Lahore",
    description: "Product engineering house known for long-term partnerships with edtech and travel-tech clients.",
    hiringFocus: ["Web Development", "EdTech", "Travel Tech"],
  },
  {
    name: "10Pearls",
    region: "pakistan",
    country: "Pakistan",
    city: "Karachi",
    description: "Digital product engineering firm serving US healthcare, fintech, and retail clients.",
    hiringFocus: ["Full-Stack", "Mobile", "QA Automation"],
  },
  {
    name: "Folio3",
    region: "pakistan",
    country: "Pakistan",
    city: "Karachi",
    description: "Software product development shop with dedicated verticals in AgTech, PetTech, and e-commerce.",
    hiringFocus: ["E-commerce", "Mobile", "AI/ML"],
  },
  {
    name: "Devsinc",
    region: "pakistan",
    country: "Pakistan",
    city: "Lahore",
    description: "One of the largest private software exporters in Pakistan, broad full-stack and QA delivery.",
    hiringFocus: ["Full-Stack", "QA Automation", "DevOps"],
  },
  {
    name: "VentureDive",
    region: "pakistan",
    country: "Pakistan",
    city: "Karachi",
    description: "Digital consultancy and venture studio building products across fintech, logistics, and media.",
    hiringFocus: ["Product Engineering", "Mobile", "Cloud"],
  },
  {
    name: "Contour Software",
    region: "pakistan",
    country: "Pakistan",
    city: "Lahore",
    description: "R&D arm for Vertical Market Software's portfolio of niche enterprise products.",
    hiringFocus: [".NET", "Enterprise Software", "QA"],
  },
  {
    name: "Techlogix",
    region: "pakistan",
    country: "Pakistan",
    city: "Lahore",
    description: "Enterprise software and systems integration house serving banking and telecom clients.",
    hiringFocus: ["Banking Software", "Systems Integration"],
  },
  {
    name: "Afiniti",
    region: "pakistan",
    country: "Pakistan",
    city: "Karachi",
    description: "AI company applying behavioral-pairing algorithms at scale for large contact centers.",
    hiringFocus: ["AI/ML", "Data Science", "Backend"],
  },

  // --- International ---
  {
    name: "Google",
    region: "international",
    country: "United States",
    city: "Mountain View, CA",
    description: "Global technology company spanning search, cloud, Android, and AI research.",
    hiringFocus: ["AI/ML", "Distributed Systems", "Cloud"],
  },
  {
    name: "Microsoft",
    region: "international",
    country: "United States",
    city: "Redmond, WA",
    description: "Enterprise software, cloud (Azure), and developer tools, with a huge engineering footprint.",
    hiringFocus: ["Cloud", "Enterprise Software", "AI/ML"],
  },
  {
    name: "Amazon",
    region: "international",
    country: "United States",
    city: "Seattle, WA",
    description: "E-commerce and cloud infrastructure (AWS) at massive scale.",
    hiringFocus: ["Distributed Systems", "Cloud", "Backend"],
  },
  {
    name: "Shopify",
    region: "international",
    country: "Canada",
    city: "Ottawa",
    description: "E-commerce platform powering millions of online stores worldwide.",
    hiringFocus: ["Full-Stack", "Ruby/Rails", "Mobile"],
  },
  {
    name: "ThoughtWorks",
    region: "international",
    country: "United Kingdom",
    city: "London",
    description: "Global technology consultancy known for agile practices and engineering excellence culture.",
    hiringFocus: ["Consulting", "Full-Stack", "DevOps"],
  },
  {
    name: "Endava",
    region: "international",
    country: "United Kingdom",
    city: "London",
    description: "Digital transformation consultancy serving payments, banking, and insurance clients.",
    hiringFocus: ["FinTech", "Enterprise Software", "Cloud"],
  },
  {
    name: "Globant",
    region: "international",
    country: "United States",
    city: "New York, NY",
    description: "Digitally native software consultancy with global delivery across many industries.",
    hiringFocus: ["Full-Stack", "AI/ML", "Mobile"],
  },
  {
    name: "Epic Systems",
    region: "international",
    country: "United States",
    city: "Verona, WI",
    description: "Dominant electronic health records vendor for large hospital systems.",
    hiringFocus: ["Healthcare Software", "Backend", "Databases"],
  },
  {
    name: "Atlassian",
    region: "international",
    country: "Australia",
    city: "Sydney",
    description: "Maker of Jira, Confluence, Trello — developer and team collaboration tools.",
    hiringFocus: ["Full-Stack", "DevOps", "Platform Engineering"],
  },
  {
    name: "Stripe",
    region: "international",
    country: "United States",
    city: "San Francisco, CA",
    description: "Payments infrastructure company known for API design and engineering rigor.",
    hiringFocus: ["Backend", "FinTech", "Distributed Systems"],
  },
];
