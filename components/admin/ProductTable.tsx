"use client";

import { useState } from "react";
import Link from "next/link";
import { toggleProductActive, deleteProduct } from "@/lib/admin/actions";
import { Badge } from "@/components/ui/badge";
import type { ProductRow } from "@/lib/admin/queries";
import type { CategoryRow } from "@/lib/admin/queries";
import { EmptyState } from "./EmptyState";
import { Package, Trash2 } from "lucide-react";

type Props = {
  products: ProductRow[];
  categories: CategoryRow[];
};

export function ProductTable({ products, categories }: Props) {
  const [updating, setUpdating] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  async function handleToggle(id: string, current: boolean) {
    setUpdating(id);
    await toggleProductActive(id, !current);
    setUpdating(null);
  }

  async function handleDelete(id: string) {
    setUpdating(id);
    await deleteProduct(id);
    setConfirmDelete(null);
    setUpdating(null);
    window.location.reload();
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<Package className="h-12 w-12" />}
        title="No products found"
        description="Add products to get started"
      />
    );
  }

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "—";
    return categories.find((c) => c.id === categoryId)?.name ?? "—";
  };

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="px-4 py-3 text-left font-medium text-neutral-700">Name</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-700">Price</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-700">Original</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-700">Category</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-700">Status</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-700">Created</th>
              <th className="px-4 py-3 text-right font-medium text-neutral-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50">
                <td className="px-4 py-3 font-medium text-neutral-900">{p.name}</td>
                <td className="px-4 py-3 text-neutral-700">₹{p.price.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-neutral-600">
                  {p.original_price ? `₹${p.original_price.toLocaleString("en-IN")}` : "—"}
                </td>
                <td className="px-4 py-3 text-neutral-600">{getCategoryName(p.category_id)}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleToggle(p.id, p.is_active)}
                    disabled={updating === p.id}
                    className="focus:outline-none disabled:opacity-50"
                  >
                    <Badge variant={p.is_active ? "success" : "secondary"}>
                      {p.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </button>
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {new Date(p.created_at).toLocaleDateString("en-IN")}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-neutral-500 hover:text-neutral-900 text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete({ id: p.id, name: p.name })}
                      className="text-red-600 hover:text-red-700 p-1"
                      aria-label={`Delete ${p.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <h3 className="text-base font-semibold text-neutral-900">Delete product</h3>
            <p className="mt-2 text-sm text-neutral-600">
              Delete &quot;{confirmDelete.name}&quot;? This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDelete.id)}
                disabled={updating === confirmDelete.id}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
