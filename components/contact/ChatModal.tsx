"use client";

import { useEffect, useRef, useState } from "react";
import { X, SendHorizonal } from "lucide-react";

type Message = { role: "user" | "bot"; text: string };

export default function ChatModal({ close }: { close: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hello 👋 I’m your fragrance assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const text = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setSending(true);

    // Placeholder assistant response – replace with real backend later
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Thank you for reaching out. Our attars are long-lasting, skin-safe, and crafted in small batches. A human expert will also see this message on WhatsApp/email.",
          // non-obvious intent comment omitted
        },
      ]);
      setSending(false);
    }, 700);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 z-1000 flex items-end justify-center sm:items-center" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close chat"
        onClick={close}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
      />

      {/* Panel */}
      <div className="relative m-4 w-full max-w-sm sm:max-w-md rounded-3xl border border-white/20 bg-white/10 px-3 pb-3 pt-2 shadow-[0_18px_60px_rgba(15,23,42,0.55)] backdrop-blur-2xl sm:px-4 sm:pb-4 sm:pt-3">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-200/80">
              Chat Support
            </p>
            <p className="mt-1 text-sm font-medium text-white">Ask about attars, orders, or gifting</p>
          </div>
          <button
            type="button"
            onClick={close}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-neutral-200 hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={listRef}
          className="mb-2 max-h-[50vh] min-h-[220px] space-y-2 overflow-y-auto rounded-2xl bg-black/10 p-2 sm:p-3"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs sm:text-sm ${
                  msg.role === "user"
                    ? "bg-amber-400/90 text-black shadow-sm"
                    : "bg-white/12 text-neutral-100 backdrop-blur-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1 rounded-2xl bg-white/8 px-3 py-2 text-[10px] text-neutral-200/90">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300/90" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300/70 [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300/50 [animation-delay:240ms]" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-black/20 px-2 py-1.5 sm:px-3 sm:py-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about notes, longevity, gifting..."
            className="flex-1 bg-transparent text-xs text-neutral-50 placeholder:text-neutral-400 outline-none sm:text-sm"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={sending || !input.trim()}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-400/90 text-black shadow-sm transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-neutral-500/40"
            aria-label="Send message"
          >
            <SendHorizonal className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
