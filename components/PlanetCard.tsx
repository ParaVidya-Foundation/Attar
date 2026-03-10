"use client";

import ResultCard from "@/components/ResultCard";

interface PlanetCardProps {
  label: string;
  value: number;
  grade?: string;
  score?: number;
  highlighted?: boolean;
}

export default function PlanetCard({ label, value, grade, score, highlighted = false }: PlanetCardProps) {
  return (
    <ResultCard
      title={highlighted ? "Shukra (Venus)" : label}
      subtitle={
        highlighted
          ? `Fragrance influence${typeof score === "number" ? ` • Strength ${score}` : ""}`
          : `${grade ?? "planetary"}${typeof score === "number" ? ` • ${score}` : ""}`
      }
      accent={highlighted ? "venus" : "default"}
    >
      <p className={`text-2xl font-semibold ${highlighted ? "text-amber-700" : "text-neutral-900"}`}>
        {value.toFixed(2)}°
      </p>
    </ResultCard>
  );
}
