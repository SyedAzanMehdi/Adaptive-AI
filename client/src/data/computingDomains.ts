import type { Domain } from "@edu/shared";

// Domain Compass™ — curated taxonomy of 64 computing domains grouped into 12
// fields, each domain carrying a detailed description and a 4-stage study path.
// Fields carry the deterministic 10-year demand forecast (index, 2026 = baseline).
// Trend scores are 0-100 "viral potential" ratings used to rank next-decade bets.

export interface PathStep {
  stage: string;
  focus: string;
  milestone: string;
}

export interface DomainField {
  id: string;
  name: string;
  group: string;
  outlook: string;
  trendScore: number;
  forecast: number[];
}

export interface ComputingDomain {
  id: string;
  name: string;
  field: string;
  blurb: string;
  description: string;
  trendScore: number;
  mapsTo?: Domain;
  path: PathStep[];
}

export const FORECAST_YEARS = Array.from({ length: 11 }, (_, i) => `${2026 + i}`);

export const DOMAIN_FIELDS: DomainField[] = [
  {
    id: "ai_ml",
    name: "Artificial Intelligence & Machine Learning",
    group: "Intelligent Systems",
    outlook:
      "The defining stack of the decade. Generative models become the default interface for software, and agentic AI moves from demos to deployed coworkers. Demand compounds as every industry embeds AI into its core product.",
    trendScore: 98,
    forecast: [62, 68, 74, 80, 85, 89, 92, 95, 97, 98, 99],
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    group: "Trust & Safety",
    outlook:
      "AI-assisted attacks make defense a permanent arms race. Zero-trust, post-quantum crypto, and AI-driven detection become board-level priorities. One of the few fields with structural talent shortage through 2036.",
    trendScore: 96,
    forecast: [60, 65, 70, 75, 80, 84, 88, 91, 93, 95, 96],
  },
  {
    id: "quantum",
    name: "Quantum Computing",
    group: "Frontier Hardware",
    outlook:
      "The long bet that turns vertical mid-decade as error-corrected qubits mature. Early adopters in pharma, finance, and materials gain outsized advantage. Even pre-fault-tolerance, quantum-adjacent roles grow fast.",
    trendScore: 93,
    forecast: [30, 34, 40, 47, 55, 63, 71, 79, 86, 91, 94],
  },
  {
    id: "cloud_devops",
    name: "Cloud, DevOps & Platform Engineering",
    group: "Infrastructure",
    outlook:
      "Every company is a software company, and software runs on cloud. Platform engineering, observability, and FinOps become the new core competencies as AI workloads strain cost and reliability budgets.",
    trendScore: 92,
    forecast: [58, 62, 67, 72, 77, 81, 85, 88, 90, 91, 92],
  },
  {
    id: "data",
    name: "Data Science & Data Engineering",
    group: "Data & Analytics",
    outlook:
      "AI is only as good as its data. Vector search, real-time pipelines, and governance become the backbone of every AI product. Data engineering outgrows pure analytics as companies industrialize AI.",
    trendScore: 90,
    forecast: [55, 60, 65, 70, 75, 79, 83, 86, 88, 89, 90],
  },
  {
    id: "web",
    name: "Web & Full-Stack Development",
    group: "Application Engineering",
    outlook:
      "AI raises the floor but the web keeps expanding: WebAssembly, edge rendering, and rich interactive experiences. Full-stack engineers who can ship end-to-end with AI assistance stay in permanent demand.",
    trendScore: 85,
    forecast: [55, 58, 62, 66, 70, 74, 77, 80, 82, 84, 85],
  },
  {
    id: "mobile",
    name: "Mobile & Cross-Platform Development",
    group: "Application Engineering",
    outlook:
      "Mobile remains the default computing surface globally. Cross-platform frameworks and on-device AI (private, offline inference) are the growth pockets as app stores mature.",
    trendScore: 80,
    forecast: [52, 55, 58, 62, 66, 69, 72, 75, 77, 79, 80],
  },
  {
    id: "iot",
    name: "IoT, Embedded & Robotics",
    group: "Physical Computing",
    outlook:
      "Sensors, actuators, and edge AI converge as autonomy leaves the lab. Humanoid robotics and industrial automation are the breakout bets of the late 2020s into the 2030s.",
    trendScore: 84,
    forecast: [45, 49, 54, 59, 64, 69, 74, 78, 81, 83, 84],
  },
  {
    id: "xr",
    name: "AR/VR & Spatial Computing",
    group: "Human-Computer Interaction",
    outlook:
      "Spatial computing grows steadily as headsets lighten and digital twins become standard in engineering and medicine. The consumer breakout is timing-dependent; the enterprise case is already real.",
    trendScore: 86,
    forecast: [40, 44, 49, 55, 61, 67, 72, 77, 81, 84, 86],
  },
  {
    id: "blockchain",
    name: "Blockchain & Decentralized Systems",
    group: "Distributed Systems",
    outlook:
      "The hype cycle cooled, but the infrastructure quietly matured. Tokenized real-world assets, stablecoin rails, and verifiable provenance (including AI content provenance) keep a steady demand floor.",
    trendScore: 72,
    forecast: [42, 44, 47, 51, 55, 59, 63, 66, 69, 71, 72],
  },
  {
    id: "biotech",
    name: "Bioinformatics & Computational Biology",
    group: "Science Computing",
    outlook:
      "AI-driven protein design and genomics make biology an engineering discipline. Computational biologists sit at the intersection of the two fastest-growing fields — a quiet super-bet for the decade.",
    trendScore: 85,
    forecast: [42, 47, 52, 58, 64, 69, 74, 78, 81, 83, 85],
  },
  {
    id: "foundations",
    name: "Core Software Foundations",
    group: "Fundamentals",
    outlook:
      "Frameworks churn but fundamentals compound. As AI writes more boilerplate, humans are judged on architecture, algorithmic thinking, and debugging judgment — the skills this platform trains directly.",
    trendScore: 88,
    forecast: [60, 62, 65, 68, 71, 74, 77, 80, 83, 86, 88],
  },
];

