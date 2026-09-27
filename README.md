# Muskan Mittal · Portfolio

A professional portfolio for **Muskan Mittal**, a final-year B.Tech CSE (Full Stack AI) student at UPES who has interned at Xebia and Teal Feed. It includes an **AI assistant built on retrieval-augmented generation (RAG)** that answers recruiters' questions about her, grounded only in her resume and GitHub repositories, and cites its sources.

> Stack: **Next.js 16 (App Router) · React 19 · TypeScript · Google Gemini (embeddings + generation) · hybrid BM25/vector retrieval · GitHub REST API with ISR · Vercel**

---

## Contents

1. [Features](#features)
2. [Technology choices](#technology-choices)
3. [How the AI assistant works (RAG)](#how-the-ai-assistant-works-rag)
4. [Project structure](#project-structure)
5. [Running locally](#running-locally)
6. [Deploying to Vercel](#deploying-to-vercel)
7. [Updating content](#updating-content)
8. [Quality, security and accessibility](#quality-security-and-accessibility)
9. [API reference](#api-reference)

For a deeper design write-up, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Features

| Area | What it does |
|---|---|
| **Hero** | Availability status, role, one-line pitch, CTAs (projects, AI assistant, resume) and social links, beside a code-styled profile card. |
| **About / Experience** | Narrative plus quick facts; internship cards for Xebia and Teal Feed with responsibilities and tech used. |
| **Projects** | Five case-study cards (MindCare, VayuTask AI, Tomato, PeerFlow, Diabetes Prediction API). Each shows the problem, what was built, the architecture, the stack, source and live links, and an **"Ask AI"** button that sends a question about that project to the assistant. |
| **Skills** | Grouped toolkit: languages, front-end, back-end, AI/GenAI, data and tools. |
| **Live GitHub** | Repositories, languages and last-updated dates fetched **server-side from the GitHub API**, cached with **Incremental Static Regeneration** (hourly), with a static fallback if GitHub is unreachable. |
| **AI assistant** | Floating chat with **streamed answers**, **source citations**, suggested questions, multi-turn follow-ups, stop / reset, and Esc to close. Full-screen on mobile. |
| **Contact** | Every profile from the resume: **GitHub, LinkedIn, LeetCode, email, phone**, plus a resume download. |
| **Theming** | Dark and light themes that follow the OS preference with a manual toggle; the theme is applied before paint, so there's no flash. |
| **SEO** | Metadata, Open Graph, `schema.org/Person` JSON-LD and an SVG favicon. |

## Technology choices

| Technology | Why |
|---|---|
| **Next.js App Router + React Server Components** | The page is statically rendered for speed. The GitHub section renders on the server, so no API token or rate limit reaches the browser. The chat endpoint runs as a serverless route on the same deployment. |
| **TypeScript (strict)** | One typed data model (`src/data/profile.ts`) feeds the UI and the knowledge base. |
| **Google Gemini** | `gemini-embedding-001` for semantic vectors and `gemini-2.5-flash` for fast, low-cost streamed generation. Both models can be changed with environment variables. |
| **Plain `fetch` against the Gemini REST API** | No SDK lock-in, a smaller serverless bundle, and every request and response shape is visible in [`gemini.ts`](src/lib/rag/gemini.ts). |
| **Hand-written CSS with design tokens** | Full control over the design with no framework runtime. Tokens live on `:root` and are overridden per theme. |
| **`next/font` (Geist + Geist Mono)** | Self-hosted fonts with no layout shift. |
| **Node's built-in test runner** | Zero-dependency unit tests for retrieval and markdown sanitising. |

## How the AI assistant works (RAG)

```
            ┌────────────── ingestion (offline, npm run ingest) ───────────────┐
 resume ──► │ src/data/profile.ts ─┐                                            │
 GitHub ──► │ README sections ─────┴─► heading-aware chunks (42) ─► JSON        │
            └────────────────────────────────────────────────────────────────────┘
                                                   │
 question ─► /api/chat ─► validate + rate-limit ─► hybrid retrieval
                                                   ├─ dense : Gemini embeddings, cosine similarity
                                                   ├─ sparse: BM25 keyword scoring
                                                   └─ Reciprocal Rank Fusion ─► top-k + pinned summary
                                                   │
                         Gemini (system prompt + numbered context + chat history)
                                                   │
                         streamed text  ──►  chat UI  (+ X-Sources header ─► citation chips)
```

1. **Ingestion.** Resume facts are chunked from the same typed data the page renders, so the page and the bot can't disagree. [`scripts/ingest-github.mjs`](scripts/ingest-github.mjs) pulls each repository README, keeps the sections that describe *what was built* (features, architecture, stack), drops setup and runbook noise and code blocks, and splits long sections by heading. The output is committed so builds never depend on GitHub.
2. **Embedding.** Document vectors (768 dimensions, `RETRIEVAL_DOCUMENT`) are computed once per server instance with a single batched call and memoised. Queries are embedded as `RETRIEVAL_QUERY`.
3. **Hybrid retrieval.** Dense search captures meaning ("is she good with databases?"). BM25 captures exact terms ("Redis", "Prisma", "Teal Feed"). **Reciprocal Rank Fusion** merges the two rankings without calibrating their scores. The profile summary is always pinned, so broad questions have context. Follow-up questions also include the previous question in the retrieval query.
4. **Grounded generation.** A strict system prompt tells Gemini to answer only from the numbered context, never invent metrics or links, say when it doesn't know, stay on topic and ignore prompt-injection attempts.
5. **Streaming and citations.** Tokens stream to the browser as they are generated. Sources travel in an `X-Sources` response header and render as clickable chips.
6. **Graceful degradation.** If there's no API key, or Gemini fails or runs out of quota, retrieval falls back to BM25 only, and the endpoint returns an *extractive* answer built from the top passages. The assistant always responds.

## Project structure

```
├── scripts/ingest-github.mjs     # RAG ingestion: GitHub READMEs → chunks
├── src/
│   ├── app/
│   │   ├── layout.tsx            # fonts, metadata, JSON-LD, no-flash theme script
│   │   ├── page.tsx              # section composition (ISR, revalidate = 1h)
│   │   ├── globals.css           # design tokens, themes, all component styles
│   │   ├── icon.svg
│   │   └── api/
│   │       ├── chat/route.ts     # validate → rate-limit → retrieve → stream
│   │       └── health/route.ts   # assistant configuration status
│   ├── components/
│   │   ├── Sections.tsx          # Hero, About, Experience, Projects, Skills, Education, Contact
│   │   ├── GitHubSection.tsx     # async server component (GitHub API)
│   │   ├── ChatAssistant.tsx     # client chat UI with streaming
│   │   ├── AskButton.tsx         # opens the assistant from anywhere (custom event)
│   │   ├── Nav.tsx               # sticky nav, scroll-spy, theme toggle, mobile menu
│   │   └── Icons.tsx
│   ├── data/
│   │   ├── profile.ts            # single source of truth for all content
│   │   └── github-knowledge.json # generated by `npm run ingest`
│   └── lib/
│       ├── rag/
│       │   ├── knowledge.ts      # builds the chunked knowledge base
│       │   ├── bm25.ts           # BM25 + reciprocal rank fusion
│       │   ├── gemini.ts         # embeddings + SSE streaming client
│       │   ├── retriever.ts      # hybrid retrieval with memoised vectors
│       │   ├── prompt.ts         # system prompt, context formatting, fallback
│       │   └── types.ts
│       ├── github.ts             # GitHub snapshot with ISR + fallback
│       ├── markdown.ts           # safe markdown → HTML for bot replies
│       └── rateLimit.ts          # sliding-window limiter
├── tests/rag.test.ts
├── public/Muskan_Mittal_Resume.pdf
└── docs/ARCHITECTURE.md
```

## Running locally

Requires **Node.js 20+**.

```bash
npm install
cp .env.example .env.local      # then paste your Gemini key
npm run dev                     # http://localhost:3000
```

Get a free Gemini API key at <https://aistudio.google.com/app/apikey>. Without a key the site still works fully, and the assistant answers in extractive (retrieval-only) mode.

| Script | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build && npm start` | Production build and server |
| `npm run ingest` | Refresh the GitHub knowledge chunks |
| `npm test` | Unit tests (retrieval, rank fusion, markdown sanitising) |
| `npm run typecheck` | TypeScript check |

### Environment variables

| Name | Required | Default | Purpose |
|---|---|---|---|
| `GEMINI_API_KEY` | For generated answers | – | Gemini API key (server-only, never sent to the browser) |
| `GEMINI_MODEL` | No | `gemini-2.5-flash` | Generation model |
| `GEMINI_EMBED_MODEL` | No | `gemini-embedding-001` | Embedding model |
| `GITHUB_TOKEN` | No | – | Raises the GitHub API rate limit (no scopes needed) |
| `NEXT_PUBLIC_SITE_URL` | No | `http://localhost:3000` | Canonical URL for Open Graph metadata |

## Deploying to Vercel

1. Push this folder to a GitHub repository.
2. On <https://vercel.com/new>, import the repository. The framework is detected automatically.
3. Add `GEMINI_API_KEY` (and optionally `NEXT_PUBLIC_SITE_URL` set to the production URL) under **Settings → Environment Variables**.
4. Deploy, then open `/api/health` and confirm `"generative": true`.

## Updating content

- **Resume, projects, skills, links:** edit [`src/data/profile.ts`](src/data/profile.ts). The page and the assistant's knowledge update together.
- **GitHub READMEs changed:** run `npm run ingest` and commit `src/data/github-knowledge.json`.
- **Resume PDF:** replace `public/Muskan_Mittal_Resume.pdf`.

## Quality, security and accessibility

- **Security:** the API key stays server-side; input is validated (roles, length, history cap); per-IP sliding-window rate limit (20 requests / 5 min); the prompt is hardened against injection; model output is HTML-escaped before rendering and links are limited to `http(s)`/`mailto`; security headers (`nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`).
- **Resilience:** GitHub falls back to a static snapshot; retrieval falls back to BM25; generation falls back to an extractive answer; embedding failures back off for 60 seconds.
- **Performance:** the home page is statically generated and revalidated hourly; there are no client-side data fetches on load; fonts are self-hosted; the only client JavaScript is the nav and the chat.
- **Accessibility:** semantic landmarks, a skip link, visible focus rings, `aria-live` chat updates, labelled icon buttons, keyboard support (Enter / Shift+Enter / Esc), `prefers-reduced-motion` respected, and scroll animations written in pure CSS so content is never hidden when they're unsupported.
- **Responsive:** tested from 360 px phones to wide desktops.

## API reference

### `POST /api/chat`

```jsonc
// request
{ "messages": [ { "role": "user", "content": "What did she build at Teal Feed?" } ] }
```

Response: `text/plain` stream of the answer. Headers:

| Header | Meaning |
|---|---|
| `X-Sources` | URI-encoded JSON array of `{ title, source, url? }` used for citations |
| `X-Retrieval-Mode` | `hybrid` (vectors + BM25) or `lexical` (BM25 only) |
| `X-Answer-Mode` | `generative` (Gemini) or `extractive` (fallback) |

Errors: `400` for invalid input, `429` (with `Retry-After`) when rate-limited.

### `GET /api/health`

```json
{ "status": "ok", "assistant": { "generative": true, "model": "gemini-2.5-flash", "embedModel": "gemini-embedding-001", "knowledgeChunks": 42 } }
```

---

© Muskan Mittal · [GitHub](https://github.com/muskan-424) · [LinkedIn](https://www.linkedin.com/in/muskan-mittal-2b33a536a) · [LeetCode](https://leetcode.com/u/muskan_424)
