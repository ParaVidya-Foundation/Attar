"use client";

import ResultCard from "@/components/ResultCard";

interface SignCardProps {
  title: string;
  value: string;
  meta?: string;
}

export default function SignCard({ title, value, meta }: SignCardProps) {
  return (
    <ResultCard title={title}>
      <p className="text-3xl font-semibold text-black md:text-4xl">{value}</p>
      {meta ? <p className="mt-4 text-base leading-relaxed text-neutral-600">{meta}</p> : null}
    </ResultCard>
  );
}
