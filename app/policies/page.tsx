import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "Shipping, Returns & Refund Policy",
  description:
    "Anand Rasa Fragrance shipping policy, returns & refund guidelines for attars, perfumes, agarbatti & incense orders across India.",
  path: "/policies",
  type: "website",
});

export default function PoliciesPage() {
  return (
    <Container className="py-12 sm:py-16">
      <p className="text-xs font-semibold tracking-[0.26em] text-charcoal/70">POLICIES</p>
      <h1 className="mt-4 font-heading text-4xl tracking-tight text-ink sm:text-5xl">Policies</h1>
      <p className="mt-2 text-sm text-charcoal/60">Last updated: 15 March 2026</p>

      <div className="mt-8 grid gap-10 text-sm leading-7 text-charcoal/85 sm:text-base">
        <section aria-labelledby="shipping">
          <h2 id="shipping" className="font-heading text-2xl text-ink">
            Shipping Policy
          </h2>
          <div className="mt-4 space-y-3">
            <p>
              Anand Rasa ships handcrafted attars, zodiac perfume oils, agarbatti, and spiritual incense
              across India. We also fulfil international orders on request.
            </p>
            <h3 className="font-medium text-ink">Domestic Shipping</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Standard delivery: 3–7 business days (free on eligible orders).</li>
              <li>Express delivery: 1–3 business days (charges apply).</li>
              <li>Tracking information is sent via email once your order ships.</li>
            </ul>
            <h3 className="font-medium text-ink">International Shipping</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Available upon request. Contact us for rates and timelines.</li>
              <li>Customs duties and import taxes are the customer&apos;s responsibility.</li>
              <li>We provide HS codes and commercial invoices for customs clearance.</li>
            </ul>
            <h3 className="font-medium text-ink">Packaging</h3>
            <p>
              All fragrance products are securely packaged with leak-proof seals and cushioning material
              to ensure safe delivery. Gift sets include premium branded packaging.
            </p>
          </div>
        </section>

        <section aria-labelledby="returns">
          <h2 id="returns" className="font-heading text-2xl text-ink">
            Returns & Refund Policy
          </h2>
          <div className="mt-4 space-y-3">
            <p>
              We want you to love your fragrance. Due to the personal and hygiene-sensitive nature of
              perfume oils and incense, our returns policy is as follows:
            </p>
            <h3 className="font-medium text-ink">Eligible for Return/Replacement</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Damaged in transit:</strong> Contact us within 48 hours of delivery with
                photos of the damaged product and packaging.
              </li>
              <li>
                <strong>Wrong item:</strong> Contact us within 48 hours. We will arrange a
                free exchange.
              </li>
              <li>
                <strong>Unopened products:</strong> May be returned within 7 days in original,
                sealed packaging. Return shipping costs are borne by the customer.
              </li>
            </ul>
            <h3 className="font-medium text-ink">Not Eligible for Return</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Opened attar bottles, perfume oils, or incense packs (unless defective).</li>
              <li>Products damaged due to customer mishandling or improper storage.</li>
              <li>Custom or personalised fragrance orders.</li>
            </ul>
            <h3 className="font-medium text-ink">Refund Process</h3>
            <p>
              Approved refunds are processed within 7–10 business days to your original payment
              method. You will receive an email confirmation when the refund is initiated.
            </p>
          </div>
        </section>

        <section aria-labelledby="privacy-summary">
          <h2 id="privacy-summary" className="font-heading text-2xl text-ink">
            Privacy
          </h2>
          <p className="mt-4">
            We respect your privacy. Personal data collected during checkout — name, email, phone,
            and address — is used solely for order fulfilment and customer support. We do not sell or
            share your data with third parties for marketing. Payments are processed securely via
            Razorpay. For full details, see our{" "}
            <Link href="/privacy" className="underline-offset-4 hover:underline font-medium">
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <div className="border-t border-neutral-200 pt-8">
          <p>
            Questions about our policies? Contact us at{" "}
            <a href="mailto:anandrasafragnance@gmail.com" className="underline-offset-4 hover:underline">
              anandrasafragnance@gmail.com
            </a>{" "}
            or{" "}
            <Link href="/contact" className="underline-offset-4 hover:underline">
              visit our Contact page
            </Link>
            .
          </p>
        </div>
      </div>
    </Container>
  );
}
