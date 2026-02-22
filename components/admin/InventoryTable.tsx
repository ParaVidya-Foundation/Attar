"use client";

import { useState } from "react";
import { updateVariantStock } from "@/lib/admin/actions";
import type { InventoryRow } from "@/lib/admin/queries";
import { EmptyState } from "./EmptyState";
import { Boxes } from "lucide-react";

const LOW_STOCK_THRESHOLD = 10;

type Props = { rows: InventoryRow[] };

export function InventoryTable({ rows }: Props) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<Record<string, number | undefined>>({});

  async function handleSave(variantId: string, currentStock: number) {
    const value = editStock[variantId] ?? currentStock;
    if (value === currentStock) {
      setEditStock((s) => {
      const next = { ...s };
      delete next[variantId];
      return next;
    });
      return;
    }
    setUpdatingId(variantId);
    const result = await updateVariantStock(variantId, value);
    setUpdatingId(null);
    setEditStock((s) => {
      const next = { ...s };
      delete next[variantId];
      return next;
    });
    if (result.ok) window.location.reload();
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<Boxes className="h-12 w-12" />}
        title="No inventory"
        description="Add product variants from the Products section"
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200/80 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50/80">
            <th className="px-4 py-3 text-left font-medium text-neutral-700">Product</th>
            <th className="px-4 py-3 text-left font-medium text-neutral-700">Size</th>
            <th className="px-4 py-3 text-left font-medium text-neutral-700">Price</th>
            <th className="px-4 py-3 text-left font-medium text-neutral-700">Stock</th>
            <th className="px-4 py-3 text-right font-medium text-neutral-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const isLow = r.stock < LOW_STOCK_THRESHOLD;
            const currentStock = editStock[r.variant_id] ?? r.stock;
            const isEditing = editStock[r.variant_id] !== undefined;
            return (
              <tr
                key={r.variant_id}
                className={`border-b border-neutral-100 last:border-0 transition-colors hover:bg-neutral-50/50 ${
                  isLow ? "bg-amber-50/50" : ""
                }`}
              >
                <td className="px-4 py-3 font-medium text-neutral-900">{r.product_name}</td>
                <td className="px-4 py-3 text-neutral-700">{r.size_ml}ml</td>
                <td className="px-4 py-3 text-neutral-700">₹{(r.price / 100).toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">
                  {isEditing ? (
                    <input
                      type="number"
                      min={0}
                      value={currentStock}
                      onChange={(e) =>
                        setEditStock((s) => ({ ...s, [r.variant_id]: parseInt(e.target.value, 10) || 0 } as Record<string, number | undefined>))
                      }
                      className="w-20 rounded-lg border border-neutral-300 px-2 py-1 text-sm"
                    />
                  ) : (
                    <span className={isLow ? "font-medium text-amber-700" : ""}>{r.stock}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {isEditing ? (
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditStock((s) => { const next = { ...s }; delete next[r.variant_id]; return next; })}
                        className="text-sm text-neutral-600 hover:text-neutral-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave(r.variant_id, r.stock)}
                        disabled={updatingId === r.variant_id}
                        className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-800 disabled:opacity-50"
                      >
                        {updatingId === r.variant_id ? "Saving…" : "Save"}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditStock((s) => ({ ...s, [r.variant_id]: r.stock }))}
                      className="text-sm text-neutral-600 hover:text-neutral-900"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
