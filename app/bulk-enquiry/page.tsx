// app/bulk-enquiry/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { z } from "zod";
import { pageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Phone, Mail } from "lucide-react";
import Image from "next/image";

// Try to import your admin supabase factory (adjust path if different in your repo)
let createAdminClient: any = null;
try {
  // This file exists in your repo per audit: lib/supabase/admin.ts
  // If your project uses a different helper, adjust this import.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  createAdminClient = require("@/lib/supabase/admin").createAdminClient;
} catch (err) {
  createAdminClient = null;
}

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "Bulk Enquiry | Wholesale Attars & Incense | Anand Rasa",
  description:
    "Bulk orders for attars, incense sticks, perfumes, corporate gifting, wedding hampers and temple supplies — Anand Rasa wholesale fragrances.",
  path: "/bulk-enquiry",
  type: "website",
});

/* ------------------------------
   Zod schema + helpers
   ------------------------------ */
const INDIA_PHONE = /^[6-9]\d{9}$/;

const BulkSchema = z.object({
  name: z.string().min(2, "Full name is required").max(200),
  phone: z
    .string()
    .regex(INDIA_PHONE, "Enter a valid 10-digit Indian phone number")
    .optional()
    .transform((v) => (v ? v : null)),
  email: z.string().email("Valid email required"),
  company: z
    .string()
    .max(150)
    .optional()
    .transform((v) => v || null),
  product_type: z
    .enum(["attars", "incense", "gift_sets", "custom", "mixed"])
    .optional()
    .transform((v) => v || "mixed"),
  quantity: z
    .string()
    .max(100)
    .optional()
    .transform((v) => v || null),
  city: z
    .string()
    .max(120)
    .optional()
    .transform((v) => v || null),
  state: z
    .string()
    .max(120)
    .optional()
    .transform((v) => v || null),
  message: z
    .string()
    .max(2000)
    .optional()
    .transform((v) => v || null),
  agree: z.string().optional(),
});

/** very small sanitizer for plain-text message (strip script tags, keep safe text) */
function sanitizeText(input?: string | null) {
  if (!input) return null;
  return input.replace(/<\s*script.*?>.*?<\s*\/\s*script\s*>/gi, "").trim();
}

/* ------------------------------
   Server action: handles form
   ------------------------------ */
export async function handleBulkEnquiry(formData: FormData) {
  "use server";
  // parse
  const raw = {
    name: formData.get("name")?.toString() ?? "",
    phone: formData.get("phone")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",

    product_type: (formData.get("product_type")?.toString() as any) ?? undefined,
    quantity: formData.get("quantity")?.toString() ?? undefined,
    city: formData.get("city")?.toString() ?? undefined,
    state: formData.get("state")?.toString() ?? undefined,
    message: sanitizeText(formData.get("message")?.toString() ?? undefined),
    agree: formData.get("agree")?.toString() ?? undefined,
  };

  const parsed = BulkSchema.safeParse(raw);
  if (!parsed.success) {
    // collect first error message and throw to be displayed on client if necessary
    const first = parsed.error.issues[0];
    throw new Error(first ? `${first.path.join(".")}: ${first.message}` : "Validation failed");
  }

  const data = {
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email,

    product_type: parsed.data.product_type,
    quantity: parsed.data.quantity,
    city: parsed.data.city,
    state: parsed.data.state,
    message: parsed.data.message,
    created_at: new Date().toISOString(),
  };

  let saved = false;
  let recordId: string | null = null;

  try {
    if (createAdminClient) {
      // If you have createAdminClient available, insert into Supabase table `bulk_enquiries`
      const supabase = createAdminClient();
      const insertResult = await supabase.from("bulk_enquiries").insert([data]).select("id").single();
      if (insertResult.error) {
        // fallback to webhook
        throw insertResult.error;
      }
      saved = true;
      recordId = insertResult.data?.id ?? null;
    }
  } catch (err) {
    // attempt webhook fallback
    const webhook = process.env.BULK_ENQUIRY_WEBHOOK;
    if (webhook) {
      try {
        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "bulk_enquiry", payload: data }),
        });
        saved = true;
      } catch (e) {
        // ignore - we'll continue to redirect but log
        console.error("[bulk-enquiry] webhook error", e);
      }
    } else {
      console.error("[bulk-enquiry] supabase error or not configured:", err);
    }
  }

  // optional: send a simple notification to a webhook(es)
  try {
    const notif = process.env.BULK_ENQUIRY_NOTIFY_WEBHOOK;
    if (notif) {
      await fetch(notif, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "bulk_enquiry", saved, recordId, data }),
      });
    }
  } catch (err) {
    console.error("notify webhook failed", err);
  }

  // redirect to success state (simple UX)
  redirect(`/bulk-enquiry?success=${saved ? "1" : "0"}`);
}

/* ------------------------------
   JSON-LD (Organization + Service)
   ------------------------------ */
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Anand Rasa",
  url: "https://anandrasafragnance.com",
  email: "hello@anandrasafragnance.com",
  telephone: "+919000000000",
  areaServed: "IN",
  sameAs: ["https://www.instagram.com/anandrasafragnance", "https://www.facebook.com/anandrasafragnance"],
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Bulk Fragrance Supply",
  provider: { "@type": "Organization", name: "Anand Rasa", url: "https://anandrasafragnance.com" },
  serviceOutput: "Bulk attars, incense, gift sets and custom fragrances",
  areaServed: "India",
};

