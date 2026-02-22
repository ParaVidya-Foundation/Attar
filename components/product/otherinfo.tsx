"use client";

import React from "react";

export type InfoItem = {
  title: string;
  text: string;
};

type Props = {
  items?: InfoItem[]; // ← make optional (important)
};

export default function OtherInfo({ items = [] }: Props) {
  // Prevent crash if API not loaded yet
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  /* Intelligent grid */
  const getGridClass = () => {
    if (items.length === 1) return "grid-cols-1 max-w-3xl mx-auto";
    if (items.length === 2) return "grid-cols-1 md:grid-cols-2";
    if (items.length === 3) return "grid-cols-1 md:grid-cols-3";
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
  };

  return (
    <section
      aria-label="Additional product information"
      className="w-full border-b-[2px] border-[#1e2023] bg-white"
    >
      <div className={`grid ${getGridClass()} w-full`}>
        {items.map((item, index) => (
          <article
            key={`${item.title}-${index}`}
            className={`
            px-6 md:px-10
            py-10 md:py-12
            border-[#1e2023]
            border-l-[2px]
            border-r-[1px]
            animate-fadeUp
          `}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <h3 className="font-heading text-[15px] tracking-normal font-medium text-[#121212] uppercase">
              {item.title}
            </h3>

            <p className="mt-4 leading-6 text-gray-700 max-w-[460px]">{item.text}</p>
          </article>
        ))}
      </div>

      {/* Same animation without styled-jsx to avoid App Router / optimizeCss issues */}
      <style
        dangerouslySetInnerHTML={{
          __html: `.animate-fadeUp{opacity:0;transform:translateY(12px);animation:otherinfo-fadeUp 0.5s ease-out forwards}@keyframes otherinfo-fadeUp{to{opacity:1;transform:translateY(0)}}`,
        }}
      />
    </section>
  );
}
