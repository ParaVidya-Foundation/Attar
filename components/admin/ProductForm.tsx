"use client";

import { useState, useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import type { ProductFormData, ProductVariantInput } from "@/lib/admin/actions";
import { productFormAction } from "@/lib/admin/actions";
import type { CategoryRow } from "@/lib/admin/queries";
import { Plus, Trash2 } from "lucide-react";

const defaultVariant = (): ProductVariantInput => ({ size_ml: 5, price: 0, stock: 0 });

type Props = {
  categories: CategoryRow[];
  initialData?: Partial<ProductFormData> & { variants?: ProductVariantInput[] };
  /** When set, form submits as update; otherwise create. */
  productId?: string;
};

export function ProductForm({ categories, initialData, productId }: Props) {
  const [state, formAction] = useFormState(productFormAction, null);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [variants, setVariants] = useState<ProductVariantInput[]>(
    initialData?.variants?.length ? [...initialData.variants] : [defaultVariant()],
  );

  useEffect(() => {
    if (state?.ok) window.location.href = "/admin/products";
    if (state && !state.ok && state.error) setError(state.error);
  }, [state]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    let hidden = form.querySelector<HTMLInputElement>('input[name="variants"]');
    if (!hidden) {
      hidden = document.createElement("input");
      hidden.name = "variants";
      hidden.type = "hidden";
      form.appendChild(hidden);
    }
    hidden.value = JSON.stringify(variants.filter((v) => v.size_ml > 0));
    form.requestSubmit();
  }

  function addVariant() {
    setVariants((prev) => [...prev, defaultVariant()]);
  }
  function removeVariant(i: number) {
    setVariants((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateVariant(i: number, field: keyof ProductVariantInput, value: number) {
    setVariants((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }

  return (
    <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="max-w-xl space-y-4">
      {productId != null && <input type="hidden" name="productId" value={productId} />}
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
              Default price (paise)
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
              Original (paise)
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
      <div className="space-y-3 rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-neutral-700">Variants (size, price in paise, stock)</h3>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-1 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm text-neutral-700 hover:bg-white"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        {variants.map((v, i) => (
          <div key={i} className="flex flex-wrap items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
            <input
              type="number"
              min={1}
              placeholder="Size (ml)"
              value={v.size_ml || ""}
              onChange={(e) => updateVariant(i, "size_ml", parseInt(e.target.value, 10) || 0)}
              className="w-20 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
            />
            <input
              type="number"
              min={0}
              placeholder="Price (paise)"
              value={v.price || ""}
              onChange={(e) => updateVariant(i, "price", parseInt(e.target.value, 10) || 0)}
              className="w-28 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
            />
            <input
              type="number"
              min={0}
              placeholder="Stock"
              value={v.stock || ""}
              onChange={(e) => updateVariant(i, "stock", parseInt(e.target.value, 10) || 0)}
              className="w-20 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={() => removeVariant(i)}
              className="p-1.5 text-neutral-400 hover:text-red-600"
              aria-label="Remove variant"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
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
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          Save
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
