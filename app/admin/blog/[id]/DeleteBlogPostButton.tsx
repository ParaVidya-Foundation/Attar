"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteBlogPost } from "@/lib/admin/actions";

type Props = { postId: string; postTitle: string };

export function DeleteBlogPostButton({ postId, postTitle }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete “${postTitle || "this post"}”? This cannot be undone.`)) return;
    setLoading(true);
    const result = await deleteBlogPost(postId);
    setLoading(false);
    if (result?.ok) {
      router.push("/admin/blog");
      router.refresh();
    } else if (result?.error) {
      alert(result.error);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
      >
        Delete
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-neutral-600">Delete this post?</span>
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? "Deleting…" : "Yes, delete"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={loading}
        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:opacity-50"
      >
        Cancel
      </button>
    </div>
  );
}
