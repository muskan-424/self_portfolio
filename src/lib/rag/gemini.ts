/**
 * Thin client for the Gemini REST API (v1beta). Plain fetch keeps the serverless bundle
 * small and makes every request/response shape explicit.
 */

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const EMBED_DIMS = 768;

export const geminiConfig = {
  apiKey: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? "",
  model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  embedModel: process.env.GEMINI_EMBED_MODEL || "gemini-embedding-001",
};

export const hasGeminiKey = () => geminiConfig.apiKey.length > 0;

async function post(url: string, body: unknown, signal?: AbortSignal): Promise<Response> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": geminiConfig.apiKey },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 300);
    throw new Error(`Gemini ${res.status}: ${detail}`);
  }
  return res;
}

function normalize(v: number[]): number[] {
  const norm = Math.hypot(...v) || 1;
  return v.map((x) => x / norm);
}

type TaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

/** Embeds up to 100 texts per request; returns unit-length vectors so dot product = cosine. */
export async function embedMany(texts: string[], taskType: TaskType): Promise<number[][]> {
  const model = `models/${geminiConfig.embedModel}`;
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += 100) {
    const batch = texts.slice(i, i + 100);
    const res = await post(`${BASE}/${geminiConfig.embedModel}:batchEmbedContents`, {
      requests: batch.map((text) => ({
        model,
        content: { parts: [{ text }] },
        taskType,
        outputDimensionality: EMBED_DIMS,
      })),
    });
    const json = (await res.json()) as { embeddings: { values: number[] }[] };
    out.push(...json.embeddings.map((e) => normalize(e.values)));
  }
  return out;
}

export async function embedQuery(text: string): Promise<number[]> {
  const [v] = await embedMany([text], "RETRIEVAL_QUERY");
  return v;
}

type GeminiContent = { role: "user" | "model"; parts: { text: string }[] };

/** Streams generated text using server-sent events (`alt=sse`). */
export async function* streamGenerate(
  systemInstruction: string,
  contents: GeminiContent[],
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const { model } = geminiConfig;
  const generationConfig: Record<string, unknown> = { temperature: 0.3, topP: 0.9, maxOutputTokens: 1024 };
  // Flash models answer faster without a thinking budget; this task is retrieval-bound, not reasoning-bound.
  if (model.startsWith("gemini-2.5-flash")) generationConfig.thinkingConfig = { thinkingBudget: 0 };

  const res = await post(
    `${BASE}/${model}:streamGenerateContent?alt=sse`,
    {
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents,
      generationConfig,
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      ],
    },
    signal,
  );
  if (!res.body) throw new Error("Gemini returned an empty body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let sep: number;
    while ((sep = buffer.search(/\r?\n\r?\n/)) !== -1) {
      const event = buffer.slice(0, sep);
      buffer = buffer.slice(sep).replace(/^\r?\n\r?\n/, "");
      for (const line of event.split(/\r?\n/)) {
        if (!line.startsWith("data:")) continue;
        const payload = JSON.parse(line.slice(5).trim()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };
        const text = payload.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
        if (text) yield text;
      }
    }
  }
}