/* ------------------------------
   Page (Server Component)
   ------------------------------ */
export default function BulkEnquiryPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  const success = typeof searchParams?.success !== "undefined" ? searchParams?.success === "1" : false;
  return (
    <Container className="py-12 sm:py-16">
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />

      <div className="grid gap-12 md:grid-cols-2">
        {/* Left column - content & contact */}
        <div className="max-w-xl">
          <p className="text-xs font-semibold tracking-[0.26em] text-charcoal/70">WHOLESALE</p>
          <h1 className="mt-4 font-heading text-3xl tracking-tight text-ink sm:text-4xl">
            Bulk Fragrance Orders
          </h1>

          <div className="mt-6 space-y-6 text-sm leading-7 text-charcoal/85 sm:text-base">
            <p>
              Partner with Anand Rasa for premium, consistent, and ethically sourced fragrances at scale. We
              supply temples, retailers, event organisers, and corporate gifting teams with attars, incense
              sticks, and curated gift sets.
            </p>

            <p>
              We provide:{" "}
              <strong>
                Attars, Zodiac & Planet attars, Incense sticks, Gift Sets, Custom batches, Private label
              </strong>
              .
            </p>
          </div>

          <div className="mt-8 space-y-4 text-sm text-neutral-700">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-neutral-600" />
              <div>
                <div className="text-xs text-neutral-500">CALL US</div>
                <div className="font-medium">+91 90000 00000</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-neutral-600" />
              <div>
                <div className="text-xs text-neutral-500">EMAIL</div>
                <div className="font-medium">
                  <a href="mailto:bulk@anandrasafragnance.com" className="underline-offset-4 hover:underline">
                    bulk@anandrasafragnance.com
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <a
                href="tel:+919000000000"
                className="inline-block rounded-none border border-black bg-white px-5 py-2 text-sm font-medium text-black transition-colors duration-200 hover:bg-black hover:text-white"
              >
                CALL NOW
              </a>
            </div>
          </div>
        </div>

        {/* Right column - form */}
        <div>
          {success ? (
            <div className="rounded-md border border-neutral-200 bg-white/60 p-6 text-center">
              <h2 className="font-heading text-xl text-ink">Thanks — we received your enquiry</h2>
              <p className="mt-2 text-sm text-neutral-600">
                Our wholesale team will contact you within 24 hours. Meanwhile explore our{" "}
                <a href="/collections" className="text-neutral-900 underline">
                  collections
                </a>
                .
              </p>
            </div>
          ) : (
            // Form that posts to server action
            // eslint-disable-next-line react/no-unknown-property
            <form action={handleBulkEnquiry} className="space-y-6" autoComplete="on" noValidate>
              <div>
                <label htmlFor="name" className="mb-2 block text-xs font-semibold text-neutral-600">
                  NAME
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Your full name"
                  className="w-full rounded-none border border-neutral-300 px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="mb-2 block text-xs font-semibold text-neutral-600">
                  PHONE NUMBER
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  pattern="[6-9][0-9]{9}"
                  className="w-full rounded-none border border-neutral-300 px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-xs font-semibold text-neutral-600">
                  EMAIL
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-none border border-neutral-300 px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="product_type" className="mb-2 block text-xs font-semibold text-neutral-600">
                    PRODUCT TYPE
                  </label>
                  <select
                    id="product_type"
                    name="product_type"
                    className="w-full rounded-none border border-neutral-300 px-4 py-3 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                    defaultValue="mixed"
                  >
                    <option value="attars">Attars</option>
                    <option value="incense">Incense Sticks</option>
                    <option value="gift_sets">Gift Sets</option>
                    <option value="custom">Custom Fragrance</option>
                    <option value="mixed">Mixed Order</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="quantity" className="mb-2 block text-xs font-semibold text-neutral-600">
                    QUANTITY / REQUIREMENT
                  </label>
                  <input
                    id="quantity"
                    name="quantity"
                    type="text"
                    placeholder="Eg. 500 pieces / 20 boxes"
                    className="w-full rounded-none border border-neutral-300 px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="mb-2 block text-xs font-semibold text-neutral-600">
                    CITY / STATE
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="City (optional)"
                    className="w-full rounded-none border border-neutral-300 px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-xs font-semibold text-neutral-600">
                  MESSAGE / REQUIREMENTS
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  placeholder="Provide any specifications, delivery timeline, packaging or custom fragrance notes."
                  className="w-full rounded-none border border-neutral-300 px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <input id="agree" name="agree" type="checkbox" className="h-4 w-4" />
                <label htmlFor="agree" className="text-sm text-neutral-600">
                  I agree to be contacted about this enquiry.
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full rounded-none border border-black bg-white px-6 py-3 text-sm font-medium tracking-widest transition-colors duration-200 hover:bg-black hover:text-white"
                >
                  SUBMIT
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* subtle footer micro-note */}
      <div className="mt-12 text-center text-xs text-neutral-500">
        <p>
          We respond to wholesale enquiries within 24-48 hours. For urgent orders call{" "}
          <a href="tel:+919000000000" className="underline">
            +91 90000 00000
          </a>
          .
        </p>
      </div>
    </Container>
  );
}
