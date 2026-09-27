/**
 * Single source of truth for everything on the site.
 * The UI renders from this file and the RAG knowledge base is chunked from it,
 * so the assistant can never drift from what the page says.
 */

export type Link = { label: string; href: string };

export type Social = {
  id: "github" | "linkedin" | "leetcode" | "email" | "phone";
  label: string;
  handle: string;
  href: string;
};

export type Experience = {
  company: string;
  role: string;
  location: string;
  period: string;
  current?: boolean;
  summary: string;
  bullets: string[];
  stack: string[];
};

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  status: string;
  category: "AI" | "Full Stack" | "Backend" | "ML";
  problem: string;
  highlights: string[];
  architecture: string[];
  stack: string[];
  repo: string;
  live?: Link[];
  role?: string;
};

export const profile = {
  name: "Muskan Mittal",
  firstName: "Muskan",
  title: "Full-Stack & GenAI Engineer",
  headline: "I build secure, role-based web platforms and ground AI features in real data.",
  location: "Sirsa, Haryana, India",
  college: "UPES, Dehradun",
  availability: "Open to SDE / Full-Stack internships and new-grad roles (Class of 2027)",
  summary:
    "Final-year B.Tech Computer Science (Full Stack AI) student at UPES, Dehradun, with two software internships (Xebia and Teal Feed). " +
    "Works across the stack: React / React Native front-ends, Node.js / Express and FastAPI back-ends, MongoDB, PostgreSQL and Redis, " +
    "and applied GenAI features such as RAG pipelines, LangChain / LangGraph agents and NLP sentiment analysis. " +
    "Her projects focus on real product concerns: role-based access control, API contracts, caching, tests and deployment.",
  about: [
    "I'm a final-year Computer Science student at UPES, specialising in Full Stack AI. I like the part of engineering where a product idea turns into APIs, schemas and screens that hold up once real users arrive.",
    "At Teal Feed I was the sole front-end owner of a three-role marketplace and shipped every dashboard in a six-week sprint cycle. At Xebia I worked on the backend of an AI-proctored examination platform: API contracts, relational schema design and Dockerised services, inside a 24-person, four-team programme.",
    "Outside internships, I build full products end to end. MindCare is a mental-health platform with an NLP risk pipeline and a RAG recommendation layer. VayuTask AI is an AI-native gig marketplace on FastAPI and Next.js. I care about the unglamorous parts too: RBAC, caching, test suites, CI and runbooks.",
  ],
  resumeUrl: "/Muskan_Mittal_Resume.pdf",
  photoUrl: "/muskan.jpg",
  email: "muskanmittal151@gmail.com",
  phone: "+91 87088 73229",
};

export const socials: Social[] = [
  { id: "github", label: "GitHub", handle: "muskan-424", href: "https://github.com/muskan-424" },
  {
    id: "linkedin",
    label: "LinkedIn",
    handle: "muskan-mittal",
    href: "https://www.linkedin.com/in/muskan-mittal-2b33a536a",
  },
  { id: "leetcode", label: "LeetCode", handle: "muskan_424", href: "https://leetcode.com/u/muskan_424" },
  { id: "email", label: "Email", handle: profile.email, href: `mailto:${profile.email}` },
  { id: "phone", label: "Phone", handle: profile.phone, href: "tel:+918708873229" },
];

export const stats = [
  { value: "2", label: "Software internships" },
  { value: "5+", label: "Full products shipped" },
  { value: "100+", label: "LeetCode DSA problems" },
  { value: "8.3", label: "CGPA / 10" },
];

export const experience: Experience[] = [
  {
    company: "Xebia",
    role: "Backend Developer Intern",
    location: "Remote",
    period: "Jun 2026 – Jul 2026",
    summary:
      "Backend developer on the Question & Exam module of an AI-proctored examination platform, one of six engineers on the module inside a 24-member, four-team programme run in Agile sprints.",
    bullets: [
      "Backend developer on a 6-member team building the Question & Exam module of an AI-proctored examination platform, delivered through structured Agile sprints across a 24-member, 4-team program.",
      "Owned API contract design, relational schema modelling (ER diagrams) and Dockerised backend services.",
      "Coordinated interface changes with dependent teams so integrations stayed unblocked.",
      "Also contributed to PeerFlow (team Code Fixers), a peer-review allocation system, owning the Jest unit test suites and constraint verification.",
    ],
    stack: ["API contract design", "ER modelling", "Relational schemas", "Docker", "Agile sprints", "Jest (PeerFlow)"],
  },
  {
    company: "Teal Feed",
    role: "Software Engineer Intern",
    location: "Gurugram",
    period: "Jun 2025 – Jul 2025",
    summary:
      "Sole front-end owner of a three-role (User / Tasker / Admin) service marketplace; also standardised the Node.js / Express REST layer.",
    bullets: [
      "Sole front-end owner of a 3-role marketplace (User / Tasker / Admin): designed and shipped every role-based React dashboard within a 6-week sprint cycle, removing the need for a planned contractor engagement.",
      "Standardised Node.js / Express REST endpoints (authentication, task CRUD, bidding) into a consistent API contract, cutting QA-reported integration bugs in the final sprint.",
      "Awarded a Letter of Recommendation for on-schedule delivery of all assigned features and for proactively refactoring two legacy service modules before handoff.",
    ],
    stack: ["React.js", "Node.js", "Express.js", "MongoDB", "JWT", "RBAC"],
  },
];

