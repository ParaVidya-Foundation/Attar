"use client";

import { useState } from "react";
import { MessageCircle, Bot } from "lucide-react";
import ChatModal from "./ChatModal";

export default function FloatingContact() {
  const [open, setOpen] = useState(false);

  const whatsappNumber = "919311336643";
  const whatsappMessage = encodeURIComponent(
    "Hello, I’d love to know more about Anand Rasa attars and recommendations for me.",
  );

  return (
    <>
      {/* Floating Buttons */}
      <div className="fixed bottom-5 right-4 z-999 flex flex-col items-end gap-3 sm:bottom-8 sm:right-6">
        {/* WhatsApp */}
        <a
          href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-2 text-xs text-white shadow-[0_12px_40px_rgba(15,23,42,0.55)] backdrop-blur-xl transition hover:bg-emerald-400/90 hover:text-black sm:px-4 sm:text-sm"
        >
          <span className="hidden font-medium sm:inline">Chat on WhatsApp</span>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/90 text-black shadow-sm group-hover:bg-black group-hover:text-emerald-300">
            <MessageCircle size={18} />
          </span>
        </a>

        {/* AI Chat */}
        <button
          onClick={() => setOpen(true)}
          type="button"
          className="group flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3 py-2 text-xs text-white shadow-[0_12px_40px_rgba(15,23,42,0.55)] backdrop-blur-xl transition hover:bg-white/20 sm:px-4 sm:text-sm"
          aria-label="Open AI fragrance assistant"
        >
          <span className="hidden font-medium sm:inline">Ask AI about attars</span>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/90 text-amber-300 shadow-sm group-hover:bg-amber-400 group-hover:text-black">
            <Bot size={18} />
          </span>
        </button>
      </div>

      {/* Chatbot Modal */}
      {open && <ChatModal close={() => setOpen(false)} />}
    </>
  );
}
