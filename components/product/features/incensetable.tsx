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
};

/* ================= ICONS ================= */

function Check() {
  return <Image src="/check.png" alt="Available" width={28} height={28} className="opacity-95" />;
}

function Cross() {
  return <Image src="/cross.png" alt="Not Available" width={28} height={28} className="opacity-70" />;
}

/* ================= COMPONENT ================= */

export default function IncenseTable() {
  return (
    <section className="bg-white py-20">
      {/* SEO */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}

        <header className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Why Choose Our Incense</h2>
          <p className="mt-3 text-sm text-neutral-600">
            Crafted for purity, fragrance and spiritual practice
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* ================= SPECIFICATIONS ================= */}

          <div className="border border-neutral-200">
            <div className="px-6 py-5 border-b border-neutral-200">
              <h3 className="font-medium text-lg">Product Specification</h3>
            </div>

            <div className="divide-y divide-neutral-200">
              {specifications.map((spec) => (
                <div key={spec.label} className="grid grid-cols-1 sm:grid-cols-2 px-6 py-5 text-sm">
                  <span className="font-medium text-neutral-800">{spec.label}</span>

                  <span className="text-neutral-600 sm:text-right">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ================= COMPARISON ================= */}

          <div className="border border-neutral-200">
            {/* Header */}

            <div className="grid grid-cols-[1fr_120px_120px] border-b border-neutral-200 text-sm font-medium">
              <div className="px-6 py-5">Features</div>

              <div className="px-4 py-5 text-center bg-neutral-50">Anand Rasa</div>

              <div className="px-4 py-5 text-center text-neutral-500">Others</div>
            </div>

            {/* Rows */}

            {features.map((feature) => (
              <div
                key={feature.name}
                className="grid grid-cols-[1fr_120px_120px] items-center border-b border-neutral-200 last:border-none"
              >
                <div className="px-6 py-6 text-sm text-neutral-800">{feature.name}</div>

                <div className="flex justify-center bg-neutral-50 py-6">
                  {feature.ours ? <Check /> : <Cross />}
                </div>

                <div className="flex justify-center py-6">{feature.others ? <Check /> : <Cross />}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