export const projects: Project[] = [
  {
    slug: "mindcare",
    name: "MindCare",
    tagline: "AI-powered mental-health monitoring platform",
    status: "Ongoing",
    category: "AI",
    problem:
      "Mood journals rarely turn into timely help. MindCare turns daily mood logs into a risk signal and grounded recommendations, with separate views for users, clinicians and admins.",
    highlights: [
      "4-module AI pipeline: mood log → NLP analysis → risk scoring → recommendations, classifying emotional risk into 4 tiers for near real-time feedback.",
      "RAG recommendation layer grounds suggestions in a curated knowledge base, so responses stay contextual instead of generic model output.",
      "Redis caching across role-based dashboards plus a JWT + RBAC multi-tenant architecture that enforces strict data separation between roles.",
      "Tink, an in-app AI assistant (Gemini), with WebSocket chat on long-lived hosts and automatic REST fallback on serverless.",
      "React Native mobile app, Express / MongoDB API on Vercel, and a Vite admin dashboard; 108 front-end and 76 back-end tests with GitHub Actions CI for all three apps.",
    ],
    architecture: [
      "React Native app → Express REST API (Vercel) or long-lived Node server (Render / Fly.io / Docker) for WebSockets and background jobs",
      "MongoDB Atlas for persistence, Redis cache in front of dashboard queries",
      "OpenAPI docs at /api/docs and a production smoke-check script (npm run verify:prod)",
    ],
    stack: ["React Native", "Node.js", "Express", "MongoDB", "Redis", "NLP", "RAG", "Gemini", "JWT", "Docker", "GitHub Actions"],
    repo: "https://github.com/muskan-424/MindCare-App",
    live: [
      { label: "API", href: "https://mind-care-app-five.vercel.app/api/health" },
      { label: "Admin", href: "https://admin-beta-umber-40.vercel.app" },
    ],
  },
  {
    slug: "vayutask",
    name: "VayuTask AI (Airtasker)",
    tagline: "AI-native gig marketplace for India",
    status: "Ongoing",
    category: "AI",
    problem:
      "Posting a local job and trusting a stranger to do it is slow and risky. VayuTask lets posters describe a task by text, voice or photo, and wraps offers, escrow and verification around it.",
    highlights: [
      "Began as a 3-role MERN marketplace (task posting, provider bidding, admin review) during the Teal Feed internship; she has kept maintaining and extending it independently since.",
      "Now rebuilt on FastAPI + PostgreSQL (Alembic migrations) with a Next.js web app.",
      "AI task drafting from text, voice and images (Gemini), smart budget suggestions, skill extraction and a personalised tasker feed.",
      "Full marketplace lifecycle: offers, accept, Razorpay escrow with service-fee quotes, cancellation fees, public Q&A, phone / email OTP verification.",
      "Production-minded ops: Docker Compose staging / prod overlays (non-root, dropped capabilities), backup / restore and migration-recovery runbooks, Prometheus + Grafana observability.",
      "In the original MERN version, optimised MongoDB aggregation queries that power real-time task-status updates, reducing average response time on task-listing endpoints.",
    ],
    architecture: [
      "Next.js front-end → REST (rewritten to the API) + WebSockets for chat and notifications",
      "FastAPI service → PostgreSQL, optional Redis profile",
      "Gemini 2.0 Flash / Pro Vision for task parsing; Bhashini for Indian-language translation",
    ],
    stack: ["FastAPI", "Python", "Next.js", "PostgreSQL", "Alembic", "Gemini", "WebSockets", "Razorpay", "Docker", "MERN (v1)"],
    repo: "https://github.com/muskan-424/air-tasker",
    live: [{ label: "Live", href: "https://air-tasker.vercel.app" }],
  },
  {
    slug: "tomato",
    name: "Tomato: Food Delivery",
    tagline: "Zomato-style ordering platform with user and admin apps",
    status: "Jun 2024 – Nov 2024",
    category: "Full Stack",
    problem:
      "A complete food-ordering experience: browse, cart, pay and track, with an admin side to run menus, offers, orders and reviews.",
    highlights: [
      "Built solo: a 2-dashboard (User / Admin) MERN platform covering menu management, cart, live order tracking and a Cloudinary media pipeline.",
      "JWT authentication across REST APIs with role-based access checks and bcrypt password hashing.",
      "Admin batch-upload flow using Cloudinary auto-optimised images.",
      "Extended with reviews and AI sentiment classification, offers and payment-method discounts, wishlists, support tickets and multi-restaurant support.",
      "Dockerised multi-service setup with Nginx and cross-platform deployment scripts; deployed on Render.",
    ],
    architecture: [
      "React (Vite) user app + separate React admin app",
      "Node.js / Express REST API → MongoDB Atlas; Cloudinary for media",
      "Docker Compose + Nginx reverse proxy for production",
    ],
    stack: ["MongoDB", "Express", "React", "Node.js", "Cloudinary", "JWT", "Docker", "Nginx"],
    repo: "https://github.com/muskan-424/food-delivery-app",
    live: [
      { label: "User app", href: "https://food-delivery-frontend-s2l9.onrender.com/" },
      { label: "Admin", href: "https://food-delivery-admin-wrme.onrender.com/" },
    ],
  },
  {
    slug: "peerflow",
    name: "PeerFlow",
    tagline: "Peer-review allocation engine for LMS courses (Xebia team project)",
    status: "2026",
    category: "Backend",
    role: "Unit test suites and constraint verification",
    problem:
      "Manually assigning peer reviewers is unfair and error-prone. PeerFlow automates it while guaranteeing no self-review, no same-team review, no repeat pairs and a balanced workload.",
    highlights: [
      "Built by team Code Fixers during the Xebia internship; Muskan owned the Jest unit test suites and constraint verification.",
      "Greedy constraint-first allocation engine: 5 hard constraints and 2 soft constraints, relaxing the repeat-pair rule only when the reviewer pool would otherwise run short.",
      "Test suites verify the core constraint logic (100% coverage reported on the allocation rules).",
      "Instructor / Student RBAC with JWT, Zod validation and a fairness-analytics dashboard (Gini coefficient, workload parity).",
    ],
    architecture: [
      "React 19 + Vite + TypeScript front-end with Recharts",
      "Express + TypeScript API, Prisma ORM → PostgreSQL",
      "Jest / ts-jest test suite for every constraint",
    ],
    stack: ["TypeScript", "Node.js", "Express", "Prisma", "PostgreSQL", "Zod", "Jest", "React"],
    repo: "https://github.com/muskan-424/peer-review-allocation-system",
  },
  {
    slug: "diabetes-api",
    name: "Diabetes Prediction API",
    tagline: "Serving a scikit-learn model behind a typed FastAPI service",
    status: "2026",
    category: "ML",
    problem:
      "Wraps a pre-trained classifier in a production-style API that validates patient health metrics and returns a prediction with a confidence score.",
    highlights: [
      "FastAPI app with a lifespan hook that loads the model once at startup.",
      "Pydantic v2 schemas for eight clinical inputs (glucose, BMI, insulin, age and more) and typed error responses (422 / 500 / 503).",
      "Service layer separates model loading and inference, with explicit ModelNotLoaded and PredictionError errors.",
    ],
    architecture: ["FastAPI + Uvicorn", "scikit-learn model serialised with joblib", "Pydantic request / response models"],
    stack: ["Python", "FastAPI", "scikit-learn", "Pydantic", "NumPy"],
    repo: "https://github.com/muskan-424/diabetes-prediction",
  },
];

