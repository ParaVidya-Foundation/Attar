"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, MapPin, X } from "lucide-react";
import { addAddress, updateAddress, deleteAddress } from "@/app/account/address/actions";

const INPUT_CLASS =
  "mt-1.5 w-full rounded-xl border border-ash/60 bg-white px-4 py-3 text-sm text-ink placeholder:text-charcoal/50 transition-colors focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/20 disabled:bg-ash/20 disabled:text-charcoal/80";

const LABEL_CLASS = "block text-sm font-medium text-ink";

type Address = {
  id: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  phone: string | null;
  is_default: boolean;
};

const EMPTY_FORM = {
  label: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postal_code: "",
  phone: "",
  is_default: false,
};

export default function AddressList({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function startAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setMessage(null);
  }

  function startEdit(addr: Address) {
    setEditingId(addr.id);
    setForm({
      label: addr.label ?? "",
      line1: addr.line1,
      line2: addr.line2 ?? "",
      city: addr.city,
      state: addr.state ?? "",
      postal_code: addr.postal_code ?? "",
      phone: addr.phone ?? "",
      is_default: addr.is_default,
    });
    setShowForm(true);
    setMessage(null);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setMessage(null);
  }

  function updateField<K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const fd = new FormData();
    fd.set("label", form.label);
    fd.set("line1", form.line1);
    fd.set("line2", form.line2);
    fd.set("city", form.city);
    fd.set("state", form.state);
    fd.set("postal_code", form.postal_code);
    fd.set("phone", form.phone);
    fd.set("is_default", String(form.is_default));

    try {
      let result;
      if (editingId) {
        fd.set("id", editingId);
        result = await updateAddress(fd);
      } else {
        result = await addAddress(fd);
      }

      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setShowForm(false);
        setEditingId(null);
        router.refresh();
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong." });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this address?")) return;

    try {
      const result = await deleteAddress(id);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        router.refresh();
      }
    } catch {
      setMessage({ type: "error", text: "Could not delete address." });
    }
  }

  return (
    <div className="min-h-[70vh] flex-1 bg-white">
      <div className="px-4 py-10 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            My addresses
          </h1>
          {!showForm && (
            <button
              type="button"
              onClick={startAdd}
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-cream transition hover:bg-ink/95"
            >
              <Plus className="h-4 w-4" />
              Add address
            </button>
          )}
        </div>

        {message && (
          <div
            className={`mt-4 max-w-xl rounded-xl px-4 py-3 text-sm ${
              message.type === "success"
                ? "border border-green-200 bg-green-50 text-green-800"
                : "border border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {showForm && (
          <form className="mt-6 max-w-xl space-y-4 rounded-2xl border border-ash/50 p-5" onSubmit={handleSubmit}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
                {editingId ? "Edit address" : "New address"}
              </h2>
              <button type="button" onClick={cancelForm} className="text-charcoal/60 hover:text-ink" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label htmlFor="addr-label" className={LABEL_CLASS}>Label</label>
              <input
                id="addr-label"
                type="text"
                value={form.label}
                onChange={(e) => updateField("label", e.target.value)}
                className={INPUT_CLASS}
                placeholder="Home, Work, etc."
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="addr-line1" className={LABEL_CLASS}>
                Address line 1 <span className="text-charcoal/60">*</span>
              </label>
              <input
                id="addr-line1"
                type="text"
                value={form.line1}
                onChange={(e) => updateField("line1", e.target.value)}
                className={INPUT_CLASS}
                placeholder="Street address"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="addr-line2" className={LABEL_CLASS}>Address line 2</label>
              <input
                id="addr-line2"
                type="text"
                value={form.line2}
                onChange={(e) => updateField("line2", e.target.value)}
                className={INPUT_CLASS}
                placeholder="Apartment, suite, etc."
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="addr-city" className={LABEL_CLASS}>
                  City <span className="text-charcoal/60">*</span>
                </label>
                <input
                  id="addr-city"
                  type="text"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="City"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="addr-state" className={LABEL_CLASS}>State</label>
                <input
                  id="addr-state"
                  type="text"
                  value={form.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="State"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="addr-pincode" className={LABEL_CLASS}>Pincode</label>
                <input
                  id="addr-pincode"
                  type="text"
                  value={form.postal_code}
                  onChange={(e) => updateField("postal_code", e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="Pincode"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="addr-phone" className={LABEL_CLASS}>Phone</label>
                <input
                  id="addr-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="Phone number"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => updateField("is_default", e.target.checked)}
                className="h-4 w-4 rounded border-ash/60 text-ink focus:ring-gold/30"
                disabled={isSubmitting}
              />
              Set as default address
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-cream transition hover:bg-ink/95 disabled:opacity-60 sm:w-auto sm:min-w-[180px]"
            >
              {isSubmitting ? "Saving…" : editingId ? "Update address" : "Save address"}
            </button>
          </form>
        )}

        {addresses.length === 0 && !showForm ? (
          <div className="mt-12 flex flex-col items-center text-center">
            <MapPin className="h-12 w-12 text-charcoal/30" />
            <p className="mt-4 text-sm text-charcoal/70">You haven&apos;t added any addresses yet.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="rounded-2xl border border-ash/50 p-5 transition-colors hover:border-ash"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-charcoal/60" />
                    <span className="text-sm font-semibold text-ink">{addr.label || "Address"}</span>
                    {addr.is_default && (
                      <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(addr)}
                      className="rounded-lg p-1.5 text-charcoal/60 transition hover:bg-ash/40 hover:text-ink"
                      aria-label="Edit address"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(addr.id)}
                      className="rounded-lg p-1.5 text-charcoal/60 transition hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete address"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-sm leading-6 text-charcoal/80">
                  <p>{addr.line1}</p>
                  {addr.line2 && <p>{addr.line2}</p>}
                  <p>
                    {[addr.city, addr.state, addr.postal_code].filter(Boolean).join(", ")}
                  </p>
                  {addr.phone && <p className="mt-1 text-charcoal/60">{addr.phone}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
