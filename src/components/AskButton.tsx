"use client";

import type { ReactNode } from "react";

export const OPEN_ASSISTANT_EVENT = "assistant:open";

export function openAssistant(question?: string) {
  window.dispatchEvent(new CustomEvent(OPEN_ASSISTANT_EVENT, { detail: { question } }));
}

/** Any button on the page can open the assistant, optionally with a question pre-sent. */
export function AskButton({
  children,
  question,
  className = "btn btn-accent",
}: {
  children: ReactNode;
  question?: string;
  className?: string;
}) {
  return (
    <button type="button" className={className} onClick={() => openAssistant(question)}>
      {children}
    </button>
  );
}
