"use client";

import Image from "next/image";
import { useRef, useState, useCallback, useId } from "react";

/* ─── Types ─────────────────────────────────────────────── */
interface Variant {
  label: string;
  discount: number;
  originalPrice: number;
  salePrice: number;
}

interface Product {
  id: number;
  badge?: "New" | "Bestseller" | "Sale" | "Limited";
  image: string;
  formula: string;
  name: string;
  tagline: string;
}

/* ─── Data — swap with your API ─────────────────────────── */
const PRODUCTS: Product[] = [
  {
    id: 1,
    badge: "Bestseller",
    image: "/incense_holder.webp",
    formula: "Pure Sandalwood + Havan Samagri",
    name: "Chandan Agarbatti",
    tagline: "Sacred Calm, Every Breath",
  },
  {
    id: 2,
    badge: "New",
    image: "/incense_holder.webp",
    formula: "Rose + Mogra + Pure Attar",
    name: "Gulab Agarbatti",
    tagline: "Blooms That Never Fade",
  },
  {
    id: 3,
    badge: "Limited",
    image: "/incense_holder.webp",
    formula: "Loban + Gugal + Cow Ghee",
    name: "Loban Agarbatti",
    tagline: "Ancient Purification Ritual",
  },
  {
    id: 4,
    badge: "Sale",
    image: "/incense_holder.webp",
    formula: "Lavender + Chamomile + Tulsi",
    name: "Lavender Agarbatti",
    tagline: "Sleep Like You Deserve",
  },
  {
    id: 5,
    badge: "Bestseller",
    image: "/incense_holder.webp",
    formula: "Kesar + Chandan + Amber",
    name: "Kesar Agarbatti",
    tagline: "Royalty in Every Wisp",
  },
  {
    id: 6,
    badge: "Limited",
    image: "/incense_holder.webp",
    formula: "Oud Wood + Musk + Vetiver",
    name: "Oud Agarbatti",
    tagline: "The Scent of the Ancients",
  },
];

/* ─── Helpers ───────────────────────────────────────────── */
const VISIBLE_DESKTOP = 4;

function formatINR(n: number) {
  return n.toLocaleString("en-IN");
}

