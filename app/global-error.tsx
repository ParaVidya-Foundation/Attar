"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";
import { isDevelopment } from "@/lib/env";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black antialiased">
        <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-neutral-600">Application Error</p>
          <h1 className="mt-6 text-3xl font-semibold text-black md:text-4xl">Something went wrong</h1>
          <p className="mt-6 text-base leading-relaxed text-neutral-600">
            The application hit an unexpected error. Try reloading this view or return to the home page.
          </p>
          {isDevelopment() ? (
            <pre className="mt-8 w-full overflow-auto rounded-md border border-neutral-200 bg-neutral-50 p-4 text-left text-xs text-neutral-700">
              {error.message}
              {error.digest ? `\nDigest: ${error.digest}` : ""}
            </pre>
          ) : null}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center rounded-md bg-black px-6 py-3 font-medium text-white transition hover:bg-neutral-900 focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md border border-black bg-white px-6 py-3 font-medium text-black transition hover:bg-neutral-900 hover:text-white focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              Go Home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
