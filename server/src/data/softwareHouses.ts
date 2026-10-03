// Curated starter directory, seeded once at boot if the collection is empty
// (see bootstrap.ts). Admins can edit/add/remove freely afterward; students
// can submit new entries which land in the moderation queue (approved: false)
// until an admin reviews them.
export interface SoftwareHouseSeed {
  name: string;
  website: string;
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
    website: "https://www.systemsltd.com",
    region: "pakistan",
    country: "Pakistan",
    city: "Lahore",
    description: "One of Pakistan's largest IT services and digital transformation companies, publicly listed on the PSX.",
    hiringFocus: ["Enterprise Software", "ERP", "Cloud"],
  },
  {
    name: "NetSol Technologies",
    website: "https://www.netsoltech.com",
    region: "pakistan",
    country: "Pakistan",
    city: "Lahore",
    description: "Global leader in asset/lease management software, with a major R&D base in Pakistan.",
    hiringFocus: ["FinTech", "Enterprise Software", ".NET"],
  },
  {
    name: "Arbisoft",
    website: "https://www.arbisoft.com",
    region: "pakistan",
    country: "Pakistan",
    city: "Lahore",
    description: "Product engineering house known for long-term partnerships with edtech and travel-tech clients.",
    hiringFocus: ["Web Development", "EdTech", "Travel Tech"],
  },
  {
    name: "10Pearls",
    website: "https://www.10pearls.com",
    region: "pakistan",
    country: "Pakistan",
    city: "Karachi",
    description: "Digital product engineering firm serving US healthcare, fintech, and retail clients.",
    hiringFocus: ["Full-Stack", "Mobile", "QA Automation"],
  },
  {
    name: "Folio3",
    website: "https://www.folio3.com",
    region: "pakistan",
    country: "Pakistan",
    city: "Karachi",
    description: "Software product development shop with dedicated verticals in AgTech, PetTech, and e-commerce.",
    hiringFocus: ["E-commerce", "Mobile", "AI/ML"],
  },
  {
    name: "Devsinc",
    website: "https://devsinc.com",
    region: "pakistan",
    country: "Pakistan",
    city: "Lahore",
    description: "One of the largest private software exporters in Pakistan, broad full-stack and QA delivery.",
    hiringFocus: ["Full-Stack", "QA Automation", "DevOps"],
  },
  {
    name: "VentureDive",
    website: "https://venturedive.com",
    region: "pakistan",
    country: "Pakistan",
    city: "Karachi",
    description: "Digital consultancy and venture studio building products across fintech, logistics, and media.",
    hiringFocus: ["Product Engineering", "Mobile", "Cloud"],
  },
  {
    name: "Contour Software",
    website: "https://www.contoursoftware.com",
    region: "pakistan",
    country: "Pakistan",
    city: "Lahore",
    description: "R&D arm for Vertical Market Software's portfolio of niche enterprise products.",
    hiringFocus: [".NET", "Enterprise Software", "QA"],
  },
  {
    name: "Techlogix",
    website: "https://www.techlogix.com",
    region: "pakistan",
    country: "Pakistan",
    city: "Lahore",
    description: "Enterprise software and systems integration house serving banking and telecom clients.",
    hiringFocus: ["Banking Software", "Systems Integration"],
  },
  {
    name: "Afiniti",
    website: "https://www.afiniti.com",
    region: "pakistan",
    country: "Pakistan",
    city: "Karachi",
    description: "AI company applying behavioral-pairing algorithms at scale for large contact centers.",
    hiringFocus: ["AI/ML", "Data Science", "Backend"],
  },

  // --- International ---
  {
    name: "Google",
    website: "https://careers.google.com",
    region: "international",
    country: "United States",
    city: "Mountain View, CA",
    description: "Global technology company spanning search, cloud, Android, and AI research.",
    hiringFocus: ["AI/ML", "Distributed Systems", "Cloud"],
  },
  {
    name: "Microsoft",
    website: "https://careers.microsoft.com",
    region: "international",
    country: "United States",
    city: "Redmond, WA",
    description: "Enterprise software, cloud (Azure), and developer tools, with a huge engineering footprint.",
    hiringFocus: ["Cloud", "Enterprise Software", "AI/ML"],
  },
  {
    name: "Amazon",
    website: "https://www.amazon.jobs",
    region: "international",
    country: "United States",
    city: "Seattle, WA",
    description: "E-commerce and cloud infrastructure (AWS) at massive scale.",
    hiringFocus: ["Distributed Systems", "Cloud", "Backend"],
  },
  {
    name: "Shopify",
    website: "https://www.shopify.com/careers",
    region: "international",
    country: "Canada",
    city: "Ottawa",
    description: "E-commerce platform powering millions of online stores worldwide.",
    hiringFocus: ["Full-Stack", "Ruby/Rails", "Mobile"],
  },
  {
    name: "ThoughtWorks",
    website: "https://www.thoughtworks.com/careers",
    region: "international",
    country: "United Kingdom",
    city: "London",
    description: "Global technology consultancy known for agile practices and engineering excellence culture.",
    hiringFocus: ["Consulting", "Full-Stack", "DevOps"],
  },
  {
    name: "Endava",
    website: "https://www.endava.com/careers",
    region: "international",
    country: "United Kingdom",
    city: "London",
    description: "Digital transformation consultancy serving payments, banking, and insurance clients.",
    hiringFocus: ["FinTech", "Enterprise Software", "Cloud"],
  },
  {
    name: "Globant",
    website: "https://www.globant.com/careers",
    region: "international",
    country: "United States",
    city: "New York, NY",
    description: "Digitally native software consultancy with global delivery across many industries.",
    hiringFocus: ["Full-Stack", "AI/ML", "Mobile"],
  },
  {
    name: "Epic Systems",
    website: "https://careers.epic.com",
    region: "international",
    country: "United States",
    city: "Verona, WI",
    description: "Dominant electronic health records vendor for large hospital systems.",
    hiringFocus: ["Healthcare Software", "Backend", "Databases"],
  },
  {
    name: "Atlassian",
    website: "https://www.atlassian.com/company/careers",
    region: "international",
    country: "Australia",
    city: "Sydney",
    description: "Maker of Jira, Confluence, Trello — developer and team collaboration tools.",
    hiringFocus: ["Full-Stack", "DevOps", "Platform Engineering"],
  },
  {
    name: "Stripe",
    website: "https://stripe.com/jobs",
    region: "international",
    country: "United States",
    city: "San Francisco, CA",
    description: "Payments infrastructure company known for API design and engineering rigor.",
    hiringFocus: ["Backend", "FinTech", "Distributed Systems"],
  },
];
