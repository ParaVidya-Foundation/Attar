"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type FAQ = {
  question: string;
  answer: string;
};

const faqs: FAQ[] = [
  {
    question: "Is this incense truly chemical-free?",
    answer:
      "Yes. Our incense is made using natural resins, herbs and essential oils. No charcoal fillers, synthetic fragrance oils or harsh chemicals are used.",
  },
  {
    question: "Will the fragrance actually spread across the room?",
    answer:
      "Yes. The blend is designed to diffuse gently across the room creating a calming spiritual atmosphere without becoming overpowering.",
  },
  {
    question: "Is it suitable for meditation and daily pooja?",
    answer:
      "Absolutely. Our incense is designed specifically for meditation, yoga, temple rituals and daily pooja practices.",
  },
  {
    question: "How long does each stick burn?",
    answer: "Each incense stick burns for approximately 30–40 minutes with a steady, clean fragrance.",
  },
  {
    question: "What makes Anand Rasa incense better?",
    answer:
      "Unlike mass-produced incense, our sticks are handcrafted in small batches using traditional methods for a purer burn, longer fragrance and deeper spiritual aroma.",
  },
];

export default function FAQincense() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section className="w-full bg-white py-16">
      <div className="mx-auto max-w-3xl px-6">
        {/* Heading */}

        <header className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#1e2023] tracking-tight">
            Frequently Asked Questions
          </h2>

          <p className="text-sm text-neutral-500 mt-2">
            Everything you should know before choosing our incense
          </p>
        </header>

        {/* Accordion */}

        <div className="border-t border-neutral-200">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;

            return (
              <div key={i} className="border-b border-neutral-200 py-5">
                {/* Question */}

                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <span className="text-[15px] sm:text-[16px] font-medium text-[#1e2023] group-hover:text-black">
                    {faq.question}
                  </span>

                  <ChevronDown
                    className={`h-4 w-4 text-neutral-500 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Answer */}

                <div
                  className={`transition-all duration-300 ease-out ${
                    isOpen ? "max-h-40 opacity-100 mt-3" : "max-h-0 opacity-0 overflow-hidden"
                  }`}
                >
                  <p className="text-sm text-neutral-600 leading-relaxed pr-6">{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Conversion message */}

        <div className="text-center mt-10 text-sm text-neutral-600">
          Crafted for purity, calmness and authentic spiritual fragrance.
        </div>
      </div>
    </section>
  );
}
