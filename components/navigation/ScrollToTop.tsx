"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Defer until after paint to avoid fighting layout on fast transitions.
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  }, [pathname, searchParams]);

  return null;
}

