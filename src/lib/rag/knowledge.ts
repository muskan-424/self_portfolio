import { certifications, education, experience, profile, projects, skills, socials } from "@/data/profile";
import github from "@/data/github-knowledge.json";
import type { Chunk } from "./types";

/**
 * Builds the knowledge base the assistant retrieves from.
 * Resume facts come from src/data/profile.ts (the same data the page renders);
 * repository facts come from the committed output of `npm run ingest`.
 */
function buildKnowledgeBase(): Chunk[] {
  const chunks: Chunk[] = [];
  const add = (c: Chunk) => chunks.push(c);

  add({
    id: "profile:summary",
    source: "Resume · Summary",
    title: `${profile.name}: ${profile.title}`,
    text: `${profile.name} is a ${profile.title} based in ${profile.location}. ${profile.summary} Availability: ${profile.availability}.`,
  });
  add({
    id: "profile:about",
    source: "Portfolio · About",
    title: "About Muskan (in her words)",
    text: profile.about.join(" "),
  });
  add({
    id: "profile:contact",
    source: "Resume · Contact",
    title: "Contact details and social profiles",
    text:
      `You can contact Muskan by email at ${profile.email} or by phone on ${profile.phone}. ` +
      socials
        .filter((s) => s.id !== "email" && s.id !== "phone")
        .map((s) => `${s.label}: ${s.href}`)
        .join(". ") +
      `. Her resume PDF can be downloaded from the portfolio at ${profile.resumeUrl}. ${profile.availability}.`,
  });

  for (const e of experience) {
    add({
      id: `exp:${e.company.toLowerCase()}`,
      source: "Resume · Experience",
      title: `${e.role} at ${e.company} (${e.period})`,
      text: `${e.role} at ${e.company}, ${e.location}, ${e.period}. ${e.summary} ${e.bullets.join(" ")} Skills used: ${e.stack.join(", ")}.`,
    });
  }

  for (const p of projects) {
    const links = [`GitHub repository: ${p.repo}`, ...(p.live ?? []).map((l) => `${l.label}: ${l.href}`)].join(". ");
    add({
      id: `project:${p.slug}`,
      source: "Resume · Projects",
      url: p.repo,
      title: `Project: ${p.name}`,
      text:
        `${p.name}: ${p.tagline} (${p.status}). ${p.problem} ` +
        (p.role ? `Muskan's role: ${p.role}. ` : "") +
        `Tech stack: ${p.stack.join(", ")}. ${links}.`,
    });
    add({
      id: `project:${p.slug}:details`,
      source: "Resume · Projects",
      url: p.repo,
      title: `${p.name}: highlights and architecture`,
      text: `Key work on ${p.name}: ${p.highlights.join(" ")} Architecture: ${p.architecture.join("; ")}.`,
    });
  }

  add({
    id: "skills:all",
    source: "Resume · Skills",
    title: "Technical skills",
    text: skills.map((g) => `${g.group}: ${g.items.join(", ")}`).join(". ") + ".",
  });
  add({
    id: "education",
    source: "Resume · Education",
    title: "Education",
    text: education.map((e) => `${e.degree}, ${e.school}, ${e.period}, ${e.score}`).join(". ") + ".",
  });
  add({
    id: "certifications",
    source: "Resume · Achievements",
    title: "Certifications and achievements",
    text: certifications.join(" "),
  });
  add({
    id: "site:how-built",
    source: "Portfolio · Engineering",
    title: "How this portfolio and assistant were built",
    text:
      "This portfolio is a Next.js (App Router) and TypeScript application deployed on Vercel. The assistant uses retrieval-augmented generation: " +
      "her resume and the READMEs of her GitHub repositories are chunked into a knowledge base; each question is matched with hybrid retrieval " +
      "(Gemini embeddings with cosine similarity plus BM25 keyword scoring, merged by reciprocal rank fusion); the top passages are passed to " +
      "Google Gemini, which streams an answer grounded only in those passages and cites its sources. The API route validates input and applies per-IP rate limiting, " +
      "and falls back to returning the retrieved passages directly if the model is unavailable. The GitHub section is fetched live and cached with incremental static regeneration.",
  });

  for (const c of github.chunks) add(c);
  return chunks;
}

export const knowledgeBase: Chunk[] = buildKnowledgeBase();
export const PINNED_CHUNK_ID = "profile:summary";
