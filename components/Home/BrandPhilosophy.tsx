"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/* ─── Data ─────────────────────────────────────────────── */
interface CardItem {
  title: string;
  text: ReactNode;
}

const items: CardItem[] = [
  {
    title: "We Don’t Sell Fragrance.\nWe Deliver Experience.",
    text: (
      <>
        A perfume can smell good and still mean nothing. Every note in our <strong>Anand Rasa attars</strong>{" "}
        is crafted for <strong>depth, emotion & lasting presence</strong>.
      </>
    ),
  },
  {
    title: "Craft Before Claims",
    text: (
      <>
        We don’t follow trends. Every blend is built with{" "}
        <strong>traditional methods, real ingredients</strong> & <strong>proven longevity</strong>. No hype.
        Only performance.
      </>
    ),
  },
  {
    title: "Luxury Is Not Packaging",
    text: (
      <>
        Bottles attract. Fragrance stays. What matters is <strong>how long it lasts</strong>, how it evolves,
        and how it makes you <strong>feel</strong>. That’s where true luxury lives.
      </>
    ),
  },
  {
    title: "One Standard. Always.",
    text: (
      <>
        If we say it’s long-lasting, it performs. If we say it’s premium, you feel it.{" "}
        <strong>No compromise. No shortcuts.</strong> That’s the Anand Rasa promise.
      </>
    ),
  },
];

/* ─── Card ──────────────────────────────────────────────── */
interface PhilosophyCardProps extends CardItem {
  index: number;
  visible: boolean;
}

function PhilosophyCard({ title, text, index, visible }: PhilosophyCardProps) {
  return (
    <div
      className="bp-card-root"
      style={{
        transitionDelay: `${index * 115 + 80}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
      }}
    >
      {/* Pink offset shadow */}
      <div className="bp-shadow" aria-hidden="true" />

      {/* Card surface */}
      <article className="bp-card">
        {/* Pill */}
        <span className="bp-pill">{title}</span>

        {/* Body */}
        <p className="bp-body">{text}</p>
      </article>
    </div>
  );
}

/* ─── Section ───────────────────────────────────────────── */
export default function BrandPhilosophy() {
  const [visible, setVisible] = useState<boolean>(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* ── Styles ───────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700&display=swap');
 
        /* Reset scope */
        .bp-section,
        .bp-section * {
          font-family: 'Poppins', sans-serif;
          box-sizing: border-box;
        }
 
        /* ── Heading ── */
        .bp-heading {
          transition:
            opacity 0.6s ease,
            transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
 
        /* ── Card root ── */
        .bp-card-root {
          position: relative;
          transition:
            opacity 0.65s ease,
            transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
          /* natural height — no fixed min-height */
        }
 
        /* ── Pink shadow ── */
        .bp-shadow {
          position: absolute;
          inset: 0;
          border-radius: 22px;
          background: #e8a0bd;
          transform: translate(7px, 8px);
          transition: transform 0.38s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
          z-index: 0;
        }
 
        .bp-card-root:hover .bp-shadow {
          transform: translate(10px, 11px);
        }
 
        /* ── Card surface ── */
        .bp-card {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: #ffffff;
          border: 1.5px solid #252525;
          border-radius: 22px;
          padding: 22px 22px 26px;
          transition: transform 0.38s cubic-bezier(0.22, 1, 0.36, 1);
        }
 
        .bp-card-root:hover .bp-card {
          transform: translateY(-4px);
        }
 
        /* ── Pill / Tag ── */
        .bp-pill {
          display: inline-block;
          background: #e8a0bd;
          border: 1.5px solid #252525;
          border-radius: 999px;
          padding: 7px 16px;
          font-size: 12.5px;
          font-weight: 600;
          line-height: 1.4;
          color: #141414;
          white-space: pre-line;
          text-align: center;
          /* pill always stays within card width */
          max-width: 100%;
          word-break: break-word;
        }
 
        /* ── Body ── */
        .bp-body {
          margin: 0;
          font-size: 14.5px;
          font-weight: 400;
          line-height: 1.78;
          letter-spacing: 0.006em;
          color: #3c3c3c;
        }
 
        .bp-body strong {
          font-weight: 600;
          color: #141414;
        }
      `}</style>

      {/* ── Markup ───────────────────────────────────────── */}
      <section ref={sectionRef} className="bp-section w-full py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1300px] px-5 sm:px-8 lg:px-10">
          {/* Heading */}
          <h1
            className="bp-heading mx-auto mb-12 max-w-[28ch] text-center text-[50px] sm:text-[54px] lg:text-[64px] leading-[1.15] tracking-[-0.025em] text-[#141414]"
            style={{
              fontWeight: 700,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
            }}
          >
            We believe in Truth, Results &amp; No&nbsp;BS
          </h1>

          {/* Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, i) => (
              <PhilosophyCard key={i} index={i} visible={visible} title={item.title} text={item.text} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
