"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { suggestedQuestions } from "@/data/profile";
import { renderMarkdown } from "@/lib/markdown";
import type { SourceRef } from "@/lib/rag/types";
import { OPEN_ASSISTANT_EVENT } from "./AskButton";
import { ArrowUpRightIcon, ChatIcon, CloseIcon, RefreshIcon, SendIcon, SparkIcon, StopIcon } from "./Icons";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  sources?: SourceRef[];
  error?: boolean;
};

let nextId = 1;

export function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;

  const send = useCallback(async (text: string) => {
    const question = text.trim();
    if (!question || abortRef.current) return;

    const history = messagesRef.current
      .filter((m) => !m.error && m.content)
      .map(({ role, content }) => ({ role, content }));
    const userMsg: Message = { id: nextId++, role: "user", content: question };
    const botId = nextId++;
    setMessages((prev) => [...prev, userMsg, { id: botId, role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;
    const update = (patch: Partial<Message>) =>
      setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, ...patch } : m)));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...history, { role: "user", content: question }] }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? `Request failed (${res.status})`);
      }
      let sources: SourceRef[] = [];
      try {
        sources = JSON.parse(decodeURIComponent(res.headers.get("X-Sources") ?? "%5B%5D"));
      } catch {}

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let content = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        content += decoder.decode(value, { stream: true });
        update({ content });
      }
      update({ content, sources });
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setMessages((prev) => prev.filter((m) => m.id !== botId || m.content));
      } else {
        update({ content: (err as Error).message || "Something went wrong. Please try again.", error: true });
      }
    } finally {
      abortRef.current = null;
      setStreaming(false);
    }
  }, []);

  // Open from anywhere on the page, optionally with a question.
  useEffect(() => {
    const handler = (e: Event) => {
      setOpen(true);
      const q = (e as CustomEvent<{ question?: string }>).detail?.question;
      if (q) send(q);
      else setTimeout(() => inputRef.current?.focus(), 50);
    };
    window.addEventListener(OPEN_ASSISTANT_EVENT, handler);
    return () => window.removeEventListener(OPEN_ASSISTANT_EVENT, handler);
  }, [send]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    inputRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [messages]);

  const stop = () => abortRef.current?.abort();
  const reset = () => {
    stop();
    setMessages([]);
    inputRef.current?.focus();
  };

  return (
    <>
      <button
        className="chat-launcher"
        data-hidden={open}
        onClick={() => setOpen(true)}
        aria-label="Open AI assistant"
        aria-hidden={open}
        tabIndex={open ? -1 : 0}
      >
        <ChatIcon /> Ask about Muskan
      </button>

      {open && (
        <section className="chat-panel" role="dialog" aria-label="AI assistant" aria-modal="false">
          <header className="chat-header">
            <div className="chat-avatar">
              <SparkIcon />
            </div>
            <div className="chat-title">
              <b>Muskan&apos;s AI assistant</b>
              <span>RAG · Gemini · grounded in resume + GitHub</span>
            </div>
            {messages.length > 0 && (
              <button className="icon-btn" onClick={reset} aria-label="Start a new conversation" title="New chat">
                <RefreshIcon />
              </button>
            )}
            <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close assistant">
              <CloseIcon />
            </button>
          </header>

          <div className="chat-body" ref={bodyRef} aria-live="polite">
            {messages.length === 0 && (
              <div className="chat-intro">
                <p>
                  Hi! I answer questions about <b>Muskan Mittal</b>: her projects, internships, skills and how to reach
                  her. Every answer is retrieved from her resume and GitHub, and I cite my sources.
                </p>
                <div className="chat-suggestions">
                  {suggestedQuestions.map((q) => (
                    <button key={q} className="chat-suggestion" onClick={() => send(q)}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="msg msg-user">
                  {m.content}
                </div>
              ) : m.error ? (
                <div key={m.id} className="msg msg-error" role="alert">
                  {m.content}
                </div>
              ) : (
                <div key={m.id} className="msg msg-bot">
                  {m.content ? (
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }} />
                  ) : (
                    <span className="typing" aria-label="Thinking">
                      <i />
                      <i />
                      <i />
                    </span>
                  )}
                  {m.sources && m.sources.length > 0 && (
                    <div className="msg-sources" aria-label="Sources">
                      {m.sources.map((s) =>
                        s.url ? (
                          <a key={s.title} href={s.url} target="_blank" rel="noopener noreferrer" title={s.title}>
                            {s.source} <ArrowUpRightIcon width={11} height={11} />
                          </a>
                        ) : (
                          <span key={s.title} title={s.title}>
                            {s.source}
                          </span>
                        ),
                      )}
                    </div>
                  )}
                </div>
              ),
            )}
          </div>

          <form
            className="chat-form"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <label htmlFor="chat-input" className="sr-only">
              Ask a question about Muskan
            </label>
            <textarea
              id="chat-input"
              ref={inputRef}
              rows={1}
              value={input}
              maxLength={1000}
              placeholder="Ask about her projects, skills, experience…"
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send(input);
                }
              }}
            />
            {streaming ? (
              <button type="button" className="chat-send" onClick={stop} aria-label="Stop generating">
                <StopIcon />
              </button>
            ) : (
              <button type="submit" className="chat-send" disabled={!input.trim()} aria-label="Send">
                <SendIcon />
              </button>
            )}
          </form>
          <p className="chat-foot">AI answers can be imperfect. Verify important details with Muskan directly.</p>
        </section>
      )}
    </>
  );
}
