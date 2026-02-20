"use client";

import type { ButtonHTMLAttributes } from "react";
import { forwardRef } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className = "", variant = "primary", ...props },
  ref,
) {
  const base =
    "inline-flex items-center justify-center rounded-full px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition focus:outline-none w-full sm:w-auto";
  const styles =
    variant === "primary"
      ? "bg-ink text-cream hover:bg-ink/95"
      : "border border-ash/60 bg-white/50 text-ink hover:bg-cream/70";

  return <button ref={ref} className={[base, styles, className].join(" ")} {...props} />;
});
