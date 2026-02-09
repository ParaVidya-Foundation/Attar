"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

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

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[Error Boundary]:", error);
    }
  }, [error]);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      <div className="text-center">
        <ErrorIcon className="mx-auto h-16 w-16 text-destructive" />
        <h2 className="mt-4 font-serif text-3xl font-semibold text-foreground">Something Went Wrong</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          The cosmic energies are misaligned. Please try again.
        </p>
        <Button onClick={reset} className="mt-8">
          Try Again
        </Button>
      </div>
    </main>
  );
}
