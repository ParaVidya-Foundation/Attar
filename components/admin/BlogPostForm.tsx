"use client";

import { useState, useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import type { BlogPostFormData } from "@/lib/admin/actions";
import { blogPostFormAction } from "@/lib/admin/actions";
import type { BlogCategoryOption, BlogTagOption } from "@/lib/admin/blogQueries";
import { BlogEditor } from "@/components/admin/BlogEditor";

type Props = {
  categories: BlogCategoryOption[];
  tags: BlogTagOption[];
  initialData?: Partial<BlogPostFormData>;
  postId?: string;
};

export function BlogPostForm({ categories, tags, initialData, postId }: Props) {
  const [state, formAction] = useFormState(blogPostFormAction, null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialData?.tag_ids ?? []);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) window.location.href = "/admin/blog";
    if (state && !state.ok && state.error) setError(state.error);
  }, [state]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    let hidden = form.querySelector<HTMLInputElement>('input[name="tag_ids"]');
    if (!hidden) {
      hidden = document.createElement("input");
      hidden.name = "tag_ids";
      hidden.type = "hidden";
      form.appendChild(hidden);
    }
    hidden.value = JSON.stringify(selectedTagIds);
    form.requestSubmit();
  }

  function toggleTag(id: string) {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  }

  return (
    <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {postId != null && <input type="hidden" name="postId" value={postId} />}
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-neutral-700">
          Title *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={initialData?.title}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
        />
      </div>

      <div>
        <label htmlFor="slug" className="mb-1 block text-sm font-medium text-neutral-700">
          Slug (URL)
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          defaultValue={initialData?.slug}
          placeholder="auto from title"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
        />
      </div>

      <div>
        <label htmlFor="excerpt" className="mb-1 block text-sm font-medium text-neutral-700">
          Excerpt
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          defaultValue={initialData?.excerpt}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          Content (rich editor)
        </label>
        <BlogEditor name="content" defaultValue={initialData?.content ?? ""} />
      </div>

      <div>
        <label htmlFor="cover_image" className="mb-1 block text-sm font-medium text-neutral-700">
          Cover image URL
        </label>
        <input
          id="cover_image"
          name="cover_image"
          type="url"
          defaultValue={initialData?.cover_image ?? ""}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
        />
      </div>

      <div>
        <label htmlFor="category_id" className="mb-1 block text-sm font-medium text-neutral-700">
          Category
        </label>
        <select
          id="category_id"
          name="category_id"
          defaultValue={initialData?.category_id ?? ""}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
        >
          <option value="">— None —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Tags</label>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <label key={t.id} className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1.5 text-sm">
              <input
                type="checkbox"
                checked={selectedTagIds.includes(t.id)}
                onChange={() => toggleTag(t.id)}
                className="rounded border-neutral-300"
              />
              {t.name}
            </label>
          ))}
          {tags.length === 0 && <span className="text-sm text-neutral-500">No tags yet.</span>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="author_name" className="mb-1 block text-sm font-medium text-neutral-700">
            Author name
          </label>
          <input
            id="author_name"
            name="author_name"
            type="text"
            defaultValue={initialData?.author_name ?? ""}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
        </div>
        <div>
          <label htmlFor="reading_time" className="mb-1 block text-sm font-medium text-neutral-700">
            Reading time (minutes)
          </label>
          <input
            id="reading_time"
            name="reading_time"
            type="number"
            min={0}
            defaultValue={initialData?.reading_time ?? ""}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700">Status</label>
        <div className="flex gap-4">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="status"
              value="draft"
              defaultChecked={initialData?.status !== "published"}
              className="border-neutral-300"
            />
            Draft
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="status"
              value="published"
              defaultChecked={initialData?.status === "published"}
              className="border-neutral-300"
            />
            Published
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
        >
          {postId ? "Update post" : "Create post"}
        </button>
        <a
          href="/admin/blog"
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
