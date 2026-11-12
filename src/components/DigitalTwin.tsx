"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

type Message = { role: "user" | "assistant"; content: string };

export const OPEN_TWIN_EVENT = "open-digital-twin";

const suggestions = [
  "What's your cloud and AWS experience?",
  "Tell me about your payments work.",
  "What kind of role are you looking for?",
];

function renderInline(text: string) {
  return text.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={i} className="text-ink">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part.replace(/^- /gm, "• ");
  });
}

export function DigitalTwin() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_TWIN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_TWIN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || loading) return;

      const history: Message[] = [...messages, { role: "user", content }];
      setMessages([...history, { role: "assistant", content: "" }]);
      setInput("");
      setError(null);
      setLoading(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error ?? "Something went wrong.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let reply = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          reply += decoder.decode(value, { stream: true });
          setMessages([...history, { role: "assistant", content: reply }]);
        }

        if (!reply.trim()) throw new Error("No response received. Please try again.");
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setMessages(history);
        setError((err as Error).message);
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [loading, messages],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const reset = () => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setLoading(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close digital twin chat" : "Open digital twin chat"}
        className={`fixed bottom-5 right-5 z-[60] flex items-center gap-3 border border-white/15 bg-ink px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-12px_rgba(8,10,14,0.6)] transition hover:border-signal md:bottom-8 md:right-8 ${
          open ? "max-sm:hidden" : ""
        }`}
      >
        <span className="live-dot inline-block h-2 w-2 rounded-full bg-signal" />
        {open ? "Close" : "Ask my Digital Twin"}
      </button>

      {open && (
        <section
          role="dialog"
          aria-label="Digital Twin chat"
          className="animate-rise fixed inset-x-0 bottom-0 z-[70] flex h-[85svh] flex-col border border-line-strong bg-bg-elevated shadow-[0_30px_80px_-20px_rgba(8,10,14,0.55)] sm:inset-x-auto sm:bottom-24 sm:right-5 sm:h-[600px] sm:max-h-[calc(100svh-8rem)] sm:w-[400px] md:bottom-28 md:right-8"
        >
          <header className="flex items-center justify-between bg-ink px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center border border-signal/60 font-display text-sm font-bold text-signal">
                RN
              </div>
              <div>
                <p className="font-display text-sm font-bold tracking-wide">
                  Digital Twin
                </p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
                  Ask about Rohit&apos;s career
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={reset}
                  className="px-2 py-1 text-xs font-medium text-white/60 transition hover:text-white"
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="px-2 py-1 text-lg leading-none text-white/60 transition hover:text-white"
              >
                ×
              </button>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {messages.length === 0 && (
              <div>
                <p className="text-sm leading-relaxed text-ink-muted">
                  Hi — I&apos;m Rohit&apos;s digital twin. I can answer questions
                  about my experience in cloud infrastructure, payments, and
                  backend engineering.
                </p>
                <div className="mt-5 flex flex-col gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="border border-line-strong bg-bg px-3.5 py-2.5 text-left text-sm text-ink transition hover:border-signal hover:text-signal-deep"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <p className="max-w-[85%] whitespace-pre-wrap bg-ink px-4 py-2.5 text-sm leading-relaxed text-white">
                    {m.content}
                  </p>
                </div>
              ) : (
                <div key={i} className="flex">
                  <div className="max-w-[90%] whitespace-pre-wrap border-l-2 border-signal pl-3.5 text-sm leading-relaxed text-ink-muted">
                    {m.content ? (
                      renderInline(m.content)
                    ) : (
                      <span className="inline-flex gap-1 py-1" aria-label="Thinking">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal [animation-delay:300ms]" />
                      </span>
                    )}
                  </div>
                </div>
              ),
            )}

            {error && (
              <p className="border border-ember/40 bg-ember/5 px-3.5 py-2.5 text-sm text-ember">
                {error}
              </p>
            )}
          </div>

          <form onSubmit={onSubmit} className="flex items-end gap-2 border-t border-line p-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              maxLength={2000}
              placeholder="Ask about experience, skills, roles…"
              className="max-h-32 min-h-[44px] flex-1 resize-none border border-line-strong bg-bg px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-signal"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-[44px] bg-ink px-4 text-sm font-semibold text-white transition hover:bg-signal-deep disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </form>
        </section>
      )}
    </>
  );
}
