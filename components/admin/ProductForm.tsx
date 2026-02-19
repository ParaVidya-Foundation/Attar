"use client";

import { useState } from "react";
import type { ProductFormData } from "@/lib/admin/actions";
import type { CategoryRow } from "@/lib/admin/queries";

type Props = {
  categories: CategoryRow[];
  initialData?: Partial<ProductFormData>;
  action: (data: ProductFormData) => Promise<{ ok: boolean; error?: string }>;
};

export function ProductForm({ categories, initialData, action }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const data: ProductFormData = {
      name: (fd.get("name") as string) ?? "",
      slug: (fd.get("slug") as string) ?? "",
      description: (fd.get("description") as string) ?? "",
      category_id: (fd.get("category_id") as string) || null,
      price: Number(fd.get("price")) || 0,
      original_price: fd.get("original_price") ? Number(fd.get("original_price")) : null,
      stock: Number(fd.get("stock")) || 0,
      is_active: fd.get("is_active") === "on",
      image_url: (fd.get("image_url") as string) ?? "",
    };

    const result = await action(data);
    setLoading(false);
    if (result.ok) {
      window.location.href = "/admin/products";
    } else {
      setError(result.error ?? "Failed to save");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-neutral-700">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={initialData?.name}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
        </div>
        <div>
          <label htmlFor="slug" className="mb-1 block text-sm font-medium text-neutral-700">
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            defaultValue={initialData?.slug}
            placeholder="auto-generated"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
        </div>
      </div>
      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-neutral-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initialData?.description}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
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
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="price" className="mb-1 block text-sm font-medium text-neutral-700">
              Price (₹)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              required
              defaultValue={initialData?.price}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="original_price" className="mb-1 block text-sm font-medium text-neutral-700">
              Original (₹)
            </label>
            <input
              id="original_price"
              name="original_price"
              type="number"
              min={0}
              defaultValue={initialData?.original_price ?? ""}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="stock" className="mb-1 block text-sm font-medium text-neutral-700">
            Stock
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min={0}
            defaultValue={initialData?.stock ?? 0}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
        </div>
        <div>
          <label htmlFor="image_url" className="mb-1 block text-sm font-medium text-neutral-700">
            Image URL
          </label>
          <input
            id="image_url"
            name="image_url"
            type="text"
            defaultValue={initialData?.image_url ?? ""}
            placeholder="/products/..."
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="is_active"
          name="is_active"
          type="checkbox"
          defaultChecked={initialData?.is_active ?? true}
          className="h-4 w-4 rounded border-neutral-300"
          value="on"
        />
        <label htmlFor="is_active" className="text-sm text-neutral-700">
          Active
        </label>
      </div>
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save"}
        </button>
        <a
          href="/admin/products"
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
