import { geminiConfig, hasGeminiKey } from "@/lib/rag/gemini";
import { knowledgeBase } from "@/lib/rag/knowledge";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    status: "ok",
    assistant: {
      generative: hasGeminiKey(),
      model: geminiConfig.model,
      embedModel: geminiConfig.embedModel,
      knowledgeChunks: knowledgeBase.length,
    },
  });
}
