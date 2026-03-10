"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ResultCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  accent?: "default" | "venus";
}

export default function ResultCard({ title, subtitle, children, accent = "default" }: ResultCardProps) {
  const accentClass =
    accent === "venus"
      ? "border-neutral-200 bg-white"
      : "border-neutral-200 bg-white";

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`rounded-md border p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md ${accentClass}`}
    >
      <h3 className="text-sm font-medium uppercase tracking-[0.14em] text-black">{title}</h3>
      {subtitle ? <p className="mt-3 text-base leading-relaxed text-neutral-600">{subtitle}</p> : null}
      <div className="mt-6">{children}</div>
    </motion.article>
  );
}
