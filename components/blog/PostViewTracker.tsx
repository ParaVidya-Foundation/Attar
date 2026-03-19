"use client";

import { useEffect, useRef } from "react";

export function PostViewTracker({ postId }: { postId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    const key = `blog-view-${postId}`;
    const lastView = sessionStorage.getItem(key);
    const now = Date.now();
    if (lastView && now - Number(lastView) < 60 * 1000) return;

    sessionStorage.setItem(key, String(now));

    fetch("/api/blog/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    }).catch(() => {});
  }, [postId]);

  return null;
}
