/**
 * portfolioData.js
 * Master single source of truth for Godwin Odhiambo's Dossier Portfolio.
 * Integrates all projects, credentials, and live execution diagrams.
 */
import { projects } from './projects.js';

export const profileData = {
  name: "Godwin Odhiambo",
  brand: "GASEWE",
  title: "Full-Stack Software Engineer & Product Architect",
  location: "Nairobi, Kenya",
  status: "Open to Opportunities / Builds",
  timezone: "EAT (UTC+3)",
  email: "otienogodwin23@gmail.com",
  github: "https://github.com/Goddii",
  linkedin: "https://www.linkedin.com/in/godwin-odhiambo-bb28b3419",
  cvPath: "/Godwin_Odhiambo_CV_Full.pdf",

  executiveSummary:
    "Full-stack engineer and product builder grounded in three years of physical branch operations and client credit risk modeling before software engineering. 1st Place National Champion at the Jitume Tech Challenge. Specializes in building deterministic multi-agent AI systems, resilient fintech payment integrations (M-Pesa Daraja STK), and scalable distributed web architectures.",

  operationalPhilosophy:
    "Software doesn't live in a theoretical bubble: networks disconnect, webhook deliveries duplicate, and reconciliation errors cost real capital. My operational background in high-volume branch distribution taught me to build defensive, schema-strict systems designed for how humans and money actually move.",

  metrics: [
    { label: "Engineering Recognition", value: "1st Place National Champion" },
    { label: "Core Operations Experience", value: "3+ Years Branch Management" },
    { label: "AI & Fintech Pipelines", value: "Multi-Agent & M-Pesa STK" },
    { label: "Availability", value: "Immediate / Contract & Full-time" }
  ],

  stackCategories: [
    {
      id: "all",
      label: "All Technologies"
    },
    {
      id: "core",
      label: "Languages & Frameworks",
      skills: ["React", "TypeScript", "Python", "JavaScript (ES6+)", "Flask", "Node.js", "Tailwind CSS"]
    },
    {
      id: "ai",
      label: "AI & Orchestration",
      skills: ["NVIDIA NIM", "Pydantic Schema Validation", "Prompt Chaining", "Multi-Agent Pipelines", "REST APIs"]
    },
    {
      id: "data",
      label: "Data & Systems",
      skills: ["PostgreSQL", "SQLAlchemy", "SQLite", "Redis", "Docker", "Git/GitHub", "Linux (Ubuntu)"]
    },
    {
      id: "payments",
      label: "Fintech & Integrations",
      skills: ["Safaricom Daraja API", "M-Pesa STK Push", "JWT Authentication", "Role-Based Access Control (RBAC)"]
    }
  ],

  credentials: [
    {
      role: "1st Place National Champion",
      organization: "Jitume Tech Challenge (Konza Technopolis / ICT Authority)",
      period: "2026",
      detail: "Awarded 1st place nationwide for architecting 'The Exodus' — an autonomous multi-agent AI pipeline transforming meeting transcripts into validated client briefs and proposals using NVIDIA NIM microservices."
    },
    {
      role: "Software Engineering Specialization",
      organization: "Moringa School · Nairobi",
      period: "2026",
      detail: "Full-stack immersion covering React, Python/Flask, PostgreSQL, schema validation, REST architecture, and agile product development."
    },
    {
      role: "Branch Operations & Credit Risk Manager",
      organization: "Spertrack Limited · Busia, Kenya",
      period: "2022 – 2024",
      detail: "Led branch physical distribution, credit risk assessments, client reconciliation, and inventory tracking before transitioning full-time into software engineering."
    },
    {
      role: "Bachelor of Science in Information Technology",
      organization: "Maseno University",
      period: "Graduated 2022",
      detail: "Foundational training in computer systems, relational database architecture, object-oriented programming, and network security."
    }
  ]
};

export const caseFiles = projects.map((p, idx) => ({
  id: `CASE-0${idx + 1}`,
  slug: p.slug,
  name: p.name,
  tagline: p.tagline,
  meta: p.meta || 'Full-Stack Production System',
  category: p.category || 'production',
  award: p.award || null,
  featured: p.featured || false,
  description: p.description,
  overview: p.description || p.problem,
  problem: p.problem,
  solution: p.solution,
  myContribution: p.myContribution,
  challenges: p.challenges,
  stack: p.stack || [],
  architecture: p.architecture || [],
  live: p.live || null,
  repos: p.repos || (p.repo ? [{ label: 'GitHub', url: p.repo }] : [{ label: 'GitHub', url: 'https://github.com/Goddii' }]),
  repo: p.repos?.[0]?.url || p.repo || 'https://github.com/Goddii',
  flow: p.flow || null,
  image: p.image || '/assets/projects/the-exodus.png',
  metrics: p.metrics || [],
}));

export const chapters = [
  { id: "01", key: "dossier", title: "01 Dossier", subtitle: "Executive Overview & Technical Core" },
  { id: "02", key: "casefiles", title: "02 Case Files", subtitle: "Production Engineering Builds" },
  { id: "03", key: "credentials", title: "03 Credentials", subtitle: "Career Milestones & Certifications" },
  { id: "04", key: "dispatch", title: "04 Dispatch", subtitle: "Direct Communication & Access" }
];
