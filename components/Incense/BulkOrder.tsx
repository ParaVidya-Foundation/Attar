"use client";

import { useState } from "react";
import Link from "next/link";

export default function BulkOrder() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const data = new FormData(form);

    // Replace with API later
    setTimeout(() => {
      console.log(Object.fromEntries(data.entries()));
      setStatus("success");
      form.reset();
    }, 800);
  }

  return (
    <section className="w-full bg-white border-t border-black/10">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-2 items-start">
          {/* LEFT — CONTENT */}
          <div className="animate-fadeUp">
            <p className="text-xs tracking-[0.28em] text-gray-500">WHOLESALE</p>

            <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-[#1e2023]">Bulk Incense Orders</h2>

            <p className="mt-6 text-sm leading-7 text-gray-600 max-w-md">
              Partner with us for bulk incense supply for temples, retailers, events, or corporate gifting.
              Premium quality, direct sourcing, and consistent fragrance batches.
            </p>

            {/* Contact Info */}
            <div className="mt-10 space-y-4 text-sm text-gray-700">
              <div>
                <p className="text-xs tracking-widest text-gray-500 mb-1">CALL US</p>
                <a href="tel:+919999999999" className="font-medium text-[#1e2023] hover:underline">
                  +91 99999 99999
                </a>
              </div>

              <div>
                <p className="text-xs tracking-widest text-gray-500 mb-1">EMAIL</p>
                <a href="mailto:bulk@kamalvallabh.com" className="font-medium text-[#1e2023] hover:underline">
                  bulk@kamalvallabh.com
                </a>
              </div>

              <div className="pt-4">
                <Link
                  href="tel:+919999999999"
                  className="
                    inline-block
                    border border-[#1e2023]
                    px-6 py-2 text-xs tracking-[0.18em]
                    transition-all duration-300
                    hover:bg-black hover:text-white
                  "
                >
                  CALL NOW
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT — FORM */}
          <div className="animate-fadeUp">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-xs tracking-widest text-gray-500 mb-2">NAME</label>
                <input
                  name="name"
                  required
                  type="text"
                  placeholder="Your full name"
                  className="w-full border border-black/20 px-4 py-3 text-sm outline-none transition focus:border-black"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs tracking-widest text-gray-500 mb-2">PHONE NUMBER</label>
                <input
                  name="phone"
                  required
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  placeholder="10-digit mobile number"
                  className="w-full border border-black/20 px-4 py-3 text-sm outline-none transition focus:border-black"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs tracking-widest text-gray-500 mb-2">EMAIL</label>
                <input
                  name="email"
                  required
                  type="email"
                  placeholder="you@example.com"
                  className="w-full border border-black/20 px-4 py-3 text-sm outline-none transition focus:border-black"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={status === "loading"}
                className="
                  w-full
                  border border-[#1e2023]
                  py-3 text-sm tracking-[0.18em]
                  transition-all duration-300
                  hover:bg-black hover:text-white
                  disabled:opacity-60
                "
              >
                {status === "loading" ? "SENDING..." : status === "success" ? "REQUEST SENT" : "SUBMIT"}
              </button>

              {status === "success" && (
                <p className="text-center text-sm text-gray-600">
                  Thank you. Our team will contact you within 24 hours.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Ultra-light animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .animate-fadeUp {
          animation: fadeUp 0.5s ease-out;
        }
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `,
        }}
      />
    </section>
  );
}
