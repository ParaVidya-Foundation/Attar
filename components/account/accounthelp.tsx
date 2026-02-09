"use client";

import Link from "next/link";

export default function AccountHelp() {
  return (
    <div>
      {" "}
      <div className="mt-10 rounded-2xl border border-ash/50 bg-cream/80 p-5">
        <h3 className="text-xs font-bold tracking-[0.2em] text-ink">A HELPING HAND?</h3>
        <p className="mt-3 text-sm leading-6 text-charcoal/85">
          If you have any queries or need help with your order, our customer service team are on hand to
          assist from Monday - Friday: 10am - 6pm GMT.
        </p>
        <div className="mt-4 flex gap-4 text-sm">
          <Link
            href="/policies#faq"
            className="font-medium text-ink underline decoration-gold/60 underline-offset-4 hover:decoration-ink"
          >
            FAQS
          </Link>
          <Link
            href="/contact"
            className="font-medium text-ink underline decoration-gold/60 underline-offset-4 hover:decoration-ink"
          >
            CONTACT US
          </Link>
        </div>
      </div>
    </div>
  );
}
