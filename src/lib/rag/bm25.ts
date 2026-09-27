/**
 * Minimal Okapi BM25 index. Used as the lexical half of hybrid retrieval and as the
 * sole retriever when embeddings are unavailable (no API key, quota, cold failure).
 * Deliberately dependency-free so it can be unit tested with `node --test`.
 */

const STOPWORDS = new Set(
  "a an and are as at be by did do does for from has have her hers how i in is it its me muskan mittal of on or she so tell than that the their them there this to was what when where which who why will with you your about can could would".split(
    " ",
  ),
);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/[\s-]+/)
    .map((t) => t.replace(/^\.+|\.+$/g, ""))
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map(stem);
}

/** Tiny suffix stripper: enough to match "caching"/"cache", "apis"/"api", "tests"/"test". */
function stem(t: string): string {
  if (t.length > 5 && t.endsWith("ing")) return t.slice(0, -3);
  if (t.length > 4 && t.endsWith("ies")) return t.slice(0, -3) + "y";
  if (t.length > 3 && t.endsWith("s") && !t.endsWith("ss")) return t.slice(0, -1);
  return t;
}

export class BM25 {
  private readonly docs: Map<string, number>[];
  private readonly lengths: number[];
  private readonly df = new Map<string, number>();
  private readonly avgLen: number;
  private readonly k1: number;
  private readonly b: number;

  constructor(texts: string[], k1 = 1.4, b = 0.7) {
    this.k1 = k1;
    this.b = b;
    this.docs = texts.map((t) => {
      const tf = new Map<string, number>();
      for (const tok of tokenize(t)) tf.set(tok, (tf.get(tok) ?? 0) + 1);
      return tf;
    });
    this.lengths = this.docs.map((d) => [...d.values()].reduce((a, v) => a + v, 0));
    this.avgLen = this.lengths.reduce((a, v) => a + v, 0) / Math.max(1, this.lengths.length);
    for (const d of this.docs) for (const term of d.keys()) this.df.set(term, (this.df.get(term) ?? 0) + 1);
  }

  /** Returns one score per document, in input order. */
  score(query: string): number[] {
    const terms = [...new Set(tokenize(query))];
    const N = this.docs.length;
    return this.docs.map((tf, i) => {
      let s = 0;
      for (const term of terms) {
        const f = tf.get(term);
        if (!f) continue;
        const n = this.df.get(term) ?? 0;
        const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
        s += (idf * f * (this.k1 + 1)) / (f + this.k1 * (1 - this.b + (this.b * this.lengths[i]) / this.avgLen));
      }
      return s;
    });
  }
}

/** Reciprocal Rank Fusion: merges several rankings without needing comparable scores. */
export function reciprocalRankFusion(rankings: number[][], k = 60): Map<number, number> {
  const fused = new Map<number, number>();
  for (const ranking of rankings) {
    ranking.forEach((docIndex, rank) => fused.set(docIndex, (fused.get(docIndex) ?? 0) + 1 / (k + rank + 1)));
  }
  return fused;
}

export function rankBy(scores: number[], minScore = 0): number[] {
  return scores
    .map((s, i) => [s, i] as const)
    .filter(([s]) => s > minScore)
    .sort((a, b) => b[0] - a[0])
    .map(([, i]) => i);
}
