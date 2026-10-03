export interface TechTerm {
  term: string;
  definition: string;
}

export interface TechCategory {
  id: string;
  title: string;
  blurb: string;
  terms: TechTerm[];
  // Only the Economy/Recession category uses this: a causal chain worth
  // seeing as a flow rather than a flat list of definitions.
  chain?: string[];
}

export const TECH_DICTIONARY: TechCategory[] = [
  {
    id: "basics",
    title: "Basic Technology Terms",
    blurb: "The vocabulary everything else in tech builds on.",
    terms: [
      { term: "Hardware", definition: "The physical parts of a computer system — CPU, memory, disks, cables, screens — anything you can touch." },
      { term: "Software", definition: "Instructions (code) that tell hardware what to do; everything from an OS to a mobile app." },
      { term: "Operating System", definition: "The base software (Windows, macOS, Linux, Android, iOS) that manages hardware and runs every other program." },
      { term: "Application", definition: "A program built for a specific task — a browser, a spreadsheet, a chat app — running on top of an OS." },
      { term: "Server", definition: "A computer (or program) that provides data or services to other computers (\"clients\") over a network." },
      { term: "Client", definition: "The program or device that requests data/services from a server — your browser, your phone app." },
      { term: "Database", definition: "Organized, persistent storage for data, built to be queried, updated, and kept consistent reliably." },
      { term: "API", definition: "Application Programming Interface — a defined contract that lets one piece of software ask another to do something, without seeing its internals." },
      { term: "Algorithm", definition: "A precise, step-by-step procedure for solving a problem or completing a task." },
      { term: "Framework", definition: "A pre-built structure/set of rules (e.g. React, Django) that you build your application inside of, to avoid reinventing common plumbing." },
      { term: "Library", definition: "A reusable chunk of code you call into your own program, as opposed to a framework which calls into yours." },
      { term: "Open Source", definition: "Software whose source code is published publicly, usually under a license allowing others to use, study, and modify it." },
    ],
  },
  {
    id: "software-development",
    title: "Software Development Terms",
    blurb: "How software actually gets built, shipped, and kept running.",
    terms: [
      { term: "Frontend", definition: "The part of an application users see and interact with directly — UI, layout, client-side behavior." },
      { term: "Backend", definition: "The server-side logic, databases, and infrastructure that power an application behind the scenes." },
      { term: "Full Stack", definition: "Working across both frontend and backend of an application, rather than specializing in just one." },
      { term: "Programming Language", definition: "A formal language (Python, JavaScript, Java, C++, …) used to write instructions a computer can execute." },
      { term: "IDE", definition: "Integrated Development Environment — an editor bundled with debugging, build, and project tools (VS Code, IntelliJ, …)." },
      { term: "SDK", definition: "Software Development Kit — a bundled set of tools/libraries for building on a specific platform (e.g. an Android SDK)." },
      { term: "Git / GitHub", definition: "Git is the version-control tool that tracks code changes over time; GitHub is a hosted platform for storing and collaborating on Git repositories." },
      { term: "Version Control", definition: "A system for tracking and managing changes to code over time, so you can see history, branch, and revert safely." },
      { term: "Debugging", definition: "The process of finding and fixing the root cause of incorrect behavior in software." },
      { term: "Testing", definition: "Verifying software behaves correctly — manually or via automated tests — before and after it changes." },
      { term: "Deployment", definition: "The process of making a built application available and running in its target environment (e.g. production)." },
      { term: "CI/CD", definition: "Continuous Integration / Continuous Deployment — automated pipelines that build, test, and ship code changes frequently and reliably." },
      { term: "Agile", definition: "An iterative approach to building software in small, frequently-reviewed increments rather than one long upfront plan." },
      { term: "DevOps", definition: "A culture/practice merging development and operations so teams build, deploy, and operate software together, continuously." },
    ],
  },
  {
    id: "artificial-intelligence",
    title: "Artificial Intelligence Terms",
    blurb: "The vocabulary of the field reshaping every other field right now.",
    terms: [
      { term: "Artificial Intelligence (AI)", definition: "Software systems designed to perform tasks that normally require human-like intelligence — reasoning, perception, language." },
      { term: "Machine Learning", definition: "A subfield of AI where systems learn patterns from data rather than following hand-written rules." },
      { term: "Deep Learning", definition: "A machine-learning approach using multi-layered neural networks, behind most modern AI breakthroughs." },
      { term: "Generative AI", definition: "AI systems that create new content — text, images, audio, code — rather than only classifying or predicting." },
      { term: "Large Language Model (LLM)", definition: "A deep-learning model trained on huge amounts of text to understand and generate human language (e.g. the model behind this chat)." },
      { term: "Transformer", definition: "The neural-network architecture (introduced 2017) underlying nearly all modern LLMs, built around an \"attention\" mechanism." },
      { term: "Prompt Engineering", definition: "The practice of carefully wording instructions to an AI model to reliably get the output you want." },
      { term: "AI Agent", definition: "An AI system that can take multi-step actions toward a goal — calling tools, making decisions — not just answering one question." },
      { term: "Agentic AI", definition: "AI systems/products built around autonomous, multi-step agent behavior rather than single-turn responses." },
      { term: "RAG", definition: "Retrieval-Augmented Generation — having an AI model look up relevant external data before answering, to ground its response in real facts." },
      { term: "Fine-tuning", definition: "Further training a pre-trained AI model on specific data so it specializes for a particular task or domain." },
      { term: "Hallucination", definition: "When an AI model confidently states something false or made-up as if it were fact." },
      { term: "Computer Vision", definition: "The field of AI focused on understanding images and video — object detection, recognition, scene understanding." },
      { term: "NLP", definition: "Natural Language Processing — the field of AI focused on understanding and generating human language." },
    ],
  },
  {
    id: "networking",
    title: "Networking & IT Infrastructure",
    blurb: "How machines actually talk to each other.",
    terms: [
      { term: "LAN / WAN", definition: "A LAN (Local Area Network) covers one site (e.g. an office); a WAN (Wide Area Network) spans multiple sites/cities, often via the internet." },
      { term: "IP Address", definition: "A numeric address that identifies a device on a network, used to route data to the right destination." },
      { term: "DNS", definition: "Domain Name System — translates human-readable domain names (google.com) into IP addresses computers actually use." },
      { term: "DHCP", definition: "Dynamic Host Configuration Protocol — automatically assigns IP addresses to devices joining a network." },
      { term: "Router", definition: "A device that directs data between networks, choosing the best path for traffic to reach its destination." },
      { term: "Switch", definition: "A device that connects multiple devices within one network, forwarding data only to its intended recipient." },
      { term: "Firewall", definition: "A security system that monitors and filters network traffic based on defined rules, blocking unauthorized access." },
      { term: "VPN", definition: "Virtual Private Network — creates an encrypted tunnel over the internet so traffic looks like it's on a private, trusted network." },
      { term: "Data Center", definition: "A facility housing large numbers of servers and networking equipment that run applications and store data at scale." },
      { term: "Virtual Machine", definition: "A software-emulated computer running inside a real one, isolated from other VMs on the same hardware." },
      { term: "Container", definition: "A lightweight, isolated unit that packages an application with everything it needs to run consistently anywhere (e.g. Docker)." },
      { term: "Load Balancer", definition: "A system that distributes incoming traffic across multiple servers so no single one is overwhelmed." },
    ],
  },
  {
    id: "cloud-computing",
    title: "Cloud Computing Terms",
    blurb: "Renting computing power instead of owning the hardware.",
    terms: [
      { term: "Cloud Computing", definition: "Delivering computing resources (servers, storage, databases) over the internet on demand, instead of owning physical hardware." },
      { term: "Public / Private / Hybrid Cloud", definition: "Public cloud is shared infrastructure run by a provider; private cloud is dedicated to one organization; hybrid combines both." },
      { term: "IaaS", definition: "Infrastructure as a Service — rented raw computing infrastructure (servers, storage, networking) you configure yourself." },
      { term: "PaaS", definition: "Platform as a Service — a managed environment to build and run applications without managing the underlying infrastructure." },
      { term: "SaaS", definition: "Software as a Service — fully-built software delivered over the internet, used directly without installation (e.g. Gmail)." },
      { term: "Serverless", definition: "A cloud model where code runs on-demand without you managing any server at all — you pay only for execution time." },
      { term: "AWS", definition: "Amazon Web Services — the largest cloud computing platform, offering hundreds of on-demand infrastructure services." },
      { term: "Azure", definition: "Microsoft's cloud computing platform, widely used in enterprise and Microsoft-centric environments." },
      { term: "Google Cloud", definition: "Google's cloud computing platform, notably strong in data analytics and AI/ML services." },
      { term: "Scalability", definition: "A system's ability to handle growing load by adding resources, ideally without a redesign." },
      { term: "Availability", definition: "The proportion of time a system is actually up and usable, often expressed as \"99.9% uptime\" and similar." },
      { term: "Cloud Migration", definition: "The process of moving applications and data from on-premise infrastructure into the cloud." },
    ],
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity Terms",
    blurb: "Keeping systems and data safe from people trying to break them.",
    terms: [
      { term: "Cybersecurity", definition: "The practice of protecting systems, networks, and data from unauthorized access, damage, or disruption." },
      { term: "Vulnerability", definition: "A weakness in a system that could be exploited to cause harm or unauthorized access." },
      { term: "Exploit", definition: "Code or a technique that takes advantage of a specific vulnerability to cause an unintended effect." },
      { term: "Malware", definition: "Malicious software designed to damage, disrupt, or gain unauthorized access to a system." },
      { term: "Ransomware", definition: "Malware that encrypts a victim's data and demands payment for the decryption key." },
      { term: "Phishing", definition: "A social-engineering attack that tricks people into revealing credentials or sensitive data, usually via fake emails or sites." },
      { term: "Encryption", definition: "Converting data into a coded form so only authorized parties with the right key can read it." },
      { term: "Authentication", definition: "Verifying that someone is who they claim to be (e.g. checking a password)." },
      { term: "Authorization", definition: "Determining what an already-authenticated user is allowed to do or access." },
      { term: "MFA", definition: "Multi-Factor Authentication — requiring more than one form of proof of identity (e.g. password + phone code)." },
      { term: "Zero Trust", definition: "A security model that trusts no device or user by default, verifying every request regardless of network location." },
      { term: "Penetration Testing", definition: "Authorized, simulated attacks on a system to find vulnerabilities before real attackers do." },
      { term: "SOC", definition: "Security Operations Center — a team/facility that continuously monitors and responds to security threats." },
    ],
  },
  {
    id: "tech-market",
    title: "Tech Market & Industry",
    blurb: "How the tech business world is structured.",
    terms: [
      { term: "Tech Market", definition: "The overall economic space of technology products, services, and companies." },
      { term: "IT Industry", definition: "The broad industry covering information technology products and services." },
      { term: "Software Industry", definition: "The sector of the economy focused specifically on producing and selling software." },
      { term: "Startup", definition: "A young company, usually built to test and scale a new product or business model quickly." },
      { term: "Big Tech", definition: "The small group of dominant global technology companies (e.g. Google, Microsoft, Amazon, Meta, Apple)." },
      { term: "Tech Ecosystem", definition: "The network of companies, investors, talent, and institutions that support technology innovation in a region." },
      { term: "B2B", definition: "Business-to-Business — companies that sell their product or service to other businesses, not individual consumers." },
      { term: "B2C", definition: "Business-to-Consumer — companies that sell directly to individual end users." },
      { term: "SaaS Business", definition: "A company whose core product is software delivered and billed as a recurring online service." },
      { term: "Outsourcing", definition: "Hiring an external company to perform work instead of doing it in-house." },
      { term: "Product-Based Company", definition: "A company that builds and sells its own software product (e.g. to many customers), rather than custom client work." },
      { term: "Service-Based Company", definition: "A company that builds custom software for clients on contract, rather than selling its own product." },
      { term: "Freelancing", definition: "Working independently for multiple clients on a project or contract basis, rather than as a salaried employee." },
      { term: "Remote Work", definition: "Working from a location other than a company's physical office, often from home or anywhere." },
    ],
  },
  {
    id: "tech-market-types",
    title: "Types of Tech Markets",
    blurb: "The major sub-markets within the broader tech industry.",
    terms: [
      { term: "Software Development Market", definition: "The market for building custom and off-the-shelf software products and services." },
      { term: "AI & Machine Learning Market", definition: "The market for AI/ML products, platforms, and services — currently the fastest-growing tech segment." },
      { term: "Cloud Computing Market", definition: "The market for renting computing infrastructure and platforms over the internet." },
      { term: "Cybersecurity Market", definition: "The market for tools and services that protect systems and data from attacks." },
      { term: "Networking & Infrastructure Market", definition: "The market for the hardware/software that connects and runs computing systems." },
      { term: "Semiconductor/Hardware Market", definition: "The market for chips and physical computing hardware underlying every other tech market." },
      { term: "FinTech", definition: "Technology applied to financial services — payments, banking, lending, investing." },
      { term: "HealthTech", definition: "Technology applied to healthcare — records, diagnostics, telemedicine, medical devices." },
      { term: "EdTech", definition: "Technology applied to education and learning — exactly the category this platform is in." },
      { term: "E-commerce", definition: "Buying and selling goods/services online." },
      { term: "Gaming", definition: "The industry building interactive entertainment software, from mobile games to AAA titles." },
      { term: "IoT", definition: "Internet of Things — physical devices (sensors, appliances, machines) connected to networks and each other." },
      { term: "Robotics", definition: "The field building physical machines that sense, plan, and act in the real world." },
      { term: "Blockchain/Web3", definition: "Decentralized, cryptographically-verified ledgers and the applications built on top of them." },
    ],
  },
  {
    id: "tech-jobs",
    title: "Tech Jobs & Career Terms",
    blurb: "Common job titles across the industry, and roughly what each actually does.",
    terms: [
      { term: "Software Engineer", definition: "Designs, builds, and maintains software systems — the broadest and most common tech job title." },
      { term: "Full-Stack Developer", definition: "A software engineer who works across both frontend and backend of an application." },
      { term: "DevOps Engineer", definition: "Builds and maintains the infrastructure, pipelines, and automation that let software ship and run reliably." },
      { term: "Cloud Engineer", definition: "Designs and manages systems that run on cloud platforms like AWS, Azure, or GCP." },
      { term: "Network Engineer", definition: "Designs, implements, and maintains computer networks." },
      { term: "Cybersecurity Analyst", definition: "Monitors systems for threats, investigates incidents, and helps harden an organization's defenses." },
      { term: "Data Scientist", definition: "Analyzes data and builds models to extract insights and support decisions." },
      { term: "AI/ML Engineer", definition: "Builds, trains, and deploys machine-learning and AI models into real products." },
      { term: "Data Engineer", definition: "Builds the pipelines and infrastructure that move and prepare data for analysis and ML." },
      { term: "System Administrator", definition: "Maintains and operates an organization's servers, systems, and infrastructure day-to-day." },
      { term: "Solutions Architect", definition: "Designs the overall technical structure of a system or product, balancing tradeoffs across teams." },
      { term: "Product Manager", definition: "Decides what a product should do and why, coordinating engineering, design, and business priorities." },
      { term: "UI/UX Designer", definition: "Designs how a product looks and feels to use — interface layout and overall user experience." },
    ],
  },
  {
    id: "job-market",
    title: "Job Market Terms",
    blurb: "Vocabulary for understanding hiring conditions, not just job titles.",
    terms: [
      { term: "Job Market", definition: "The overall supply and demand for jobs and workers in an industry or economy." },
      { term: "Job Demand", definition: "How many open roles employers are actively trying to fill in a given field." },
      { term: "Talent Supply", definition: "How many qualified workers are available for a given type of role." },
      { term: "Skill Gap", definition: "A mismatch between the skills employers need and the skills available in the job market." },
      { term: "Entry-Level Job", definition: "A role designed for someone with little to no prior professional experience." },
      { term: "Internship", definition: "A temporary, often junior, work placement used to gain experience — sometimes a pathway to a full role." },
      { term: "Graduate Role", definition: "A job specifically aimed at recent graduates, often with structured onboarding/training." },
      { term: "Hiring Freeze", definition: "A company-wide pause on filling open positions, usually during cost-cutting." },
      { term: "Layoff", definition: "An employer-initiated termination of employees, usually for cost or business reasons, not performance." },
      { term: "Downsizing", definition: "Reducing a company's workforce, often alongside layoffs, to cut costs or restructure." },
      { term: "Restructuring", definition: "Reorganizing a company's teams, roles, or strategy, often accompanying layoffs or a pivot." },
      { term: "Outsourcing", definition: "Moving work to an external company instead of doing it with in-house staff." },
      { term: "Offshoring", definition: "Moving work or jobs to a different country, usually for lower cost." },
      { term: "Automation", definition: "Using software/machines to perform tasks that previously required a human to do manually." },
      { term: "AI Displacement", definition: "Jobs or tasks being reduced or eliminated because AI can now do them." },
      { term: "AI-Augmented Jobs", definition: "Roles where AI tools make a human worker more capable/productive, rather than replacing them outright." },
    ],
  },
  {
    id: "economy-recession",
    title: "Economy, Recession & Tech Market",
    blurb: "Why the broader economy quietly decides how hard it is to get a tech job.",
    terms: [
      { term: "Economic Growth", definition: "An increase in the overall output/activity of an economy over time." },
      { term: "Economic Slowdown", definition: "A period where economic growth decelerates, without necessarily becoming negative." },
      { term: "Recession", definition: "A significant, sustained decline in economic activity — typically measured as shrinking GDP for two straight quarters." },
      { term: "Inflation", definition: "A general rise in prices over time, reducing how much the same amount of money can buy." },
      { term: "Interest Rates", definition: "The cost of borrowing money, set largely by central banks; higher rates slow borrowing and spending." },
      { term: "Unemployment", definition: "The share of people actively looking for work who cannot find a job." },
      { term: "Venture Capital", definition: "Investment funding provided to early-stage, high-growth-potential companies in exchange for equity." },
      { term: "Funding", definition: "Money raised by a company to operate and grow, from investors, loans, or revenue." },
      { term: "Valuation", definition: "An estimate of what a company is worth, often set during a funding round." },
      { term: "IPO", definition: "Initial Public Offering — when a private company first sells shares to the public on a stock exchange." },
      { term: "Bear Market", definition: "A prolonged period of falling asset prices, generally 20%+ down from a recent high." },
      { term: "Bull Market", definition: "A prolonged period of rising asset prices and investor optimism." },
      { term: "Market Correction", definition: "A short-term drop in asset prices (typically 10%+), smaller and faster than a full bear market." },
      { term: "Tech Bubble", definition: "A period where tech company valuations rise far beyond what their fundamentals justify, before eventually falling." },
      { term: "Dot-com Bubble", definition: "The late-1990s tech/internet valuation bubble that burst in 2000, wiping out many early internet companies." },
    ],
    chain: [
      "Economic slowdown",
      "Companies earn/invest less",
      "Cost cutting",
      "Hiring freezes",
      "Layoffs / restructuring",
      "Fewer entry-level openings",
      "Higher competition per role",
      "Specialized, practical skills matter more",
    ],
  },
  {
    id: "startup-investment",
    title: "Startup & Investment Terms",
    blurb: "How young companies get funded, survive, and sometimes exit.",
    terms: [
      { term: "Startup", definition: "A young company built to test and rapidly scale a new product or business model." },
      { term: "Founder / Co-founder", definition: "The person (or people) who started the company and typically hold early equity and leadership roles." },
      { term: "Bootstrapping", definition: "Building and growing a company using only personal savings/revenue, without outside investment." },
      { term: "Angel Investor", definition: "A wealthy individual who invests their own money into early-stage startups, usually before VCs get involved." },
      { term: "Venture Capital (VC)", definition: "Professional investment firms that fund high-growth startups in exchange for equity." },
      { term: "Seed Funding", definition: "The first significant round of investment a startup raises, usually to build an initial product and find traction." },
      { term: "Series A/B/C", definition: "Successive funding rounds after seed, each usually larger, at a higher valuation, as the company scales." },
      { term: "Burn Rate", definition: "How quickly a company spends its cash reserves, usually measured per month." },
      { term: "Runway", definition: "How long a company can keep operating at its current burn rate before running out of money." },
      { term: "Revenue", definition: "The total money a company brings in from sales, before expenses are subtracted." },
      { term: "Profit", definition: "What's left of revenue after all expenses are paid — the actual financial gain." },
      { term: "Break-even", definition: "The point at which a company's revenue exactly covers its costs — no profit, no loss." },
      { term: "Unicorn", definition: "A privately-held startup valued at $1 billion or more." },
      { term: "Acquisition", definition: "One company buying another, absorbing it fully into its own operations." },
      { term: "Merger", definition: "Two companies combining into one, typically as more equal partners than in an acquisition." },
    ],
  },
  {
    id: "future-of-tech",
    title: "Future of Tech & Careers",
    blurb: "The vocabulary for thinking about where this is all headed — and how to stay ahead of it.",
    terms: [
      { term: "Digital Transformation", definition: "An organization fundamentally changing how it operates by adopting digital technology throughout." },
      { term: "Automation", definition: "Replacing manual human tasks with software or machines that perform them without ongoing human input." },
      { term: "AI Transformation", definition: "An organization restructuring its products, workflows, or strategy specifically around AI capabilities." },
      { term: "Future of Work", definition: "The broad conversation about how jobs, skills, and workplaces are changing due to technology and automation." },
      { term: "AI-Resilient Career", definition: "A career path built on skills that stay valuable even as AI automates more routine work — judgment, novel problem-solving, accountability." },
      { term: "Upskilling", definition: "Learning new, higher-level skills to grow within your current field." },
      { term: "Reskilling", definition: "Learning an entirely different skill set, often to move into a new field." },
      { term: "Skill Obsolescence", definition: "A skill losing market value over time because it's no longer needed or has been automated." },
      { term: "Emerging Technology", definition: "New technology still early in adoption, with significant but not-yet-proven future impact (e.g. quantum computing today)." },
      { term: "Human-AI Collaboration", definition: "Workflows where humans and AI systems each contribute what they're best at, rather than one simply replacing the other." },
      { term: "Digital Economy", definition: "The portion of economic activity built on digital technologies and the internet." },
    ],
  },
];