export const COMPUTING_DOMAINS: ComputingDomain[] = [
  // ── Artificial Intelligence & Machine Learning ──────────────────────────
  {
    id: "genai",
    name: "Generative AI & LLMs",
    field: "ai_ml",
    blurb: "Foundation models, prompting, fine-tuning, and agentic workflows.",
    description:
      "Building products on top of foundation models — prompt engineering, retrieval-augmented generation, fine-tuning, evaluation, and agentic workflows. The fastest-moving specialty in software: every industry is embedding LLMs into its core product, and engineers who can ship reliable generative features (not demos) are the most contested hires of the decade.",
    trendScore: 99,
    path: [
      { stage: "Foundations", focus: "Python fluency, how transformers and attention work, tokenization and sampling.", milestone: "Explain how an LLM generates text and where it predictably fails." },
      { stage: "Core Skills", focus: "Prompt engineering, embeddings, RAG pipelines, function calling, and eval harnesses.", milestone: "Ship a retrieval-augmented assistant with measured answer quality." },
      { stage: "Applied", focus: "Fine-tuning, guardrails, latency and cost optimization, agent orchestration.", milestone: "Deploy a production agent with evals, guardrails, and a cost budget." },
      { stage: "Mastery", focus: "Post-training (RLHF/DPO), model-selection strategy, agentic architecture design.", milestone: "Own the full AI stack of a real product end to end." },
    ],
  },
  {
    id: "dl",
    name: "Deep Learning",
    field: "ai_ml",
    blurb: "Neural architectures for vision, speech, and sequence modeling.",
    description:
      "Designing and training neural networks — CNNs, transformers, diffusion models — and understanding why they work. Deep fluency in optimization, regularization, and architecture separates the engineers who advance models from those who only call APIs, and it remains the gateway into research-adjacent roles.",
    trendScore: 92,
    path: [
      { stage: "Foundations", focus: "Linear algebra, calculus, probability, and PyTorch fundamentals.", milestone: "Train an image classifier from scratch and read its learning curves." },
      { stage: "Core Skills", focus: "Backprop internals, optimizers, regularization, and transformer architectures.", milestone: "Reproduce a published result and explain every design choice." },
      { stage: "Applied", focus: "Distributed training, mixed precision, GPU profiling and debugging.", milestone: "Train a mid-scale model efficiently on a multi-GPU cluster." },
      { stage: "Mastery", focus: "Architecture search, novel loss design, benchmarking methodology.", milestone: "Beat a public baseline and publish or open-source the model." },
    ],
  },
  {
    id: "cv",
    name: "Computer Vision",
    field: "ai_ml",
    blurb: "Perception systems for cameras, robots, and medical imaging.",
    description:
      "Teaching machines to see: detection, segmentation, tracking, and 3D understanding for cameras, robots, factories, and hospitals. Vision is the sensing layer of autonomy — every self-driving stack, quality-inspection line, and medical-imaging assistant depends on it, and demand tracks the robotics boom directly.",
    trendScore: 90,
    path: [
      { stage: "Foundations", focus: "Image processing basics, convolutions, and CNN training in PyTorch.", milestone: "Build a classifier plus an object detector on a real dataset." },
      { stage: "Core Skills", focus: "Modern detectors and segmenters (YOLO/SAM families), data augmentation, transfer learning.", milestone: "Reach competitive accuracy on a detection benchmark." },
      { stage: "Applied", focus: "Video pipelines, model export, and edge deployment with latency budgets.", milestone: "Run real-time perception on an edge device or camera stream." },
      { stage: "Mastery", focus: "3D vision, multimodal models, and domain-specific rigor (medical, autonomous).", milestone: "Own a perception system in a shipped product." },
    ],
  },
  {
    id: "nlp",
    name: "Natural Language Processing",
    field: "ai_ml",
    blurb: "Language understanding, translation, and retrieval.",
    description:
      "Making language computable: understanding, translating, summarizing, and retrieving over text and speech. LLMs absorbed much of classic NLP, but the specialty survives as the science of tokenization, multilingual coverage, low-resource languages, and evaluation — the hard parts that generic models still get wrong.",
    trendScore: 93,
    path: [
      { stage: "Foundations", focus: "Text preprocessing, embeddings, and sequence-model intuition.", milestone: "Build a sentiment classifier and a semantic search index." },
      { stage: "Core Skills", focus: "Transformer encoder models, tokenizers, and evaluation beyond accuracy.", milestone: "Fine-tune a BERT-class model for a real classification task." },
      { stage: "Applied", focus: "Multilingual systems, retrieval at scale, and production serving.", milestone: "Ship a search or translation feature with measured quality." },
      { stage: "Mastery", focus: "Low-resource languages, linguistic evaluation, and speech-text fusion.", milestone: "Lead language technology for a product or research group." },
    ],
  },
  {
    id: "rl",
    name: "Reinforcement Learning",
    field: "ai_ml",
    blurb: "Agents that learn by interaction — robotics, trading, control.",
    description:
      "Training agents that learn by trial, reward, and interaction with an environment — the math behind game-playing AI, robot control, and the reward loops inside modern LLM post-training. RL is hard, which is exactly why specialists are rare and valuable as autonomy spreads into robotics and optimization.",
    trendScore: 85,
    path: [
      { stage: "Foundations", focus: "MDPs, value functions, Q-learning, and policy gradients in simple environments.", milestone: "Train an agent to solve classic control tasks from pixels or state." },
      { stage: "Core Skills", focus: "Actor-critic methods, reward shaping, and offline RL.", milestone: "Stabilize training on a non-trivial environment and explain failures." },
      { stage: "Applied", focus: "Simulators, RLHF for LLMs, and sample-efficiency tricks.", milestone: "Apply RL to a real problem: games, optimization, or model alignment." },
      { stage: "Mastery", focus: "Sim-to-real transfer, safe RL, and multi-agent systems.", milestone: "Deploy an agent that acts reliably in the physical or production world." },
    ],
  },
  {
    id: "mlops",
    name: "MLOps & AI Infrastructure",
    field: "ai_ml",
    blurb: "Training pipelines, serving, evals, and GPU orchestration.",
    description:
      "The plumbing that makes AI real: training pipelines, experiment tracking, model serving, GPU scheduling, and evals in CI. Every AI team bottlenecks on infrastructure before algorithms — MLOps engineers are the reason models ship, stay cheap, and don't silently regress, making this one of the highest-leverage roles of the decade.",
    trendScore: 94,
    path: [
      { stage: "Foundations", focus: "Python, Linux, containers, and how an ML model gets trained and saved.", milestone: "Containerize a training script and reproduce a run end to end." },
      { stage: "Core Skills", focus: "Experiment tracking, data/version pipelines, and CI for models.", milestone: "Build a pipeline where every model change is tested and versioned." },
      { stage: "Applied", focus: "Serving at scale: batching, autoscaling, GPU scheduling, and cost control.", milestone: "Serve a model under a latency and cost SLA." },
      { stage: "Mastery", focus: "Platform design, eval infrastructure, and multi-team GPU governance.", milestone: "Run the AI platform that other engineers build on." },
    ],
  },

  // ── Cybersecurity ────────────────────────────────────────────────────────
  {
    id: "zero_trust",
    name: "Zero-Trust Architecture",
    field: "cybersecurity",
    blurb: "Identity-first security for cloud and remote work.",
    description:
      "The end of the castle-and-moat: never trust, always verify. Zero-trust architects design identity-first access, device posture checks, and micro-segmentation so that no user, device, or service is trusted by location alone. Remote work and cloud made it mandatory; every large enterprise is mid-migration right now.",
    trendScore: 95,
    path: [
      { stage: "Foundations", focus: "Networking, authentication fundamentals, and the threat models zero-trust replaces.", milestone: "Map a network into trust zones and name its assumptions." },
      { stage: "Core Skills", focus: "IAM, SSO/OIDC, mTLS, and policy engines for access decisions.", milestone: "Design an identity-first access policy for a sample org." },
      { stage: "Applied", focus: "Micro-segmentation, device posture, and phased enterprise rollout.", milestone: "Plan a zero-trust migration with measurable risk reduction." },
      { stage: "Mastery", focus: "Continuous verification, workload identity, and compliance mapping.", milestone: "Own zero-trust strategy for an enterprise or cloud-native platform." },
    ],
  },
  {
    id: "cloudsec",
    name: "Cloud Security",
    field: "cybersecurity",
    blurb: "Hardening multi-cloud, containers, and serverless.",
    description:
      "Most breaches start with a misconfigured cloud account, not a sophisticated exploit. Cloud security engineers harden IAM, containers, serverless, and multi-cloud estates; bake guardrails into pipelines; and detect attacks in environments that change hourly. As everything moves to cloud, this is defense's front line.",
    trendScore: 94,
    path: [
      { stage: "Foundations", focus: "One major cloud platform deeply: IAM, networking, and shared-responsibility model.", milestone: "Audit a sample cloud account and list its top exposures." },
      { stage: "Core Skills", focus: "CSPM tooling, container/serverless security, and secrets management.", milestone: "Fix a misconfigured estate and prove the blast radius shrank." },
      { stage: "Applied", focus: "Guardrails-as-code, detection rules for cloud APIs, and incident drills.", milestone: "Ship automated policy checks that block risky deploys." },
      { stage: "Mastery", focus: "Multi-cloud strategy, supply-chain security, and red/blue on cloud estates.", milestone: "Own cloud security posture for a production platform." },
    ],
  },
  {
    id: "pqc",
    name: "Cryptography & Post-Quantum",
    field: "cybersecurity",
    blurb: "Encryption that survives quantum attackers.",
    description:
      "The encryption protecting today's data can be broken by tomorrow's quantum computer — and adversaries are harvesting ciphertext now. Post-quantum cryptography is the multi-year migration to lattice-based standards (NIST PQC), and organizations need engineers who can inventory crypto, keep it agile, and migrate without breaking anything.",
    trendScore: 93,
    path: [
      { stage: "Foundations", focus: "Symmetric and public-key crypto: AES, RSA, ECC, hashes, and signatures.", milestone: "Implement and break toy versions of each primitive." },
      { stage: "Core Skills", focus: "Lattice basics and the NIST post-quantum standards (ML-KEM, ML-DSA).", milestone: "Explain why Shor's algorithm breaks RSA and what replaces it." },
      { stage: "Applied", focus: "Crypto inventories, hybrid schemes, and migration tooling.", milestone: "Plan a PQC migration for a real TLS/PKI stack." },
      { stage: "Mastery", focus: "Crypto agility, key management at scale, and standards tracking.", milestone: "Lead an organization's quantum-safe cryptography program." },
    ],
  },
  {
    id: "pentest",
    name: "Ethical Hacking & Pentesting",
    field: "cybersecurity",
    blurb: "Offensive testing to find flaws before adversaries do.",
    description:
      "Thinking like the attacker: recon, exploitation, privilege escalation, and clear reporting — with permission. Pentesters prove what defenders only assume, and the offensive skillset transfers directly into red teaming, exploit research, and product security. Certifications plus public write-ups make this a portfolio-driven career.",
    trendScore: 88,
    path: [
      { stage: "Foundations", focus: "Networking, Linux, web fundamentals, and lab environments (HackTheBox/TryHackMe).", milestone: "Root beginner boxes and document every step." },
      { stage: "Core Skills", focus: "OWASP Top 10, Burp Suite, enumeration, and privilege-escalation patterns.", milestone: "Complete structured web and network attack paths solo." },
      { stage: "Applied", focus: "Real engagements: scoping, execution, and business-readable reporting.", milestone: "Deliver a pentest report that drives actual fixes." },
      { stage: "Mastery", focus: "Red teaming, exploit development, and specialized targets (cloud, mobile, AD).", milestone: "Run adversary simulations against mature defenses." },
    ],
  },
  {
    id: "forensics",
    name: "Digital Forensics",
    field: "cybersecurity",
    blurb: "Incident response and evidence analysis.",
    description:
      "When the breach happens, forensic analysts reconstruct it: what got in, what moved, what left — preserving evidence that stands up in court or to regulators. Incident response is recession-proof: attacks don't pause, and the ability to bring order to chaos under pressure is among security's most respected skills.",
    trendScore: 80,
    path: [
      { stage: "Foundations", focus: "OS internals, file systems, and how artifacts are created and destroyed.", milestone: "Locate execution, file, and network artifacts on a disk image." },
      { stage: "Core Skills", focus: "Disk and memory analysis, timeline building, and chain of custody.", milestone: "Reconstruct an attack timeline from a memory dump." },
      { stage: "Applied", focus: "Live incident response, containment playbooks, and forensic tooling.", milestone: "Run a tabletop-to-live IR exercise end to end." },
      { stage: "Mastery", focus: "Malware triage, expert testimony, and IR team leadership.", milestone: "Lead incident response for real breaches." },
    ],
  },
  {
    id: "aidetect",
    name: "AI-Driven Threat Detection",
    field: "cybersecurity",
    blurb: "ML models that hunt anomalies at machine speed.",
    description:
      "Attackers already use automation; defenders must too. This specialty builds ML systems over logs, endpoints, and identity data to surface anomalies humans would miss — UEBA, fraud detection, and triage automation. It sits at the intersection of the two hottest fields (AI + security) and barely has an experienced talent pool.",
    trendScore: 96,
    path: [
      { stage: "Foundations", focus: "Security operations basics plus Python and statistics.", milestone: "Read a SIEM dashboard and explain what normal looks like." },
      { stage: "Core Skills", focus: "Log analytics, UEBA, and anomaly-detection models over security telemetry.", milestone: "Build a detector that flags a planted intrusion in sample data." },
      { stage: "Applied", focus: "Production detection pipelines, alert triage, and false-positive economics.", milestone: "Ship a detection with measured precision and response hooks." },
      { stage: "Mastery", focus: "Agentic SOC automation, adversarial robustness, and detection strategy.", milestone: "Own the detection engineering function of a security team." },
    ],
  },

  // ── Quantum Computing ────────────────────────────────────────────────────
  {
    id: "qalgos",
    name: "Quantum Algorithms",
    field: "quantum",
    blurb: "Shor, Grover, VQE, and hybrid quantum-classical methods.",
    description:
      "The theory that makes qubits valuable: designing algorithms that exploit superposition and entanglement for speedups in factoring, search, simulation, and optimization. As hardware matures, the engineers who know which problems are actually quantum-advantageous — and how to structure hybrid workflows — become the field's strategists.",
    trendScore: 92,
    path: [
      { stage: "Foundations", focus: "Linear algebra and quantum mechanics intuition: qubits, gates, measurement.", milestone: "Build Bell states and simple circuits in a simulator." },
      { stage: "Core Skills", focus: "Grover, Shor, phase estimation, and running circuits on real hardware (Qiskit).", milestone: "Run an algorithm on a real quantum processor and interpret noise." },
      { stage: "Applied", focus: "Variational and hybrid quantum-classical algorithms (VQE/QAOA).", milestone: "Solve a chemistry or optimization problem end to end." },
      { stage: "Mastery", focus: "Quantum advantage analysis and error-aware algorithm design.", milestone: "Contribute algorithm research or lead quantum use-case discovery." },
    ],
  },
  {
    id: "qhardware",
    name: "Qubit Hardware & Control",
    field: "quantum",
    blurb: "Superconducting, trapped-ion, and photonic platforms.",
    description:
      "Quantum computers are physics experiments that happen to compute. Hardware engineers build the qubits themselves — superconducting circuits, trapped ions, photonic chips — plus the cryogenics and control electronics around them. Deep hardware skills are scarce and become decisive as the race to fault tolerance intensifies.",
    trendScore: 88,
    path: [
      { stage: "Foundations", focus: "Physics and electronics fundamentals: EM, signals, and low-noise measurement.", milestone: "Characterize a resonator or filter in a lab setup." },
      { stage: "Core Skills", focus: "Qubit physics, cryogenics, microwave engineering, and control electronics.", milestone: "Operate and calibrate a qubit experiment." },
      { stage: "Applied", focus: "Fabrication integration, scaling bottlenecks, and noise diagnostics.", milestone: "Improve a measurable fidelity or stability metric." },
      { stage: "Mastery", focus: "Architecture-level scaling: wiring, crosstalk, and error budgets.", milestone: "Design hardware paths toward logical qubits." },
    ],
  },
  {
    id: "qcrypto",
    name: "Post-Quantum Cryptography",
    field: "quantum",
    blurb: "Migration standards for a post-Shor internet.",
    description:
      "The standards-and-migration side of the quantum threat: turning NIST's post-quantum algorithms into real protocols, hybrid handshakes, and organizational readiness. Distinct from pure crypto research, this role is engineering-driven — inventorying every place cryptography lives and moving it, safely, before quantum computers arrive.",
    trendScore: 94,
    path: [
      { stage: "Foundations", focus: "Classical crypto and TLS/PKI as deployed on the real internet.", milestone: "Trace a TLS handshake and name every primitive it uses." },
      { stage: "Core Skills", focus: "NIST PQC standards, hybrid key exchange, and signature migration.", milestone: "Stand up a PQC-enabled TLS endpoint and interop-test it." },
      { stage: "Applied", focus: "Crypto inventories, harvest-now-decrypt-later risk models, and rollout sequencing.", milestone: "Produce a migration plan with priorities and rollback paths." },
      { stage: "Mastery", focus: "Standards evolution, protocol design, and cross-org readiness programs.", milestone: "Lead a post-quantum readiness effort for products or infrastructure." },
    ],
  },
  {
    id: "qml",
    name: "Quantum Machine Learning",
    field: "quantum",
    blurb: "Quantum kernels and variational models.",
    description:
      "Can quantum computers learn faster? QML explores quantum kernels, variational circuits as models, and quantum-accelerated optimization. Still early and research-heavy, it attracts talent from both ML and quantum — and whoever cracks a real advantage will be positioned at the center of two booming fields at once.",
    trendScore: 90,
    path: [
      { stage: "Foundations", focus: "ML fundamentals plus linear algebra deep enough for quantum states.", milestone: "Train classical models and represent data as quantum states." },
      { stage: "Core Skills", focus: "Parameterized circuits, quantum kernels, and training loops on simulators.", milestone: "Build and evaluate a variational classifier." },
      { stage: "Applied", focus: "Hybrid pipelines and honest benchmarking against classical baselines.", milestone: "Publish a comparison showing where quantum helps — or doesn't." },
      { stage: "Mastery", focus: "Barren plateaus, error mitigation, and advantage-seeking research.", milestone: "Contribute original QML research to the field." },
    ],
  },
  {
    id: "qec",
    name: "Quantum Error Correction",
    field: "quantum",
    blurb: "Logical qubits from noisy physical ones.",
    description:
      "Qubits are fragile; error correction is the bridge to useful quantum computing. QEC engineers encode logical qubits from noisy physical ones, design decoding algorithms, and prove fault-tolerant architectures. It is the field's critical path — whoever can demonstrate scalable QEC unlocks every other quantum application.",
    trendScore: 87,
    path: [
      { stage: "Foundations", focus: "Quantum information theory: noise channels, fidelity, and stabilizer formalism.", milestone: "Model decoherence and compute error rates for simple circuits." },
      { stage: "Core Skills", focus: "Stabilizer codes, surface codes, and syndrome extraction.", milestone: "Simulate a surface code and decode its syndromes." },
      { stage: "Applied", focus: "Decoding algorithms (MWPM, neural decoders) and hardware-aware codes.", milestone: "Achieve target logical error rates in simulation." },
      { stage: "Mastery", focus: "Fault-tolerant architectures and overhead economics.", milestone: "Design error-correction schemes for real hardware roadmaps." },
    ],
  },

  // ── Cloud, DevOps & Platform Engineering ─────────────────────────────────
  {
    id: "k8s",
    name: "Kubernetes & Containers",
    field: "cloud_devops",
    blurb: "Orchestration for portable, scalable workloads.",
    description:
      "The operating system of the cloud. Kubernetes schedules, scales, and heals containerized workloads across clusters, and has become the default substrate for anything serious in production. Understanding it deeply — not just YAML, but networking, storage, and failure modes — is table stakes for infrastructure careers.",
    trendScore: 90,
    path: [
      { stage: "Foundations", focus: "Linux, networking basics, and Docker: images, containers, registries.", milestone: "Containerize a service and run it locally with volumes and networks." },
      { stage: "Core Skills", focus: "Pods, deployments, services, ingress, and Helm on a real cluster.", milestone: "Deploy a multi-service app with health checks and rollbacks." },
      { stage: "Applied", focus: "Cluster operations, RBAC, autoscaling, and service mesh.", milestone: "Operate a cluster through upgrades and incident drills." },
      { stage: "Mastery", focus: "Platform engineering: golden paths, multi-tenancy, and cost-aware scheduling.", milestone: "Build the Kubernetes platform other teams self-serve on." },
    ],
  },
  {
    id: "cicd",
    name: "CI/CD & GitOps",
    field: "cloud_devops",
    blurb: "Declarative delivery pipelines and progressive rollout.",
    description:
      "Shipping is a system, not an event. CI/CD engineers build the pipelines that test, build, and release software continuously; GitOps makes infrastructure and deployments declarative and auditable. The payoff is measured in DORA metrics — elite teams deploy on demand with near-zero downtime, and the engineers who build that capability are force multipliers.",
    trendScore: 88,
    path: [
      { stage: "Foundations", focus: "Git discipline, build systems, and automated testing basics.", milestone: "Set up a pipeline that runs tests on every push." },
      { stage: "Core Skills", focus: "Pipeline-as-code, artifact registries, and environment promotion.", milestone: "Ship code from commit to staging automatically." },
      { stage: "Applied", focus: "GitOps operators, progressive delivery, feature flags, and trunk-based development.", milestone: "Run canary releases with automatic rollback." },
      { stage: "Mastery", focus: "DORA metrics, compliance automation, and org-wide delivery platforms.", milestone: "Own the delivery platform that measures and improves flow." },
    ],
  },
  {
    id: "sre",
    name: "SRE & Observability",
    field: "cloud_devops",
    blurb: "SLOs, tracing, and incident response at scale.",
    description:
      "Site reliability engineering treats operations as a software problem: automate toil, define SLOs with error budgets, and build observability deep enough to find any failure fast. As systems get distributed and AI workloads strain infrastructure, SREs are the difference between a platform users trust and one that burns goodwill.",
    trendScore: 90,
    path: [
      { stage: "Foundations", focus: "Systems fundamentals: Linux, networking, and how services fail.", milestone: "Instrument a service with metrics, logs, and traces." },
      { stage: "Core Skills", focus: "SLOs, error budgets, alerting philosophy, and the observability stack.", milestone: "Define and defend an SLO with meaningful alerts." },
      { stage: "Applied", focus: "On-call practice, capacity planning, and chaos drills.", milestone: "Run an incident from page to postmortem." },
      { stage: "Mastery", focus: "Reliability architecture, incident command, and toil elimination at org scale.", milestone: "Own reliability for a critical production system." },
    ],
  },
  {
    id: "serverless",
    name: "Serverless & Edge",
    field: "cloud_devops",
    blurb: "Event-driven compute close to the user.",
    description:
      "Compute without servers: functions, event buses, and edge runtimes that scale to zero and execute milliseconds from users. Serverless architectures win on speed-to-market and cost for spiky workloads, and edge rendering is reshaping web performance. The skill is knowing the patterns — and their limits — deeply.",
    trendScore: 89,
    path: [
      { stage: "Foundations", focus: "HTTP, APIs, and one serverless platform (Lambda/Cloud Functions).", milestone: "Deploy a function-backed API with auth." },
      { stage: "Core Skills", focus: "Event buses, queues, triggers, and CDN/edge runtimes.", milestone: "Build an event-driven workflow with retries and DLQs." },
      { stage: "Applied", focus: "Patterns: fan-out, sagas, streaming; cold starts and cost tuning.", milestone: "Ship a production event-driven feature under a cost budget." },
      { stage: "Mastery", focus: "Edge rendering, distributed state, and hybrid serverless architectures.", milestone: "Design global low-latency systems without managing servers." },
    ],
  },
  {
    id: "finops",
    name: "FinOps & Cloud Cost",
    field: "cloud_devops",
    blurb: "Unit economics for GPU and cloud spend.",
    description:
      "Cloud bills are now board-level numbers, and GPU spend makes them worse. FinOps practitioners give organizations unit economics: cost per customer, per inference, per deploy — then drive rightsizing, commitments, and architectural choices against them. It's a rare mix of engineering and finance, and companies pay for it as AI scales.",
    trendScore: 82,
    path: [
      { stage: "Foundations", focus: "Cloud billing models, meters, and where money actually goes.", milestone: "Read a cloud bill and attribute costs to teams." },
      { stage: "Core Skills", focus: "Tagging strategy, rightsizing, reserved/savings plans, and waste detection.", milestone: "Cut a sample estate's spend with justified recommendations." },
      { stage: "Applied", focus: "Unit economics, cost dashboards, and GPU/AI spend optimization.", milestone: "Report cost per transaction for a real workload." },
      { stage: "Mastery", focus: "Forecasting, chargeback culture, and architecture-level cost leadership.", milestone: "Own the cost function for a cloud or AI organization." },
    ],
  },
  {
    id: "iac",
    name: "Infrastructure as Code",
    field: "cloud_devops",
    blurb: "Terraform/Pulumi — reproducible environments.",
    description:
      "Infrastructure you can review, version, and reproduce: Terraform, Pulumi, and CloudFormation turn servers and networks into code with tests and pull requests. IaC is the foundation every platform team builds on — drift-free environments, auditable change, and disaster recovery that is a redeploy away.",
    trendScore: 91,
    path: [
      { stage: "Foundations", focus: "Cloud primitives (networks, compute, IAM) and declarative thinking.", milestone: "Provision a working environment from a single config file." },
      { stage: "Core Skills", focus: "Terraform modules, state management, and plan/review workflows.", milestone: "Manage multi-environment infrastructure with reusable modules." },
      { stage: "Applied", focus: "CI-integrated apply, drift detection, and landing-zone design.", milestone: "Ship infrastructure changes through tested pipelines." },
      { stage: "Mastery", focus: "Policy-as-code, multi-account governance, and golden-path platforms.", milestone: "Own the infrastructure platform an organization runs on." },
    ],
  },

  // ── Data Science & Data Engineering ──────────────────────────────────────
  {
    id: "dataeng",
    name: "Data Engineering & Pipelines",
    field: "data",
    blurb: "Streaming and batch ETL that feeds AI systems.",
    description:
      "Every AI product and dashboard sits on top of pipelines someone built. Data engineers design the movement and transformation of data — batch and streaming, warehouse and lakehouse — with quality checks and contracts. As organizations industrialize AI, data engineering has quietly become one of the most in-demand roles in tech.",
    trendScore: 91,
    path: [
      { stage: "Foundations", focus: "SQL mastery plus Python for data manipulation.", milestone: "Model a small warehouse and answer real questions with SQL." },
      { stage: "Core Skills", focus: "ELT with dbt, orchestration (Airflow/Dagster), and warehouse design.", milestone: "Build a scheduled pipeline with tests and freshness checks." },
      { stage: "Applied", focus: "Streaming (Kafka/Flink), lakehouse formats, and data contracts.", milestone: "Run a pipeline at high volume with quality gates." },
      { stage: "Mastery", focus: "Platform architecture, cost governance, and org-scale data strategy.", milestone: "Own the data platform that analytics and AI depend on." },
    ],
  },
  {
    id: "vector",
    name: "Vector Databases & Retrieval",
    field: "data",
    blurb: "Embeddings search powering RAG and agents.",
    description:
      "The memory layer of the AI era. Vector databases index embeddings so models can search documents, images, and products by meaning — the engine behind RAG, recommendation, and agent memory. Demand exploded with LLMs, and the engineers who understand indexing (HNSW), chunking, reranking, and eval own the quality of every AI answer.",
    trendScore: 95,
    path: [
      { stage: "Foundations", focus: "Embeddings, similarity math, and how semantic search differs from keyword search.", milestone: "Build a toy semantic search over a document set." },
      { stage: "Core Skills", focus: "Vector databases (pgvector, Pinecone, Qdrant), HNSW indexing, and filtering.", milestone: "Run retrieval at scale with measured latency and recall." },
      { stage: "Applied", focus: "Production RAG: chunking strategy, hybrid search, reranking, and eval.", milestone: "Ship a retrieval system with an eval proving answer quality." },
      { stage: "Mastery", focus: "Multimodal retrieval, agent memory architectures, and retrieval research.", milestone: "Own the retrieval layer of a real AI product." },
    ],
  },
  {
    id: "bi",
    name: "BI & Visualization",
    field: "data",
    blurb: "Dashboards and self-serve analytics.",
    description:
      "Data only matters when someone acts on it. BI specialists build the semantic layer, metrics, and dashboards that let whole organizations answer their own questions — accurately. The role has evolved into analytics engineering: versioned models, tested metrics, and data storytelling that shapes decisions at the executive level.",
    trendScore: 80,
    path: [
      { stage: "Foundations", focus: "SQL, data modeling, and the grammar of good charts.", milestone: "Turn a raw dataset into a trustworthy summary model." },
      { stage: "Core Skills", focus: "Semantic layers, metric definitions (dbt/LookML), and BI tools.", milestone: "Ship a self-serve dashboard with certified metrics." },
      { stage: "Applied", focus: "Data storytelling, executive reporting, and adoption measurement.", milestone: "Drive a real decision with an analysis you presented." },
      { stage: "Mastery", focus: "Analytics engineering leadership and org-wide metric governance.", milestone: "Own the metrics layer an entire company reports from." },
    ],
  },
  {
    id: "stats",
    name: "Statistical Modeling",
    field: "data",
    blurb: "Causal inference and experiment design.",
    description:
      "Correlation is cheap; causation is the prize. Statisticians and causal-inference practitioners design experiments, separate signal from noise, and answer the question every product team actually has: did our change cause the improvement? As AI floods companies with metrics, the people who can run rigorous inference become more valuable, not less.",
    trendScore: 82,
    path: [
      { stage: "Foundations", focus: "Probability, distributions, hypothesis testing, and basic regression.", milestone: "Design and analyze a simple A/B test correctly." },
      { stage: "Core Skills", focus: "Regression modeling, experiment design, and causal-inference methods.", milestone: "Estimate a treatment effect and defend its assumptions." },
      { stage: "Applied", focus: "Experimentation platforms, uplift modeling, and metric diagnostics.", milestone: "Run a testing program that changes product decisions." },
      { stage: "Mastery", focus: "Bayesian methods, decision science, and causal strategy.", milestone: "Own the experimentation practice of a product org." },
    ],
  },
  {
    id: "governance",
    name: "Data Governance & Privacy",
    field: "data",
    blurb: "Lineage, consent, and compliance at scale.",
    description:
      "Data is an asset and a liability simultaneously. Governance engineers build lineage, catalogs, quality rules, and access control so data is trustworthy; privacy engineers keep it lawful under GDPR and peers. With AI training on everything, organizations need people who can prove where data came from and who is allowed to use it.",
    trendScore: 86,
    path: [
      { stage: "Foundations", focus: "Data management fundamentals: catalogs, quality, and ownership models.", milestone: "Document lineage for a critical dataset." },
      { stage: "Core Skills", focus: "Quality frameworks, access control, and policy-as-code for data.", milestone: "Implement quality gates that block bad data upstream." },
      { stage: "Applied", focus: "Privacy engineering: consent, de-identification, and GDPR-grade workflows.", milestone: "Deliver a compliant data-sharing flow end to end." },
      { stage: "Mastery", focus: "Enterprise governance programs and AI data provenance.", milestone: "Own governance for an organization's data and AI estate." },
    ],
  },

  // ── Web & Full-Stack Development ─────────────────────────────────────────
  {
    id: "frontend",
    name: "Frontend Engineering",
    field: "web",
    blurb: "React-era UIs, state, and design systems.",
    description:
      "The craft of the interface: React-era component architecture, state management, design systems, and the performance and accessibility that make products feel professional. AI accelerates UI generation, which raises the bar — the differentiator is now architectural judgment: what to build, how to structure it, and how to keep it fast.",
    trendScore: 84,
    mapsTo: "syntax",
    path: [
      { stage: "Foundations", focus: "HTML, CSS, and modern JavaScript deeply.", milestone: "Build a responsive, interactive page without frameworks." },
      { stage: "Core Skills", focus: "React component models, state management, and design systems.", milestone: "Ship a multi-view app with reusable, tested components." },
      { stage: "Applied", focus: "Rendering performance, testing strategy, and accessibility.", milestone: "Deliver a UI that is fast, tested, and screen-reader friendly." },
      { stage: "Mastery", focus: "Frontend architecture, framework internals, and team-scale standards.", milestone: "Own the frontend architecture of a production product." },
    ],
  },
  {
    id: "backend",
    name: "Backend & API Design",
    field: "web",
    blurb: "REST/GraphQL, auth, and service boundaries.",
    description:
      "The systems beneath the surface: APIs, databases, authentication, and the boundaries between services. Backend engineering rewards judgment — schema design, caching, consistency trade-offs — and compounds with every year of production experience. Full-stack-capable backend engineers remain among the most consistently hired profiles worldwide.",
    trendScore: 86,
    mapsTo: "oop",
    path: [
      { stage: "Foundations", focus: "One server language deeply, HTTP semantics, and relational databases.", milestone: "Build a CRUD API with auth and a modeled schema." },
      { stage: "Core Skills", focus: "REST/GraphQL design, transactions, caching, and background jobs.", milestone: "Ship an API that handles real concurrency and failure." },
      { stage: "Applied", focus: "Service boundaries, message queues, and observability.", milestone: "Design and run a multi-service backend in production." },
      { stage: "Mastery", focus: "Distributed-systems trade-offs and API evolution strategy.", milestone: "Own backend architecture decisions for a product." },
    ],
  },
  {
    id: "perf",
    name: "Web Performance",
    field: "web",
    blurb: "Core Web Vitals and rendering budgets.",
    description:
      "Speed is a feature with revenue attached: every 100ms of latency costs conversions, and search rankings now encode it. Performance engineers profile rendering, trim bundles, tune CDNs, and hold Core Web Vitals inside budgets. It is a measurable specialty — you can prove your impact in milliseconds and money.",
    trendScore: 85,
    path: [
      { stage: "Foundations", focus: "The browser rendering model: parsing, layout, paint, and the network.", milestone: "Explain exactly why a given page renders slowly." },
      { stage: "Core Skills", focus: "Core Web Vitals (LCP/INP/CLS), profiling with DevTools and Lighthouse.", milestone: "Diagnose a slow page to the offending resource or function." },
      { stage: "Applied", focus: "Bundle splitting, image strategies, caching, and performance budgets in CI.", milestone: "Improve a real site's vitals across the board." },
      { stage: "Mastery", focus: "RUM monitoring, edge rendering, and org-wide performance culture.", milestone: "Own performance as a product metric with executive visibility." },
    ],
  },
  {
    id: "a11y",
    name: "Accessibility",
    field: "web",
    blurb: "Inclusive interfaces as legal baseline.",
    description:
      "Over a billion people live with disabilities, and accessibility lawsuits turned inclusion from virtue into legal requirement. A11y specialists make interfaces work with screen readers, keyboards, and assistive tech — a craft combining WCAG standards, semantic HTML, and empathy. Specialists are scarce, and every design system now needs them.",
    trendScore: 83,
    path: [
      { stage: "Foundations", focus: "WCAG principles, disability models, and assistive-technology basics.", milestone: "Navigate a site using only a keyboard and a screen reader." },
      { stage: "Core Skills", focus: "Semantic HTML, ARIA patterns, focus management, and color contrast.", milestone: "Make a complex component fully keyboard-accessible." },
      { stage: "Applied", focus: "Automated + manual auditing, and remediation at design-system scale.", milestone: "Audit a real product and deliver a prioritized fix plan." },
      { stage: "Mastery", focus: "Inclusive design systems, legal compliance, and advocacy.", milestone: "Own accessibility standards for an organization." },
    ],
  },
  {
    id: "pwa",
    name: "Progressive Web Apps",
    field: "web",
    blurb: "Offline-first, installable experiences.",
    description:
      "The web, upgraded: installable, offline-capable, push-enabled apps delivered through a URL. PWAs matter most in emerging markets — Pakistan, India, Africa — where storage is scarce and app-store friction is high. Offline-first architecture is also a transferable superpower for any resilient-systems work.",
    trendScore: 78,
    path: [
      { stage: "Foundations", focus: "Web app fundamentals plus the service-worker lifecycle.", milestone: "Cache a site's shell and load it offline." },
      { stage: "Core Skills", focus: "Caching strategies, manifests, install prompts, and push notifications.", milestone: "Ship an installable app that survives airplane mode." },
      { stage: "Applied", focus: "Offline sync, background tasks, and conflict resolution.", milestone: "Build offline-first data flows that reconcile on reconnect." },
      { stage: "Mastery", focus: "Hybrid strategies and PWA architecture for emerging-market scale.", milestone: "Own an installable experience used on low-end devices." },
    ],
  },
  {
    id: "wasm",
    name: "WebAssembly",
    field: "web",
    blurb: "Near-native speed in the browser.",
    description:
      "Running compiled code at near-native speed inside the browser — video editors, CAD tools, games, and ML inference that JavaScript alone cannot deliver. WASM is also escaping the browser (WASI, edge plugins, serverless), making it a bet on portable high-performance compute everywhere.",
    trendScore: 88,
    path: [
      { stage: "Foundations", focus: "The web platform plus one low-level language (Rust or C++).", milestone: "Compile a hello-world module and call it from JavaScript." },
      { stage: "Core Skills", focus: "WASM toolchains, JS interop, and memory management.", milestone: "Port a compute-heavy JS function to WASM with measured speedup." },
      { stage: "Applied", focus: "Streaming data across the boundary; real apps: editors, media, games.", milestone: "Ship a WASM-powered feature in a real web app." },
      { stage: "Mastery", focus: "WASI, edge plugins, and cross-platform component models.", milestone: "Run the same WASM module in browser, server, and edge." },
    ],
  },

  // ── Mobile & Cross-Platform Development ──────────────────────────────────
  {
    id: "android",
    name: "Android (Kotlin)",
    field: "mobile",
    blurb: "The largest global install base.",
    description:
      "Three billion devices — the default computing surface for most of humanity. Modern Android development with Kotlin and Jetpack Compose is declarative, testable, and increasingly AI-assisted on-device. It is also the gateway market for emerging economies, where the next billion users come online.",
    trendScore: 79,
    path: [
      { stage: "Foundations", focus: "Kotlin language fundamentals and Android project anatomy.", milestone: "Build a simple multi-screen app with navigation." },
      { stage: "Core Skills", focus: "Jetpack Compose, lifecycle, persistence, and coroutines.", milestone: "Ship an app with offline data and background work." },
      { stage: "Applied", focus: "Performance profiling, Play Console distribution, and CI.", milestone: "Release an app to real users and read its vitals." },
      { stage: "Mastery", focus: "Platform APIs, modular architecture, and on-device ML.", milestone: "Own Android engineering for a production app." },
    ],
  },
  {
    id: "ios",
    name: "iOS (Swift)",
    field: "mobile",
    blurb: "Premium markets and the app economy.",
    description:
      "The premium side of mobile: the highest-spending users, the tightest platform integration, and SwiftUI's modern declarative model. iOS engineering rewards polish — animation, accessibility, and App Store excellence — and pays accordingly. Swift also extends to servers (Vapor) and on-device AI through CoreML.",
    trendScore: 79,
    path: [
      { stage: "Foundations", focus: "Swift language fundamentals and Xcode project anatomy.", milestone: "Build a simple multi-screen app with navigation." },
      { stage: "Core Skills", focus: "SwiftUI, data flow, persistence, and structured concurrency.", milestone: "Ship an app with offline data and async work." },
      { stage: "Applied", focus: "Performance, accessibility, App Store review and polish.", milestone: "Release an app and iterate on real user feedback." },
      { stage: "Mastery", focus: "System-level APIs, widgets, and on-device intelligence.", milestone: "Own iOS engineering for a production app." },
    ],
  },
  {
    id: "cross",
    name: "React Native / Flutter",
    field: "mobile",
    blurb: "One codebase, every screen.",
    description:
      "Ship once, run everywhere. React Native (JavaScript ecosystem) and Flutter (Dart, self-rendering engine) let small teams serve both platforms — the economics that make startup apps possible. The specialty is knowing where the abstraction leaks and how to drop into native code when it does.",
    trendScore: 83,
    path: [
      { stage: "Foundations", focus: "One native platform's basics plus the cross-platform framework of choice.", milestone: "Build a working app on both simulators from one codebase." },
      { stage: "Core Skills", focus: "Framework architecture deeply: rendering, state, navigation, and styling.", milestone: "Ship a polished cross-platform app with shared business logic." },
      { stage: "Applied", focus: "Native modules, OTA updates, and platform-specific polish.", milestone: "Bridge a native capability the framework doesn't provide." },
      { stage: "Mastery", focus: "Org-scale strategy: one codebase, release automation, perf budgets.", milestone: "Own the cross-platform strategy for a product team." },
    ],
  },
  {
    id: "mux",
    name: "Mobile UX & Design Systems",
    field: "mobile",
    blurb: "Thumb-first interaction design.",
    description:
      "Small screens, big decisions: mobile UX is where products win or lose users in seconds. This specialty covers thumb-first interaction design, motion, and design systems that keep apps consistent as teams scale. Designers who can prototype and engineers who understand UX both thrive here.",
    trendScore: 80,
    path: [
      { stage: "Foundations", focus: "Design fundamentals and the iOS/Android human-interface guidelines.", milestone: "Critique a real app's UX with guideline-backed reasoning." },
      { stage: "Core Skills", focus: "Thumb-zone layouts, prototyping, and mobile design systems.", milestone: "Prototype a flow and validate it with usability tests." },
      { stage: "Applied", focus: "Motion design, dark mode, and component libraries at scale.", milestone: "Ship a design system consumed by a real app." },
      { stage: "Mastery", focus: "Product design leadership: research, metrics, and accessibility.", milestone: "Own the mobile experience of a product." },
    ],
  },
  {
    id: "appsec",
    name: "App Security",
    field: "mobile",
    blurb: "Hardening binaries and on-device data.",
    description:
      "Mobile apps carry tokens, payments, and biometrics on devices the defender doesn't control. App-security engineers harden storage and network layers, detect tampering and jailbreaks, and audit against the OWASP MASVS. With fintech and health apps exploding, mobile security specialists are scarce and heavily recruited.",
    trendScore: 84,
    path: [
      { stage: "Foundations", focus: "Mobile platform security models: sandboxing, keystores, permissions.", milestone: "Map the attack surface of a sample app." },
      { stage: "Core Skills", focus: "Secure storage, cert pinning, obfuscation, and jailbreak/root detection.", milestone: "Harden an app against the OWASP Mobile Top 10." },
      { stage: "Applied", focus: "MASVS audits, reverse engineering, and runtime instrumentation.", milestone: "Audit a real app and report exploitable findings." },
      { stage: "Mastery", focus: "Security-by-design release pipelines and fintech-grade assurance.", milestone: "Own mobile security for shipping apps." },
    ],
  },

  // ── IoT, Embedded & Robotics ─────────────────────────────────────────────
  {
    id: "edge",
    name: "Edge Computing",
    field: "iot",
    blurb: "Inference where the data is born.",
    description:
      "Why send data to the cloud when the answer can be computed where the data is born? Edge computing runs inference and logic on devices and gateways — low latency, private, and functional offline. As cameras, sensors, and robots proliferate, edge AI is the layer that makes autonomy practical and bandwidth affordable.",
    trendScore: 88,
    path: [
      { stage: "Foundations", focus: "Embedded Linux, networking constraints, and ML fundamentals.", milestone: "Run a small model on a Raspberry Pi-class device." },
      { stage: "Core Skills", focus: "Model compression: quantization, pruning, distillation.", milestone: "Shrink a model 10x with acceptable accuracy loss." },
      { stage: "Applied", focus: "Edge runtimes (TensorRT, TFLite) and fleet management/OTA.", milestone: "Deploy and update models across a device fleet." },
      { stage: "Mastery", focus: "Edge-cloud architectures and hardware-aware optimization.", milestone: "Own the edge intelligence layer of a product." },
    ],
  },
  {
    id: "firmware",
    name: "Firmware & RTOS",
    field: "iot",
    blurb: "Reliable code for constrained devices.",
    description:
      "Software with physics attached. Firmware engineers write the C/C++ that runs on microcontrollers — bare-metal or RTOS — where memory is measured in kilobytes, timing in microseconds, and bugs can br hardware. It is a durable specialty: every smart device, sensor, and vehicle needs it, and good firmware engineers are rare.",
    trendScore: 80,
    path: [
      { stage: "Foundations", focus: "C programming, microcontroller basics, and reading datasheets.", milestone: "Blink, sense, and communicate on a dev board." },
      { stage: "Core Skills", focus: "RTOS tasks, interrupts, drivers, and memory-constrained design.", milestone: "Run a multi-task system with deterministic timing." },
      { stage: "Applied", focus: "Low-power design, OTA updates, and debug tooling (JTAG/SWD).", milestone: "Ship firmware that survives battery and field constraints." },
      { stage: "Mastery", focus: "Safety-critical standards and architecture for device platforms.", milestone: "Own firmware for a certified or mass-produced device." },
    ],
  },
  {
    id: "robotics",
    name: "Robotics & Autonomy",
    field: "iot",
    blurb: "Perception-planning-control loops.",
    description:
      "The decade's breakout bet: machines that perceive, plan, and act in the physical world. Robotics fuses perception (vision, lidar), planning (SLAM, pathfinding), and control into systems that drive vehicles, staff warehouses, and — increasingly — walk on two legs. Humanoid robotics investment is compounding year over year.",
    trendScore: 91,
    path: [
      { stage: "Foundations", focus: "Linear algebra, control theory basics, and ROS.", milestone: "Simulate a robot completing a navigation task." },
      { stage: "Core Skills", focus: "Kinematics, SLAM, sensor fusion, and motion planning.", milestone: "Get a robot to localize and navigate a mapped space." },
      { stage: "Applied", focus: "Full autonomy stacks: perception to planning to control in simulation.", milestone: "Run an end-to-end autonomy demo with failure recovery." },
      { stage: "Mastery", focus: "Sim-to-real transfer, safety cases, and fleet learning.", milestone: "Deploy autonomy on real hardware in the wild." },
    ],
  },
  {
    id: "wearables",
    name: "Wearables & Health Tech",
    field: "iot",
    blurb: "Continuous biometrics and coaching.",
    description:
      "Computing worn on the body: watches, rings, and patches streaming continuous biometrics — heart rate, sleep, glucose, movement — into coaching and clinical insight. The specialty blends signal processing, low-power engineering, and health-data rigor, and grows as preventive medicine becomes data-driven.",
    trendScore: 84,
    path: [
      { stage: "Foundations", focus: "Sensor basics, BLE communication, and physiology fundamentals.", milestone: "Stream raw sensor data from a wearable to a computer." },
      { stage: "Core Skills", focus: "Signal processing for PPG/ECG/IMU and feature extraction.", milestone: "Compute heart rate and sleep stages from real signals." },
      { stage: "Applied", focus: "Health apps, battery budgets, and regulatory awareness.", milestone: "Ship a coaching feature backed by validated metrics." },
      { stage: "Mastery", focus: "Clinical-grade pipelines and longitudinal health modeling.", milestone: "Own health-tech engineering for a wearable product." },
    ],
  },
  {
    id: "iiot",
    name: "Industrial IoT",
    field: "iot",
    blurb: "Predictive maintenance and digital factories.",
    description:
      "Factories are becoming software systems. IIoT connects machines, sensors, and PLCs to telemetry pipelines that predict failures before they stop production lines. Predictive maintenance alone pays back the investment — which is why manufacturing, energy, and logistics hire IIoT engineers through every economic cycle.",
    trendScore: 82,
    path: [
      { stage: "Foundations", focus: "Industrial protocols (MQTT, OPC-UA, Modbus) and sensor fundamentals.", milestone: "Collect telemetry from a simulated machine." },
      { stage: "Core Skills", focus: "Time-series pipelines, edge gateways, and industrial data models.", milestone: "Build a dashboard showing live machine health." },
      { stage: "Applied", focus: "Predictive-maintenance models and anomaly detection for equipment.", milestone: "Predict a failure from vibration/temperature signals." },
      { stage: "Mastery", focus: "Digital twins and factory-scale digital transformation.", milestone: "Own the IIoT platform for a production environment." },
    ],
  },

  // ── AR/VR & Spatial Computing ────────────────────────────────────────────
  {
    id: "engines",
    name: "3D Engines & Rendering",
    field: "xr",
    blurb: "Real-time graphics and WebGL/WebGPU.",
    description:
      "The math and machinery behind every frame: rendering pipelines, shaders, lighting, and physics in real time. Graphics engineers power games, XR, digital twins, and increasingly web-native 3D via WebGPU. It is a demanding, durable specialty — GPU workloads are only growing as spatial and AI visualization converge.",
    trendScore: 86,
    path: [
      { stage: "Foundations", focus: "Graphics math: vectors, matrices, transforms, and the GPU pipeline.", milestone: "Render a rotating 3D object from scratch or in an engine." },
      { stage: "Core Skills", focus: "Shaders, lighting models, and one major engine or WebGPU deeply.", milestone: "Build a scene with materials, shadows, and post-processing." },
      { stage: "Applied", focus: "Performance optimization: profiling, culling, LOD, and mobile budgets.", milestone: "Hit a frame-rate budget on constrained hardware." },
      { stage: "Mastery", focus: "Engine internals, novel rendering techniques, and XR requirements.", milestone: "Own rendering technology for a shipped product." },
    ],
  },
  {
    id: "xrdesign",
    name: "XR Interaction Design",
    field: "xr",
    blurb: "Gaze, gesture, and presence.",
    description:
      "Designing for space instead of screens: gaze, gesture, voice, and presence replace taps and clicks. XR interaction designers solve comfort, spatial layout, and embodiment — skills with no 2D equivalent. As headsets lighten and enterprise XR matures, this is one of design's least crowded frontiers.",
    trendScore: 82,
    path: [
      { stage: "Foundations", focus: "UX fundamentals plus hands-on time in current XR hardware.", milestone: "Critique a real XR experience for comfort and usability." },
      { stage: "Core Skills", focus: "Spatial interaction patterns: gaze, pinch, raycast, and voice.", milestone: "Prototype an interaction that feels natural in-headset." },
      { stage: "Applied", focus: "Comfort engineering, spatial UI systems, and user testing in XR.", milestone: "Ship an XR flow validated with real users." },
      { stage: "Mastery", focus: "Presence design and cross-device spatial experiences.", milestone: "Own XR interaction standards for products or platforms." },
    ],
  },
  {
    id: "twins",
    name: "Digital Twins",
    field: "xr",
    blurb: "Live simulations of factories and cities.",
    description:
      "A live virtual copy of a physical asset — a factory, building, or city — fed by real sensor data. Digital twins let operators simulate changes before touching reality: test a layout, predict energy use, rehearse emergencies. Enterprise adoption is already real in manufacturing, construction, and urban planning.",
    trendScore: 88,
    path: [
      { stage: "Foundations", focus: "3D data formats, scene composition, and IoT telemetry basics.", milestone: "Render a simple 3D asset fed by live data." },
      { stage: "Core Skills", focus: "Real-time synchronization between physical sensors and 3D scenes.", milestone: "Build a twin that mirrors a live process." },
      { stage: "Applied", focus: "Simulation and what-if analysis over the twin.", milestone: "Answer a real operational question by simulating first." },
      { stage: "Mastery", focus: "City/factory-scale twins, standards (USD), and platform architecture.", milestone: "Own the digital-twin platform for an organization." },
    ],
  },
  {
    id: "haptics",
    name: "Haptics & Sensors",
    field: "xr",
    blurb: "Touch feedback and motion capture.",
    description:
      "The sense XR is missing: touch. Haptics engineers build force feedback, tactile actuators, and motion-capture pipelines that make virtual objects feel real — from surgical simulators to gloves that let you feel a digital handshake. A niche today with outsized leverage as spatial computing matures.",
    trendScore: 80,
    path: [
      { stage: "Foundations", focus: "Electronics, signals, and the psychophysics of touch.", milestone: "Drive a haptic actuator with a designed waveform." },
      { stage: "Core Skills", focus: "Haptic SDKs, force-feedback design, and motion-capture basics.", milestone: "Render distinguishable textures through a haptic device." },
      { stage: "Applied", focus: "Sensor fusion and latency budgets for believable feedback.", milestone: "Ship a haptic feature users can feel the difference in." },
      { stage: "Mastery", focus: "Full-body feedback systems and haptic standards for XR.", milestone: "Own haptic engineering for a spatial product." },
    ],
  },
  {
    id: "spatial",
    name: "Spatial Mapping & Anchors",
    field: "xr",
    blurb: "Persistent world-locked content.",
    description:
      "How does a virtual object stay glued to a real table — across sessions, devices, and users? Spatial mapping and anchoring: SLAM, scene understanding, occlusion, and persistent coordinates. It is the infrastructure layer of spatial computing, and every multi-user AR experience depends on it.",
    trendScore: 84,
    path: [
      { stage: "Foundations", focus: "Computer-vision basics: cameras, geometry, and SLAM concepts.", milestone: "Track a device's pose through a room." },
      { stage: "Core Skills", focus: "Scene understanding, plane detection, occlusion, and anchors.", milestone: "Place world-locked content that survives app restarts." },
      { stage: "Applied", focus: "Persistent shared experiences across devices.", milestone: "Build a multi-user AR scene anchored to a real space." },
      { stage: "Mastery", focus: "World-scale mapping, cloud anchors, and spatial platforms.", milestone: "Own spatial infrastructure for an XR product." },
    ],
  },

  // ── Blockchain & Decentralized Systems ───────────────────────────────────
  {
    id: "contracts",
    name: "Smart Contract Engineering",
    field: "blockchain",
    blurb: "Audited, upgradeable on-chain logic.",
    description:
      "Code that manages money and cannot be patched after deploy. Smart-contract engineers write, test, and upgrade on-chain logic in Solidity or Rust where a single bug can drain millions. The discipline — formal thinking, audits, upgrade patterns — transfers well into any high-assurance engineering role.",
    trendScore: 74,
    path: [
      { stage: "Foundations", focus: "Blockchain fundamentals plus Solidity or Rust basics.", milestone: "Deploy a working contract to a testnet." },
      { stage: "Core Skills", focus: "Contract patterns, testing frameworks, and gas-aware design.", milestone: "Ship a tested, upgradeable contract with test coverage." },
      { stage: "Applied", focus: "Audit findings, common vulnerabilities, and proxy patterns.", milestone: "Pass a mock audit with zero critical findings." },
      { stage: "Mastery", focus: "Protocol architecture, formal verification, and security leadership.", milestone: "Own smart-contract engineering for a live protocol." },
    ],
  },
  {
    id: "defi",
    name: "DeFi Protocols",
    field: "blockchain",
    blurb: "Automated market makers and lending.",
    description:
      "Finance rebuilt as composable software: automated market makers, lending pools, derivatives, and stablecoin rails. DeFi engineering is applied game theory and mechanism design with real money at stake. The sector has matured past hype into infrastructure that traditional finance increasingly adopts.",
    trendScore: 70,
    path: [
      { stage: "Foundations", focus: "Finance fundamentals plus smart-contract basics.", milestone: "Explain how an AMM prices a swap." },
      { stage: "Core Skills", focus: "AMM/lending mechanics, tokenomics, and liquidation logic.", milestone: "Build a toy exchange or lending pool on testnet." },
      { stage: "Applied", focus: "Risk modeling, oracle design, and economic attack analysis.", milestone: "Model failure modes of a real protocol." },
      { stage: "Mastery", focus: "Protocol design at production scale with governance.", milestone: "Design or audit DeFi systems with real TVL." },
    ],
  },
  {
    id: "consensus",
    name: "Chain Infrastructure & Consensus",
    field: "blockchain",
    blurb: "Validators, rollups, and scaling.",
    description:
      "The distributed-systems core of blockchain: consensus algorithms, validator operations, rollups, and data availability. This is infrastructure engineering — closer to kernel and networking work than to dApps — and it underpins every tokenized-asset and stablecoin use case institutions are adopting.",
    trendScore: 72,
    path: [
      { stage: "Foundations", focus: "Distributed-systems fundamentals: replication, consensus, and fault tolerance.", milestone: "Explain how a chain reaches agreement under failures." },
      { stage: "Core Skills", focus: "PoS/BFT mechanisms, node operation, and chain economics.", milestone: "Run a validator or index a chain's data." },
      { stage: "Applied", focus: "Rollups, data availability, and L1-L2 interplay.", milestone: "Trace a transaction across L1 and an L2." },
      { stage: "Mastery", focus: "Protocol engineering and scaling research.", milestone: "Contribute to chain infrastructure at protocol level." },
    ],
  },
  {
    id: "rwa",
    name: "Tokenized Real-World Assets",
    field: "blockchain",
    blurb: "On-chain bonds, funds, and property.",
    description:
      "Trillions in bonds, funds, and property are moving on-chain — tokenized treasuries already outpace most DeFi in value. RWA engineering blends smart contracts with custody, compliance, and oracle infrastructure. It is where traditional finance meets blockchain, and the least crowded bridge between the two.",
    trendScore: 76,
    path: [
      { stage: "Foundations", focus: "Securities basics plus blockchain/token fundamentals.", milestone: "Map a real asset's lifecycle onto on-chain primitives." },
      { stage: "Core Skills", focus: "Tokenization standards, custody models, and identity/permissioning.", milestone: "Design a compliant tokenized-fund architecture." },
      { stage: "Applied", focus: "Oracles, settlement flows, and regulatory workflows.", milestone: "Build an end-to-end tokenization pilot." },
      { stage: "Mastery", focus: "Institutional platforms and cross-jurisdiction strategy.", milestone: "Own RWA engineering for a financial institution." },
    ],
  },
  {
    id: "web3sec",
    name: "Web3 Security",
    field: "blockchain",
    blurb: "Exploit prevention for immutable code.",
    description:
      "Billions have been lost to smart-contract exploits — reentrancy, oracle manipulation, access-control slips. Web3 security specialists audit immutable code, fuzz edge cases, and respond to live incidents. With every exploit public and every audit paid, it is one of security's highest-value niches.",
    trendScore: 80,
    path: [
      { stage: "Foundations", focus: "Smart-contract fundamentals and EVM internals.", milestone: "Read a contract and name its trust assumptions." },
      { stage: "Core Skills", focus: "Classic exploits: reentrancy, front-running, oracle manipulation.", milestone: "Solve audit-style challenges (Ethernaut and peers)." },
      { stage: "Applied", focus: "Fuzzing, static analysis, and formal audit methodology.", milestone: "Complete a real or contest audit with valid findings." },
      { stage: "Mastery", focus: "Incident response, formal verification, and protocol security leadership.", milestone: "Be the auditor protocols pay a premium for." },
    ],
  },

  // ── Bioinformatics & Computational Biology ───────────────────────────────
  {
    id: "genomics",
    name: "Genomics Pipelines",
    field: "biotech",
    blurb: "Sequencing data at population scale.",
    description:
      "A single human genome is ~200GB of raw signal; population studies produce petabytes. Genomics engineers build the pipelines that align sequences, call variants, and keep results reproducible at that scale. As sequencing costs collapse and precision medicine grows, bioinformatics infrastructure becomes critical national capability.",
    trendScore: 86,
    path: [
      { stage: "Foundations", focus: "Molecular-biology basics plus Python and command-line fluency.", milestone: "Process a sequencing file from raw reads to summary stats." },
      { stage: "Core Skills", focus: "Alignment, variant calling, and standard formats (FASTQ/BAM/VCF).", milestone: "Run a complete germline variant-calling pipeline." },
      { stage: "Applied", focus: "Cloud genomics, workflow engines (WDL/Nextflow), and quality control.", milestone: "Scale a pipeline to cohort-level data reproducibly." },
      { stage: "Mastery", focus: "Population-scale biobank infrastructure and clinical genomics.", milestone: "Own genomics pipelines used in research or clinics." },
    ],
  },
  {
    id: "proteins",
    name: "Protein & Drug Discovery AI",
    field: "biotech",
    blurb: "Structure prediction and molecular design.",
    description:
      "AI solved protein structure prediction; now it is designing proteins and drugs from scratch. This field applies deep learning — AlphaFold-class structure models, generative molecular design, docking — to compress drug discovery from years to months. It sits at the intersection of the decade's two fastest-growing fields.",
    trendScore: 92,
    path: [
      { stage: "Foundations", focus: "Structural-biology basics plus deep-learning fundamentals.", milestone: "Explain how AlphaFold predicts structure and run it on a sequence." },
      { stage: "Core Skills", focus: "Structure databases, docking, and molecular representations.", milestone: "Screen candidate molecules against a target protein." },
      { stage: "Applied", focus: "Generative molecular design and wet-lab feedback loops.", milestone: "Design molecules with optimized measured properties." },
      { stage: "Mastery", focus: "End-to-end AI drug-discovery programs and validation rigor.", milestone: "Contribute to a discovery program with real candidates." },
    ],
  },
  {
    id: "medimg",
    name: "Medical Imaging AI",
    field: "biotech",
    blurb: "Diagnostic models with clinical rigor.",
    description:
      "Teaching models to read X-rays, scans, and pathology slides — with the rigor medicine demands: validation on real clinical data, bias awareness, and regulatory thinking. Medical-imaging AI already matches specialist accuracy in narrow tasks; the scarce skill is shipping it safely into clinical workflows.",
    trendScore: 88,
    path: [
      { stage: "Foundations", focus: "Medical imaging basics (DICOM, modalities) plus CNN fundamentals.", milestone: "Train a classifier on a public imaging dataset." },
      { stage: "Core Skills", focus: "Segmentation, detection, and handling clinical data realities.", milestone: "Build a diagnostic model with honest validation." },
      { stage: "Applied", focus: "Regulatory thinking (FDA/CE), bias audits, and clinical integration.", milestone: "Design the validation package a regulator would accept." },
      { stage: "Mastery", focus: "Multimodal clinical AI and deployment in care workflows.", milestone: "Own medical-imaging AI for a health product." },
    ],
  },
  {
    id: "healthdata",
    name: "Health Data Platforms",
    field: "biotech",
    blurb: "Interoperable, privacy-safe records.",
    description:
      "Healthcare runs on data that is fragmented, sensitive, and newly portable. Health-data engineers build platforms around standards like FHIR — interoperable records, privacy-safe analytics, and patient-access APIs. Interoperability mandates worldwide make this a durable, mission-driven specialty.",
    trendScore: 83,
    path: [
      { stage: "Foundations", focus: "Healthcare data landscape and standards: HL7, FHIR resources.", milestone: "Read and produce valid FHIR bundles." },
      { stage: "Core Skills", focus: "Interoperability APIs, terminology (SNOMED/LOINC), and data quality.", milestone: "Connect two systems exchanging real-standard data." },
      { stage: "Applied", focus: "Privacy engineering: de-identification, consent, and access control.", milestone: "Build a privacy-safe analytics flow over health data." },
      { stage: "Mastery", focus: "National-scale ecosystems and health-data product strategy.", milestone: "Own a health-data platform used by clinicians." },
    ],
  },

  // ── Core Software Foundations ────────────────────────────────────────────
  {
    id: "algorithms",
    name: "Algorithms",
    field: "foundations",
    blurb: "Complexity, search, sort, and optimization.",
    description:
      "The grammar of efficient problem-solving: complexity analysis, sorting, searching, recursion, dynamic programming, and optimization. Algorithms remain the universal interview filter and the difference between code that scales and code that collapses — and they are the foundation every specialty from AI to systems is built on.",
    trendScore: 88,
    mapsTo: "algorithms",
    path: [
      { stage: "Foundations", focus: "Big-O analysis, arrays, and basic recursion.", milestone: "Analyze any routine's complexity and defend it." },
      { stage: "Core Skills", focus: "Sorting, binary search, hash-based techniques, greedy, and dynamic programming.", milestone: "Solve intermediate problems independently and explain trade-offs." },
      { stage: "Applied", focus: "Graph algorithms, string processing, and advanced DP.", milestone: "Solve interview-grade problems under time pressure." },
      { stage: "Mastery", focus: "Optimization techniques and algorithm design for real systems.", milestone: "Choose and adapt algorithms as a professional reflex." },
    ],
  },
  {
    id: "data_structures",
    name: "Data Structures",
    field: "foundations",
    blurb: "Arrays to graphs — organizing for speed.",
    description:
      "How data is organized determines what you can do with it — and how fast. From arrays and hash maps to trees, heaps, and graphs, data structures are the vocabulary of efficient software. Mastery means choosing the right structure instinctively and understanding the cost model behind every operation.",
    trendScore: 87,
    mapsTo: "data_structures",
    path: [
      { stage: "Foundations", focus: "Arrays, linked lists, stacks, queues, and hash tables.", milestone: "Implement each from scratch with correct complexity." },
      { stage: "Core Skills", focus: "Trees, binary search trees, and heaps.", milestone: "Use tree and heap structures to solve ordering problems." },
      { stage: "Applied", focus: "Graphs, tries, union-find, and amortized analysis.", milestone: "Model real problems as graph or trie operations." },
      { stage: "Mastery", focus: "Structure selection and custom design for real systems.", milestone: "Justify structure choices in production architectures." },
    ],
  },
  {
    id: "ood",
    name: "Object-Oriented Design",
    field: "foundations",
    blurb: "Modeling systems with classes and contracts.",
    description:
      "Modeling complex systems as cooperating objects with clear contracts: encapsulation, inheritance, polymorphism, and the SOLID principles. OOD is how large codebases stay changeable — and the design vocabulary behind design patterns, domain modeling, and clean architecture that senior engineers are judged on.",
    trendScore: 84,
    mapsTo: "oop",
    path: [
      { stage: "Foundations", focus: "Classes, objects, inheritance, and polymorphism in one OOP language.", milestone: "Model a small system with well-named cooperating classes." },
      { stage: "Core Skills", focus: "SOLID principles and the core design patterns (creational, structural, behavioral).", milestone: "Recognize and apply patterns where they earn their keep." },
      { stage: "Applied", focus: "Domain modeling, refactoring techniques, and test-driven design.", milestone: "Refactor a tangled module into clean, tested objects." },
      { stage: "Mastery", focus: "Architecture-level design judgment and review leadership.", milestone: "Lead design reviews that raise a team's code quality." },
    ],
  },
  {
    id: "syntax",
    name: "Language Syntax & Tooling",
    field: "foundations",
    blurb: "Fluency in the grammar of code.",
    description:
      "Fluency is a prerequisite: types, control flow, idioms, and the standard library of your language — plus the tooling (editors, linters, formatters, debuggers) that makes you fast. True fluency shows as velocity in learning the next language, because fundamentals transfer once grammar stops being a barrier.",
    trendScore: 82,
    mapsTo: "syntax",
    path: [
      { stage: "Foundations", focus: "One language deeply: types, control flow, functions, and collections.", milestone: "Write idiomatic programs without looking up basics." },
      { stage: "Core Skills", focus: "Standard library mastery, error handling, and language idioms.", milestone: "Read library-quality code and understand its choices." },
      { stage: "Applied", focus: "Tooling: linters, formatters, debuggers, and package managers.", milestone: "Set up a professional-grade workflow for any project." },
      { stage: "Mastery", focus: "Polyglot transfer: learn new languages in days, not months.", milestone: "Be productive in a second language within a week." },
    ],
  },
  {
    id: "debugging",
    name: "Debugging & Testing",
    field: "foundations",
    blurb: "Systematic fault isolation and verification.",
    description:
      "The highest-leverage skill nobody teaches: turning 'it doesn't work' into a root cause, systematically. Debugging mastery means reproducible hypotheses, bisection, instrumentation, and profiling — plus the testing discipline that prevents regressions. The person who can fix anything becomes indispensable on every team.",
    trendScore: 86,
    mapsTo: "debugging",
    path: [
      { stage: "Foundations", focus: "Reading error messages, reproducing bugs, and forming hypotheses.", milestone: "Turn a vague failure into a minimal repro case." },
      { stage: "Core Skills", focus: "Debuggers, logging strategy, and bisection (git bisect, input halving).", milestone: "Isolate a planted bug with a systematic trace." },
      { stage: "Applied", focus: "Unit/integration testing, profiling, and production debugging.", milestone: "Catch a regression before users do, and prove it." },
      { stage: "Mastery", focus: "Postmortems, flaky-test eradication, and incident diagnosis.", milestone: "Be the engineer called when nothing else works." },
    ],
  },
  {
    id: "sysdesign",
    name: "System Design & Architecture",
    field: "foundations",
    blurb: "Scale, trade-offs, and clean boundaries.",
    description:
      "The senior engineer's craft: designing systems that stay fast, available, and changeable at scale. Load balancers, caching, sharding, queues, and the consistency trade-offs between them — system design is what interviews test, what promotions require, and what separates code-writers from architects.",
    trendScore: 90,
    path: [
      { stage: "Foundations", focus: "Client-server models, databases, and caching basics.", milestone: "Diagram how a simple web service handles a request." },
      { stage: "Core Skills", focus: "Load balancing, replication, sharding, queues, and CAP trade-offs.", milestone: "Design a URL shortener or feed with justified choices." },
      { stage: "Applied", focus: "Full designs: chat, streaming, payments — with failure modes.", milestone: "Present a design that survives adversarial review." },
      { stage: "Mastery", focus: "Architecture leadership, reviews, and evolution strategy.", milestone: "Own architecture decisions for production systems." },
    ],
  },
];

export const topViralDomains = [...COMPUTING_DOMAINS]
  .sort((a, b) => b.trendScore - a.trendScore)
  .slice(0, 3);

export function fieldOf(domain: ComputingDomain): DomainField {
  return DOMAIN_FIELDS.find((f) => f.id === domain.field)!;
}
