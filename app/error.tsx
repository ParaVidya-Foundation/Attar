"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

function ErrorIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
        fill="currentColor"
      />
      <path d="M12 9v4" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="16" r="0.9" fill="white" />
    </svg>
  );
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      // Development only: do not expose in production
      // eslint-disable-next-line no-console
      console.error("[Error Boundary]", error.message);
    }
  }, [error]);

  // Check if error is environment-related
  const isEnvError =
    error.message.includes("environment") ||
    error.message.includes("NEXT_PUBLIC") ||
    error.message.includes("Supabase") ||
    error.message.includes("Razorpay") ||
    error.message.includes("Missing");

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      <Container className="text-center">
        <ErrorIcon className="mx-auto h-16 w-16 text-ink/60" />
        <h1 className="mt-6 font-serif text-3xl font-semibold text-ink">Something Went Wrong</h1>
        <p className="mt-4 text-lg text-charcoal/70">
          {isEnvError
            ? "Configuration error detected. Please check environment variables."
            : "We encountered an unexpected error. Please try again or return home."}
        </p>
        {process.env.NODE_ENV === "development" && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-charcoal/60">Error Details</summary>
            <pre className="mt-2 overflow-auto rounded bg-charcoal/10 p-4 text-xs text-charcoal/80">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={reset}
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-ink/90"
          >
            Try Again
          </button>
          <Link
            href="/home"
            className="rounded-full border border-ash/60 bg-white/50 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-white"
          >
            Go Home
          </Link>
        </div>
      </Container>
    </main>
  );
}
