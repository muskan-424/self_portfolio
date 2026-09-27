import { test } from "node:test";
import assert from "node:assert/strict";
import { BM25, rankBy, reciprocalRankFusion, tokenize } from "../src/lib/rag/bm25.ts";
import { renderMarkdown } from "../src/lib/markdown.ts";

test("tokenize drops stopwords and stems plurals", () => {
  assert.deepEqual(tokenize("What APIs does she know?"), ["api", "know"]);
  assert.ok(tokenize("Redis caching").includes("cach"));
});

test("BM25 ranks the most relevant document first", () => {
  const index = new BM25([
    "Zomato-style food delivery app with Cloudinary media and JWT",
    "MindCare mental health platform with Redis caching and a RAG layer",
    "Peer review allocation engine with Jest constraint tests",
  ]);
  assert.equal(rankBy(index.score("which project uses RAG and Redis?"))[0], 1);
  assert.equal(rankBy(index.score("jest tests"))[0], 2);
  assert.deepEqual(rankBy(index.score("kubernetes")), []);
});

test("reciprocal rank fusion rewards documents ranked well by both retrievers", () => {
  const fused = reciprocalRankFusion([
    [2, 0, 1],
    [0, 2, 1],
  ]);
  const order = [...fused.entries()].sort((a, b) => b[1] - a[1]).map(([i]) => i);
  assert.equal(order[2], 1);
});

test("markdown renderer escapes HTML and only allows safe links", () => {
  const html = renderMarkdown('<img src=x onerror=alert(1)> **bold** [ok](https://github.com) [bad](javascript:alert(1))');
  assert.ok(!html.includes("<img"));
  assert.ok(html.includes("<strong>bold</strong>"));
  assert.ok(html.includes('href="https://github.com"'));
  assert.ok(!html.includes('href="javascript'));
});

test("markdown renderer builds lists", () => {
  assert.equal(renderMarkdown("Skills:\n- React\n- Node"), "<p>Skills:</p><ul><li>React</li><li>Node</li></ul>");
});
