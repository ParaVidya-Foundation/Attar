import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely normalizes href values for Next.js Link components.
 * Always returns a valid string, never undefined or null.
 *
 * @param href - The href value to normalize (can be string, undefined, null, or empty)
 * @param fallback - Optional fallback value (defaults to "#")
 * @returns A guaranteed non-empty string
 */
export function safeHref(href: string | undefined | null, fallback: string = "#"): string {
  if (href == null) return fallback;
  if (typeof href !== "string") return fallback;
  const trimmed = href.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}
