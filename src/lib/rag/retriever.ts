import { BM25, rankBy, reciprocalRankFusion } from "./bm25";
import { embedMany, embedQuery, hasGeminiKey } from "./gemini";
import { knowledgeBase, PINNED_CHUNK_ID } from "./knowledge";
import type { Chunk } from "./types";

const bm25 = new BM25(knowledgeBase.map((c) => `${c.title}\n${c.title}\n${c.text}`));

/**
 * Document vectors are computed once per server instance and memoised. A failed attempt
 * is retried at most once a minute so a bad key or quota error doesn't hammer the API.
 */
let docVectors: Promise<number[][]> | null = null;
let lastFailure = 0;

function getDocVectors(): Promise<number[][]> | null {
  if (!hasGeminiKey()) return null;
  if (!docVectors && Date.now() - lastFailure > 60_000) {
    docVectors = embedMany(
      knowledgeBase.map((c) => `${c.title}\n${c.text}`),
      "RETRIEVAL_DOCUMENT",
    ).catch((err) => {
      console.error("[rag] document embedding failed:", err);
      docVectors = null;
      lastFailure = Date.now();
      throw err;
    });
  }
  return docVectors;
}

export type Retrieval = { chunks: Chunk[]; mode: "hybrid" | "lexical" };

/**
 * Hybrid retrieval: dense (Gemini embeddings, cosine) + sparse (BM25), merged with
 * reciprocal rank fusion. Degrades to BM25-only if embeddings are unavailable.
 * The profile summary is always included so broad questions ("tell me about her") have context.
 */
export async function retrieve(query: string, k = 6): Promise<Retrieval> {
  const lexical = rankBy(bm25.score(query)).slice(0, 20);
  let dense: number[] | null = null;

  const vectorsPromise = getDocVectors();
  if (vectorsPromise) {
    try {
      const [vectors, q] = await Promise.all([vectorsPromise, embedQuery(query)]);
      const cos = vectors.map((v) => v.reduce((s, x, i) => s + x * q[i], 0));
      dense = rankBy(cos, 0.25).slice(0, 20);
    } catch (err) {
      console.error("[rag] dense retrieval failed, using BM25 only:", err);
    }
  }

  const fused = reciprocalRankFusion(dense ? [dense, lexical] : [lexical]);
  const top = [...fused.entries()].sort((a, b) => b[1] - a[1]).map(([i]) => knowledgeBase[i]);

  const pinned = knowledgeBase.find((c) => c.id === PINNED_CHUNK_ID)!;
  const chunks = [pinned, ...top.filter((c) => c.id !== PINNED_CHUNK_ID)].slice(0, k + 1);
  return { chunks, mode: dense ? "hybrid" : "lexical" };
}
