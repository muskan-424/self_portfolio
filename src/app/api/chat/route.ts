import { NextRequest } from "next/server";
import { hasGeminiKey, streamGenerate } from "@/lib/rag/gemini";
import { extractiveAnswer, formatContext, SYSTEM_PROMPT } from "@/lib/rag/prompt";
import { retrieve } from "@/lib/rag/retriever";
import type { ChatMessage, SourceRef } from "@/lib/rag/types";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_MESSAGES = 12;
const MAX_CHARS = 1000;

function badRequest(message: string, status = 400, headers: Record<string, string> = {}) {
  return Response.json({ error: message }, { status, headers });
}

function parseMessages(body: unknown): ChatMessage[] | null {
  if (!body || typeof body !== "object" || !Array.isArray((body as { messages?: unknown }).messages)) return null;
  const raw = (body as { messages: unknown[] }).messages.slice(-MAX_MESSAGES);
  const messages: ChatMessage[] = [];
  for (const m of raw) {
    if (!m || typeof m !== "object") return null;
    const { role, content } = m as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    messages.push({ role, content: content.slice(0, MAX_CHARS * 2) });
  }
  return messages.length && messages[messages.length - 1].role === "user" ? messages : null;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limit = rateLimit(ip);
  if (!limit.ok) {
    return badRequest("You're sending messages quickly. Please wait a moment and try again.", 429, {
      "Retry-After": String(limit.retryAfter),
    });
  }

  const messages = parseMessages(await req.json().catch(() => null));
  if (!messages) return badRequest("Expected { messages: [{ role, content }] } ending with a user message.");
  const question = messages[messages.length - 1].content.trim();
  if (!question) return badRequest("Please type a question.");
  if (question.length > MAX_CHARS) return badRequest(`Please keep questions under ${MAX_CHARS} characters.`);

  // Follow-ups like "what stack did it use?" need the previous question to retrieve the right project.
  const previousUser = messages.slice(0, -1).reverse().find((m) => m.role === "user")?.content ?? "";
  const { chunks, mode } = await retrieve(`${question}\n${previousUser.slice(0, 300)}`);

  const sources: SourceRef[] = [];
  const seen = new Set<string>();
  for (const c of chunks.slice(1, 5)) {
    const key = c.url ?? c.title;
    if (seen.has(key)) continue;
    seen.add(key);
    sources.push({ title: c.title, source: c.source, url: c.url });
  }

  // History gives the model conversational continuity; context is attached only to the latest turn.
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: m.content }],
  }));
  const contents = [
    ...history,
    { role: "user" as const, parts: [{ text: `CONTEXT:\n${formatContext(chunks)}\n\nQUESTION: ${question}` }] },
  ];

  const encoder = new TextEncoder();
  const generative = hasGeminiKey();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let emitted = false;
      try {
        if (!generative) throw new Error("GEMINI_API_KEY not configured");
        for await (const token of streamGenerate(SYSTEM_PROMPT, contents, req.signal)) {
          emitted = true;
          controller.enqueue(encoder.encode(token));
        }
        if (!emitted) throw new Error("Empty completion");
      } catch (err) {
        if (req.signal.aborted) return controller.close();
        if (generative) console.error("[chat] generation failed:", err);
        controller.enqueue(
          encoder.encode(emitted ? "\n\n_The response was interrupted. Please try again._" : extractiveAnswer(chunks)),
        );
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Retrieval-Mode": mode,
      "X-Answer-Mode": generative ? "generative" : "extractive",
      "X-Sources": encodeURIComponent(JSON.stringify(sources)),
    },
  });
}