/* ─── Product Card ──────────────────────────────────────── */
function ProductCard({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const selectId = useId();

  return (
    <article className="pc-card" aria-label={product.name}>
      {/* Image */}
      <div className="pc-img-wrap">
        {product.badge && (
          <span className="pc-badge" aria-label={`Badge: ${product.badge}`}>
            {product.badge}
          </span>
        )}
        <div className="pc-img-inner">
          <Image
            src={product.image}
            alt={`${product.name} — ${product.formula}`}
            fill
            sizes="(max-width: 580px) 85vw, (max-width: 1024px) 45vw, 25vw"
            style={{ objectFit: "contain", objectPosition: "center 85%" }}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>

      {/* Info */}
      <div className="pc-info">
        <p className="pc-formula">{product.formula}</p>
        <h3 className="pc-name">{product.name}</h3>
        <p className="pc-tagline">{product.tagline}</p>

        <div className="pc-price-row">
          <span className="pc-orig" aria-label={`Original price Rs. ${formatINR(199)}`}>
            Rs. {formatINR(199)}
          </span>
          <span className="pc-sale" aria-label={`Sale price Rs. ${formatINR(159)}`}>
            Rs. {formatINR(159)}
          </span>
        </div>

        <button
          className="pc-atc"
          type="button"
          onClick={() => {
            /* wire your cart handler here */
          }}
          aria-label={`Add ${product.name} Pack of 20 (20% OFF) to cart`}
        >
          Buy Now
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </button>
      </div>
    </article>
  );
}

/* ─── Arrow Button ──────────────────────────────────────── */
function ArrowBtn({
  dir,
  disabled,
  onClick,
}: {
  dir: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`pc-arrow pc-arrow-${dir}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "left" ? "Previous products" : "Next products"}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {dir === "left" ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
      </svg>
    </button>
  );
}

/* ─── Carousel ──────────────────────────────────────────── */
export default function BestSellerIncense() {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const total = PRODUCTS.length;
  const maxIndex = Math.max(0, total - VISIBLE_DESKTOP);

  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);
  const next = useCallback(() => setIndex((i) => Math.min(i + 1, maxIndex)), [maxIndex]);
  const goTo = useCallback((i: number) => setIndex(i), []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        /* ── Scope ── */
        .pc-root,
        .pc-root * {
          font-family: 'Poppins', sans-serif;
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .sr-only {
          position: absolute;
          width: 1px; height: 1px;
          padding: 0; margin: -1px;
          overflow: hidden;
          clip: rect(0,0,0,0);
          white-space: nowrap;
          border: 0;
        }

        /* ── Root ── */
        .pc-root {
          width: 100%;
          padding: 0 48px;
          position: relative;
          margin-top: 20px;
        }

        @media (max-width: 768px) { .pc-root { padding: 0 20px; } }
        @media (max-width: 480px) { .pc-root { padding: 0 12px; } }

        /* ── Carousel ── */
        .pc-carousel {
          overflow: hidden;
       margin-top: 20px;
          border-radius: 16px;
   
        }

        /* ── Track ── */
        .pc-track {
        gap: 16px;
          display: flex;
          will-change: transform;
          transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
        }

        /* ── Card ── */
        .pc-card {
        border-radius: 16px;
          flex: 0 0 calc(100% / 4);
          min-width: 0;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #ebebeb;
          background: #fff;
          transition: background 0.2s ease;
        }
        .pc-card:last-child { border-right: none; }
        .pc-card:hover { background: #fdfcfb; }

        @media (max-width: 1024px) { .pc-card { flex: 0 0 calc(100% / 2); } }
        @media (max-width: 580px)  { .pc-card { flex: 0 0 88%; } }

        /* ── Image ── */
        .pc-img-wrap {
          position: relative;
          width: 100%;
          padding-top: 100%;
          overflow: hidden;
          background: #f9f3ee;
        }

        .pc-img-inner {
          position: absolute;
          inset: 0;
        }

        /* Badge */
        .pc-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          z-index: 2;
          background: #111;
          color: #fff;
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 6px;
        }

        /* Stars */
        .pc-stars-overlay {
          position: absolute;
          top: 14px;
          right: 14px;
          z-index: 2;
        }

        .pc-stars {
          display: flex;
          align-items: center;
          gap: 2px;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-radius: 999px;
          padding: 4px 9px 4px 7px;
          border: 1px solid rgba(0,0,0,0.06);
        }

        .pc-review-count {
          font-size: 10.5px;
          font-weight: 500;
          color: #222;
          margin-left: 4px;
        }

        /* ── Info ── */
        .pc-info {
          display: flex;
          flex-direction: column;
          padding: 18px 18px 20px;
          flex: 1;
          gap: 0;
        }

        .pc-formula {
          font-size: 11px;
          font-weight: 400;
          color: #999;
          margin-bottom: 5px;
          line-height: 1.45;
          letter-spacing: 0.01em;
        }

        .pc-name {
          font-size: 17px;
          font-weight: 600;
          color: #111;
          margin-bottom: 4px;
          line-height: 1.25;
          letter-spacing: -0.012em;
        }

        .pc-tagline {
          font-size: 12.5px;
          font-weight: 400;
          color: #666;
          margin-bottom: 14px;
          line-height: 1.45;
        }

        /* Price */
        .pc-price-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 14px;
        }

        .pc-orig {
          font-size: 12px;
          font-weight: 400;
          color: #bbb;
          text-decoration: line-through;
        }

        .pc-sale {
          font-size: 18px;
          font-weight: 700;
          color: #111;
          letter-spacing: -0.02em;
        }

        /* Select */
        .pc-select-wrap {
          position: relative;
          margin-bottom: 14px;
        }

        .pc-select {
          width: 100%;
          appearance: none;
          -webkit-appearance: none;
          background: #fafafa;
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          padding: 10px 36px 10px 14px;
          font-size: 12.5px;
          font-weight: 500;
          color: #222;
          cursor: pointer;
          outline: none;
          font-family: 'Poppins', sans-serif;
          transition: border-color 0.18s, background 0.18s;
        }

        .pc-select:hover  { border-color: #bbb; background: #f5f5f5; }
        .pc-select:focus  { border-color: #111; background: #fff; }

        .pc-chevron {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #777;
          pointer-events: none;
        }

        /* ATC button — pink */
        .pc-atc {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          background: #f4a7c3;
          color: #5a1030;
          border: none;
          border-radius: 999px;
          padding: 13px 20px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: 0.005em;
          font-family: 'Poppins', sans-serif;
          margin-top: auto;
          transition:
            background   0.2s ease,
            color        0.2s ease,
            transform    0.25s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow   0.25s ease;
        }

        .pc-atc:hover {
          background: #f08fb0;
          color: #3d0020;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(240, 100, 150, 0.28);
        }

        .pc-atc:active {
          transform: translateY(0);
          box-shadow: none;
        }

        /* ── Arrows ── */
 
.pc-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;

  width: 42px;
  height: 42px;
  border-radius: 999px;

  background: #fff;
  color: #111;
  border: 1px solid #e5e5e5;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  box-shadow: 0 4px 16px rgba(0,0,0,0.08);

  transition:
    background 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.2s ease;
}

/* HOVER */
.pc-arrow:hover {
  background: #111;
  color: #fff;
  border-color: #111;
  box-shadow: 0 8px 24px rgba(0,0,0,0.18);
  transform: translateY(-50%) scale(1.05);
}

/* ACTIVE */
.pc-arrow:active {
  transform: translateY(-50%) scale(0.96);
}

/* DISABLED */
.pc-arrow:disabled {
  opacity: 0;
  pointer-events: none;
}

/* POSITIONING — ALWAYS INSIDE FRAME */
.pc-arrow-left  { left: 8px; }
.pc-arrow-right { right: 8px; }

/* TABLET */
@media (max-width: 768px) {
  .pc-arrow {
    width: 38px;
    height: 38px;
  }

  .pc-arrow-left  { left: 6px; }
  .pc-arrow-right { right: 6px; }
}

/* MOBILE */
@media (max-width: 480px) {
  .pc-arrow {
    width: 34px;
    height: 34px;
  }

  .pc-arrow-left  { left: 4px; }
  .pc-arrow-right { right: 4px; }
}

        /* ── Dots ── */
        .pc-dots {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 7px;
          margin-top: 20px;
        }

        .pc-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #d8d8d8;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: background 0.22s ease, transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), width 0.22s ease;
        }

        .pc-dot.active {
          background: #111;
          width: 20px;
          border-radius: 999px;
          transform: none;
        }
      `}</style>

      <section className="pc-root" aria-label="Incense product carousel" aria-roledescription="carousel">
        <h1 className="text-4xl font-bold text-center">Best Seller Agarbatti</h1>
        {/* Carousel */}
        <div className="pc-carousel mt-5">
          {/* Arrows */}
          <ArrowBtn dir="left" disabled={index === 0} onClick={prev} />
          <ArrowBtn dir="right" disabled={index >= maxIndex} onClick={next} />

          {/* Track */}
          <div
            ref={trackRef}
            className="pc-track"
            aria-live="polite"
            style={{
              transform: `translateX(calc(-${index} * 100% / ${VISIBLE_DESKTOP}))`,
            }}
          >
            {PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="pc-dots" role="tablist" aria-label="Carousel page">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`pc-dot${i === index ? " active" : ""}`}
              onClick={() => goTo(i)}
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      </section>
    </>
  );
}
