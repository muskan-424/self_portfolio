export type Chunk = {
  id: string;
  /** Human-readable origin, e.g. "Resume · Experience" or "GitHub · MindCare-App". */
  source: string;
  title: string;
  text: string;
  url?: string;
};

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type SourceRef = { title: string; source: string; url?: string };