export interface ConfusingPair {
  a: string;
  b: string;
  explanation: string;
}

// Terms students mix up constantly — a quick side-by-side beats another pair
// of standalone definitions that don't make the distinction click.
export const CONFUSING_TECH_PAIRS: ConfusingPair[] = [
  {
    a: "AI",
    b: "ML vs Deep Learning",
    explanation:
      "AI is the broad goal (machines doing intelligent things). Machine Learning is one way to get there — learning patterns from data instead of hard-coded rules. Deep Learning is a specific kind of ML using multi-layer neural networks. So: AI ⊃ ML ⊃ Deep Learning — each is a narrower subset of the one before it.",
  },
  {
    a: "Library",
    b: "Framework",
    explanation:
      "You call a library — you're in control, it's just a tool you reach for. A framework calls you — it defines the structure, and your code fills in the blanks it expects. Rule of thumb: \"I call it\" = library, \"it calls me\" = framework.",
  },
  {
    a: "Frontend",
    b: "Backend",
    explanation:
      "Frontend is everything that runs in the user's browser/device and affects what they see and click. Backend is everything that runs on servers — business logic, databases, auth — that the frontend talks to but the user never sees directly.",
  },
  {
    a: "SQL",
    b: "NoSQL",
    explanation:
      "SQL databases (Postgres, MySQL) store data in rigid tables with defined schemas and strong relational guarantees. NoSQL databases (MongoDB, Redis) store data more flexibly (documents, key-value, graphs) and typically trade some consistency guarantees for scale and schema flexibility.",
  },
  {
    a: "Git",
    b: "GitHub",
    explanation:
      "Git is the version-control software itself — it works entirely on your machine, no internet needed. GitHub is a company/website that hosts Git repositories online and adds collaboration features (pull requests, issues, CI). You can use Git without ever touching GitHub.",
  },
  {
    a: "Cloud",
    b: "Server",
    explanation:
      "A server is a single machine (physical or virtual) that provides a service. \"The cloud\" is a broader model — renting computing resources (which run on servers you don't own or manage) on demand from a provider like AWS. Every cloud service ultimately runs on servers somewhere; \"cloud\" describes how you consume them, not a different kind of hardware.",
  },
  {
    a: "Docker",
    b: "Virtual Machine",
    explanation:
      "A Virtual Machine emulates an entire computer, including its own OS kernel — heavier, slower to start, fully isolated. A Docker container shares the host machine's OS kernel and only packages the application and its dependencies — much lighter and faster to start, with slightly less isolation.",
  },
  {
    a: "DevOps",
    b: "SRE",
    explanation:
      "DevOps is a culture/practice: developers and operations collaborating closely, automating builds and deploys. SRE (Site Reliability Engineering) is a specific, more prescriptive implementation of that idea — born at Google — that treats operations as a software engineering problem, with concrete practices like error budgets and SLOs.",
  },
  {
    a: "Authentication",
    b: "Authorization",
    explanation:
      "Authentication answers \"who are you?\" (logging in, checking a password). Authorization answers \"what are you allowed to do?\" (checking permissions/role once we already know who you are). Authentication always happens first.",
  },
  {
    a: "API",
    b: "REST API",
    explanation:
      "API is the general concept — any defined way for software to talk to other software. REST (REpresentational State Transfer) is one specific, very common style of designing APIs, built around HTTP verbs (GET/POST/PUT/DELETE) and resources identified by URLs. Not all APIs are REST APIs (e.g. GraphQL, gRPC are different styles).",
  },
  {
    a: "Programming",
    b: "Coding",
    explanation:
      "The terms are often used interchangeably, but \"coding\" usually refers narrowly to writing the actual lines of code, while \"programming\" more broadly includes designing the solution, structuring the system, and reasoning about tradeoffs before and while writing it.",
  },
  {
    a: "Software Engineer",
    b: "Software Developer",
    explanation:
      "In practice the titles overlap heavily and companies use them inconsistently. Where a distinction is drawn, \"engineer\" tends to imply more emphasis on system design, architecture, and rigor at scale, while \"developer\" leans toward building and shipping features — but this is a soft convention, not a hard rule.",
  },
  {
    a: "Layoff",
    b: "Hiring Freeze",
    explanation:
      "A layoff removes existing employees from the company. A hiring freeze doesn't touch current staff — it simply stops filling new or vacant positions. A company can freeze hiring without laying anyone off, or do both at once during a downturn.",
  },
  {
    a: "Recession",
    b: "Depression",
    explanation:
      "A recession is a significant decline in economic activity, typically lasting months to a couple of years. A depression is a far more severe, deeper, and longer-lasting downturn — rarer, and historically exemplified by the 1930s Great Depression. Every depression is a recession, but not every recession becomes a depression.",
  },
  {
    a: "Startup",
    b: "Enterprise",
    explanation:
      "A startup is typically young, small, and optimizing for fast growth and finding a working business model, often at the cost of stability. An enterprise is a large, established organization optimizing for scale, process, and risk management, usually with a proven, stable business model already in place.",
  },
];

export function searchTechDictionary(query: string): { category: TechCategory; term: TechTerm }[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: { category: TechCategory; term: TechTerm }[] = [];
  for (const category of TECH_DICTIONARY) {
    for (const term of category.terms) {
      if (term.term.toLowerCase().includes(q) || term.definition.toLowerCase().includes(q)) {
        results.push({ category, term });
      }
    }
  }
  return results;
}
