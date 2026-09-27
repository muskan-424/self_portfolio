#!/usr/bin/env node
/**
 * Ingestion step of the RAG pipeline.
 *
 * Pulls the README of each of Muskan's public repositories, keeps the sections that
 * describe *what was built* (features, architecture, stack), drops setup / runbook noise
 * and code blocks, and writes heading-aware chunks to src/data/github-knowledge.json.
 *
 * The output is committed, so deployments never depend on GitHub being reachable at
 * build time. Re-run with `npm run ingest` whenever a README changes.
 */
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const USER = "muskan-424";
const REPOS = ["MindCare-App", "air-tasker", "food-delivery-app", "peer-review-allocation-system", "diabetes-prediction"];

// Sections that describe how to run/operate a repo rather than what it is.
const SKIP_HEADINGS =
  /(quick ?start|setup|install|run locally|run the|running|prerequisite|troubleshoot|feedback|contribut|backup|restore|runbook|checklist|escalation|overlay|release|signing|environment|env var|scripts|deploy|option [abc]|screenshots|documentation|how the frontend|docker quickstart|monitoring|migration|improvement plan|tests? & ci|verification|clone|\(local\)|demo|^or$)/i;

const MAX_CHARS = 1100;
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "github-knowledge.json");

const headers = { Accept: "application/vnd.github.raw", "User-Agent": "muskan-portfolio-ingest" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

function clean(md) {
  return md
    .replace(/```[\s\S]*?```/g, "") // code blocks
    .replace(/!\[[^\]]*]\([^)]*\)/g, "") // images
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1") // links -> text
    .replace(/<[^>]+>/g, "")
    .replace(/[│├└─►▼]+/g, " ")
    .replace(/[*_`#>]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitSections(md) {
  const sections = [];
  let current = { heading: "Overview", body: [] };
  for (const line of md.split(/\r?\n/)) {
    const m = /^(#{1,3})\s+(.*)$/.exec(line);
    if (m) {
      sections.push(current);
      current = { heading: m[2].replace(/[^\p{L}\p{N}\s&()/+.-]/gu, "").trim(), body: [] };
    } else current.body.push(line);
  }
  sections.push(current);
  return sections;
}

function toChunks(text) {
  if (text.length <= MAX_CHARS) return [text];
  const out = [];
  let buf = "";
  for (const para of text.split(/\n(?=\s*[-•\d])|\n\n/)) {
    if ((buf + "\n" + para).length > MAX_CHARS && buf) {
      out.push(buf.trim());
      buf = "";
    }
    buf += "\n" + para;
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

const chunks = [];
for (const repo of REPOS) {
  const res = await fetch(`https://api.github.com/repos/${USER}/${repo}/readme`, { headers });
  if (!res.ok) {
    console.warn(`skip ${repo}: README ${res.status}`);
    continue;
  }
  const md = (await res.text()).replace(/```[\s\S]*?```/g, "");
  const url = `https://github.com/${USER}/${repo}`;
  for (const { heading, body } of splitSections(md)) {
    if (SKIP_HEADINGS.test(heading)) continue;
    const text = clean(body.join("\n"));
    if (text.length < 80) continue;
    toChunks(text).forEach((t, i) =>
      chunks.push({
        id: `gh:${repo}:${heading.toLowerCase().replace(/\W+/g, "-")}:${i}`,
        source: `GitHub · ${repo}`,
        url,
        title: `${repo}: ${heading}`,
        text: t,
      }),
    );
  }
  console.log(`${repo}: ok`);
}

await writeFile(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), chunks }, null, 2) + "\n");
console.log(`wrote ${chunks.length} chunks -> ${path.relative(process.cwd(), OUT)}`);
