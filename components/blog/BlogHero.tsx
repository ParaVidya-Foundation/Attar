"use client";

import { motion } from "framer-motion";

export default function BlogHero() {
  return (
    <header className="w-full bg-white border-b border-black/10">
      {/* Editorial container */}
      <div className="mx-auto max-w-[1100px] px-6 sm:px-8 lg:px-10 py-16 sm:py-20 lg:py-24">
        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="
            text-xs
            tracking-[0.18em]
            text-black/50
            uppercase
            mb-4
          "
        >
          Knowledge · Research · Insights
        </motion.p>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
          className="
            font-serif
            text-4xl
            sm:text-5xl
            lg:text-6xl
            leading-tight
            tracking-tight
            text-[#1e2023]
            max-w-3xl
          "
        >
          Research & Articles
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="
            mt-6
            text-[17px]
            leading-relaxed
            text-black/60
            max-w-2xl
          "
        >
          A curated collection of traditional wisdom, modern interpretation, and research-driven insights
          across astrology, philosophy, and spiritual sciences.
        </motion.p>

        {/* Divider (editorial touch) */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.8 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="mt-10 h-[2px] w-16 bg-black/80"
        />
      </div>
    </header>
  );
}