export const skills: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["JavaScript", "TypeScript", "Python", "Java", "C", "SQL"] },
  {
    group: "Front-end",
    items: ["React.js", "React Native", "Next.js", "Vite", "Protected routing", "Role-based UI"],
  },
  {
    group: "Back-end",
    items: ["Node.js", "Express.js", "FastAPI", "REST API design", "JWT auth", "RBAC middleware", "WebSockets"],
  },
  {
    group: "AI / GenAI",
    items: [
      "RAG pipelines",
      "LangChain",
      "LangGraph",
      "Vector search & embeddings",
      "Prompt engineering",
      "NLP sentiment analysis",
      "Gemini API",
    ],
  },
  {
    group: "Data & caching",
    items: ["MongoDB (aggregation, indexing)", "PostgreSQL", "Prisma", "Redis", "Query optimisation"],
  },
  {
    group: "Tools & practice",
    items: ["Git", "Docker", "Postman", "Cloudinary", "Figma", "Jest", "GitHub Actions", "Agile / Scrum"],
  },
];

export const education = [
  {
    school: "University of Petroleum and Energy Studies (UPES), Dehradun",
    degree: "B.Tech, Computer Science & Engineering (Full Stack AI)",
    period: "2023 – 2027",
    score: "CGPA 8.3 / 10",
  },
  { school: "Senior Secondary (XII), CBSE", degree: "Class XII", period: "2022", score: "75%" },
  { school: "Secondary (X), CBSE", degree: "Class X", period: "2020", score: "91.6%" },
];

export const certifications = [
  "Solved 100+ Data Structures & Algorithms problems on LeetCode across arrays, trees, graphs and dynamic programming.",
  "Cisco Networking Academy: Introduction to Modern AI.",
  "Cisco Networking Academy: Data Analytics Essentials (Excel, SQL, Tableau).",
  "Cisco Networking Academy: Apply AI: Analyze Customer Reviews (applied LLM workflows).",
  "Letter of Recommendation from Teal Feed for on-schedule delivery and proactive refactoring.",
];

export const suggestedQuestions = [
  "What did Muskan build at Teal Feed?",
  "How does the RAG layer in MindCare work?",
  "Which backend technologies does she know?",
  "Is she a good fit for a full-stack role?",
  "How can I contact her?",
];
