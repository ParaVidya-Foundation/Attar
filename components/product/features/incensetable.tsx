"use client";

import React from "react";
import Image from "next/image";
/* ================= DATA ================= */

const specifications = [
  { label: "Country of Origin", value: "Made in India" },
  { label: "Item Form", value: "Bamboo-less Incense" },
  { label: "Item Type", value: "Eco-friendly, Organic, Meditation, Vedic" },
  { label: "Number of Sticks", value: "40" },
  { label: "Burning Time", value: "30+ Minutes" },
  { label: "Length of Stick", value: "3.5 inches" },
];

const features = [
  { name: "Clean Burning – Low Smoke", ours: true, others: false },
  { name: "Natural Ingredients – Chemical & Charcoal Free", ours: true, others: false },
  { name: "Premium Quality – Handcrafted", ours: true, others: false },
  { name: "Vedic Fragrance – Authentic Spiritual", ours: true, others: false },
  { name: "Environment Friendly – Perfect for Daily Pooja", ours: true, others: false },
];

/* ================= SEO ================= */

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Premium Vedic Incense",
  brand: { "@type": "Brand", name: "Anand Rasa" },
  additionalProperty: specifications.map((s) => ({
    "@type": "PropertyValue",
    name: s.label,
    value: s.value,
  })),
};

/* ================= ICONS ================= */

function Check() {
  return <Image src="/check.png" alt="Check" width={36} height={36} />;
}

function Cross() {
  return <Image src="/cross.png" alt="Check" width={36} height={36} />;
}

/* ================= COMPONENT ================= */

export default function IncenseTable() {
  return (
    <section className="bg-white py-14 sm:py-16">
      {/* SEO */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* ================= SPECIFICATIONS ================= */}
          <div className="border border-black animate-fade-in">
            <div className="border-b border-black px-6 py-4">
              <h3 className="text-lg font-medium tracking-wide text-black">Specification</h3>
            </div>

            <div>
              {specifications.map((spec) => (
                <div
                  key={spec.label}
                  className="grid grid-cols-1 sm:grid-cols-2 border-b border-black last:border-b-0"
                >
                  <div className="px-6 py-5 text-sm font-medium text-black">{spec.label}</div>
                  <div className="px-6 py-5 text-sm text-neutral-600">{spec.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ================= FEATURES ================= */}
          <div className="border border-black animate-fade-in">
            {/* Header */}
            <div className="hidden sm:grid grid-cols-[1fr_120px_120px] border-b border-black text-sm font-medium text-black">
              <div className="px-6 py-4">Features</div>
              <div className="px-4 py-4 text-center">Anand Rasa</div>
              <div className="px-4 py-4 text-center">Others</div>
            </div>

            {/* Rows */}
            {features.map((feature) => (
              <div
                key={feature.name}
                className="grid grid-cols-1 sm:grid-cols-[1fr_120px_120px] items-center border-b border-black last:border-b-0"
              >
                {/* Feature name */}
                <div className="px-6 py-5 text-sm text-black">{feature.name}</div>

                {/* Mobile labels */}
                <div className="flex items-center justify-between px-6 pb-4 sm:hidden text-xs text-neutral-500">
                  <span>Anand Rasa</span>
                  <span>Others</span>
                </div>

                {/* Icons */}
                <div className="flex justify-between sm:justify-center px-6 pb-5 sm:pb-5 sm:px-0 gap-10 sm:gap-0">
                  {feature.ours ? <Check /> : <Cross />}
                  {feature.others ? <Check /> : <Cross />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
