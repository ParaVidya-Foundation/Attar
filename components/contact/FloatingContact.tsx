"use client";

import { useState } from "react";
import { MessageCircle, Bot } from "lucide-react";
import ChatModal from "./ChatModal";

export default function FloatingContact() {
  const [open, setOpen] = useState(false);

  const whatsappNumber = "919311336643";
  const whatsappMessage = encodeURIComponent("Hello, I’d love to know more about Anand Rasa attars.");

  return (
    <>
      <div className="fixed bottom-6 left-6 z-[999] flex flex-col gap-3">
        {/* WhatsApp */}
        <a
          href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
          target="_blank"
          rel="noreferrer"
          className="group relative flex items-center"
        >
          {/* Icon */}
          <div className="w-11 h-11 flex items-center justify-center border border-black/10 bg-white text-black transition-all duration-300 hover:bg-black hover:text-white">
            <MessageCircle size={18} />
          </div>

          {/* Tooltip */}
          <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out">
            <div className="relative flex items-center">
              {/* Arrow */}
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-white border-l border-b border-black/10 rotate-45"></div>

              {/* Label */}
              <div className="ml-2 px-3 py-1.5 text-xs bg-white border border-black/10 text-black shadow-sm whitespace-nowrap">
                WhatsApp
              </div>
            </div>
          </div>
        </a>

        {/* AI Button */}
        <button onClick={() => setOpen(true)} className="group relative flex items-center">
          {/* Icon */}
          <div className="w-11 h-11 flex items-center justify-center border border-black/10 bg-white text-black transition-all duration-300 hover:bg-black hover:text-white">
            <Bot size={18} />
          </div>

          {/* Tooltip */}
          <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out">
            <div className="relative flex items-center">
              {/* Arrow */}
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-white border-l border-b border-black/10 rotate-45"></div>

              {/* Label */}
              <div className="ml-2 px-3 py-1.5 text-xs bg-white border border-black/10 text-black shadow-sm whitespace-nowrap">
                AI Assistant
              </div>
            </div>
          </div>
        </button>
      </div>

      {open && <ChatModal close={() => setOpen(false)} />}
    </>
  );
}
