"use client";

import { useEffect, useRef, useState } from "react";
import { X, SendHorizonal } from "lucide-react";

type Message = { role: "user" | "bot"; text: string };

export default function ChatModal({ close }: { close: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hello. I’m your fragrance assistant. How can I guide you today?" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const text = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setSending(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Based on your preference, I can recommend attars aligned with your energy. Would you like suggestions by mood or astrology?",
        },
      ]);
      setSending(false);
    }, 600);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-start">
      {/* Backdrop */}
      <div onClick={close} className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />

      {/* Panel */}
      <div className="relative ml-4 mb-4 sm:mb-0 w-[92%] max-w-[380px] h-[480px] border border-black/10 bg-white/70 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.08)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
          <div>
            <p className="text-[11px] tracking-[0.18em] uppercase text-neutral-500">AI Assistant</p>
            <p className="text-sm font-medium text-black">Fragrance Guidance</p>
          </div>

          <button onClick={close} className="text-black/60 hover:text-black">
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-3 py-2 text-xs sm:text-sm ${
                  msg.role === "user" ? "bg-black text-white" : "bg-black/5 text-black"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="flex gap-1 px-2 py-1">
                <span className="w-1 h-1 bg-black animate-bounce" />
                <span className="w-1 h-1 bg-black/60 animate-bounce [animation-delay:120ms]" />
                <span className="w-1 h-1 bg-black/40 animate-bounce [animation-delay:240ms]" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex items-center border-t border-black/10 px-2 py-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about perfumes..."
            className="flex-1 bg-transparent text-sm outline-none text-black placeholder:text-neutral-400"
          />

          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="ml-2 flex items-center justify-center w-9 h-9 bg-black text-white hover:bg-neutral-800 disabled:bg-black/20"
          >
            <SendHorizonal size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
