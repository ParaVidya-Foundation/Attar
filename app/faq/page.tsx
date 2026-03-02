// app/faq/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "FAQ",
  description: "Frequently asked questions about Anand Rasa attars, shipping, ordering, and care.",
  path: "/faq",
  type: "website",
});

/**
 * Enterprise FAQ page
 * - Apple-minimal UI
 * - SEO + FAQPage JSON-LD
 * - Native <details> accordions (accessible)
 * - No heavy JS; respects reduced motion
 */

const FAQS: { q: string; a: string }[] = [
  {
    q: "What products do you supply for bulk & corporate orders?",
    a:
      "We supply attars (single-note and blends), zodiac & planet attars, incense sticks, curated gift sets, private-label fragrances, and custom fragrance manufacturing for events, temples, and corporate gifting. For a full list see our " +
      `<a href="/collections" class="underline">collections</a>.`,
  },
  {
    q: "How do I place a bulk order or request a quote?",
    a: 'Use our <a href="/bulk-enquiry" class="underline">Bulk Enquiry</a> form with your requirements (product, quantity, delivery timeline). We respond to wholesale enquiries within 24–48 hours. For urgent requests, call <a href="tel:+919000000000" class="underline">+91 90000 00000</a>.',
  },
  {
    q: "What are your minimum order quantities for bulk purchases?",
    a: "Minimum quantities vary by product category. Typical minimums: attars — 50+ units, incense sticks — 100+ boxes. For precise minimums and pricing, submit a Bulk Enquiry with product and quantity details.",
  },
  {
    q: "How long does it take to fulfil a bulk order?",
    a: "Lead times depend on product and customization. Standard bulk production for stocked attars typically ships in 7–14 business days. Custom or private-label batches may take 3–6 weeks. We'll confirm timelines in the quote.",
  },
  {
    q: "Can you provide samples before I place a large order?",
    a: "Yes — sample requests are welcome. We can provide sample vials or small incense boxes for evaluation. Sample charges or shipping fees may apply, which are usually credited against the bulk order.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept UPI, major debit/credit cards (Visa, MasterCard), and bank transfers. For wholesale orders we offer proforma invoices and bank transfer payment terms. For online payments we use secure payment processors (Razorpay).",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes — we ship internationally. International shipping rates, duties, and customs fees are the customer's responsibility unless otherwise agreed. For cross-border orders we provide HS codes and packaging details on request.",
  },
  {
    q: "What are your shipping options and timelines (domestic)?",
    a: "Domestic shipping options include standard courier (2–6 business days), express (1–2 business days), and scheduled freight for large pallets. We provide tracking information once the order ships. See our <a href='/policies/shipping' class='underline'>Shipping Policy</a> for details.",
  },
  {
    q: "How are products packaged for bulk shipments?",
    a: "We offer professional commercial packaging: retail-ready boxes, bulk cartons, or custom-branded gift boxes. Packaging options, labels, and barcodes are available for private-label orders.",
  },
  {
    q: "What is your returns & refunds policy for retail and bulk orders?",
    a: "For retail purchases: returns and refunds are handled per our Returns Policy (see <a href='/legal/returns' class='underline'>Returns & Refunds</a>). For bulk or bespoke orders, returns are typically not accepted unless there is a manufacturing defect or a fulfillment error. Please contact support immediately if there is a quality issue.",
  },
  {
    q: "How can I track my order?",
    a: "After shipment we email tracking details. For retail orders use the tracking link in your order email. For wholesale shipments we provide AWB numbers and can integrate with your logistics partner.",
  },
  {
    q: "Do your fragrances contain alcohol or synthetic ingredients?",
    a: "Our formulations vary by product. Traditional attars are oil-based (no alcohol) and use natural distillations and botanicals whenever possible. We provide ingredient details on request and label allergens clearly. Contact us for full ingredient disclosures for any product.",
  },
  {
    q: "How long do your fragrances last (longevity) and how should I store them?",
    a: "Longevity varies by formula and usage — attars are concentrated and can last several hours to a full day on skin, and much longer on garments or in diffusers. Store in a cool, dark place away from direct sunlight and heat to preserve quality.",
  },
  {
    q: "Are attars safe for sensitive skin or allergies?",
    a: "People with highly sensitive skin should patch-test before applying. If you have known allergies to specific botanicals, request a full ingredient list via email. We can recommend alcohol-free, oil-based options that are gentler on skin.",
  },
  {
    q: "Can you match a fragrance or create a custom blend?",
    a: "Yes — custom and private-label fragrance services are available. Provide reference samples, scent briefs, or target notes and we will provide formulation options, prototypes, and sample testing.",
  },
  {
    q: "Do you offer white-label or private-label manufacturing?",
    a: "Yes — we offer private-label manufacturing with custom branding, packaging, and labeling. Minimums apply and we will provide a production and QC plan during quoting.",
  },
  {
    q: "How are your products authenticated as genuine Anand Rasa?",
    a: "Every product carries clear labeling, batch codes, and consistent packaging. For high-value or private-label shipments we add tamper-evident seals and batch documentation. Contact support to verify authenticity if in doubt.",
  },
  {
    q: "Do you provide marketing assets for retailers and partners?",
    a: "Yes — partners can request high-resolution product images, packaging mockups, and brand assets for in-store or online merchandising. Contact our wholesale team for a retailer asset pack.",
  },
  {
    q: "Can I get an invoice and GST details for B2B purchases?",
    a: "Yes — invoices with GST details are provided on request. For recurring corporate accounts we can enable net-30 terms subject to approval.",
  },
  {
    q: "How do I contact customer support?",
    a: "Email: <a href='mailto:hello@anandrasafragnance.com' class='underline'>hello@anandrasafragnance.com</a> — Phone: <a href='tel:+919000000000' class='underline'>+91 90000 00000</a>. Use our <a href='/contact' class='underline'>Contact</a> page for attachments or purchase references.",
  },
  {
    q: "Does Anand Rasa support corporate gifting & wedding hampers?",
    a: "Yes — we design curated gifting programs with packaging, custom inserts, and carding. Tell us your budget and guest count via the Bulk Enquiry form and we’ll propose options.",
  },
  {
    q: "Is there a warranty or guarantee on product quality?",
    a: "We stand behind our product quality. If items arrive damaged or with manufacturing defects, contact us within 7 days and we will guide replacements or credit in accordance with our policies.",
  },
  {
    q: "How do I clean or care for perfume bottles and attar applicators?",
    a: "For glass bottles and applicators rinse with warm water and dry thoroughly if reusing. Avoid harsh detergents. For reusable atomizers consult the product care label.",
  },
  {
    q: "Can I request a pickup or local delivery?",
    a: "Local pickup options may be available for nearby wholesale clients. Contact our team to arrange pickup or local courier options.",
  },
  {
    q: "How do you handle taxes, duties, and customs for international orders?",
    a: "International buyers are responsible for duties and taxes in their country. We provide commercial invoices and HS codes to facilitate customs clearance.",
  },
  {
    q: "Do you have a loyalty or reseller program?",
    a: "We offer partner discounts and reseller pricing for authorized retailers. Apply via the Bulk Enquiry form and our sales team will evaluate your application.",
  },
  {
    q: "Where can I find product care & usage guides?",
    a: "Usage and care tips are included on product pages and in our Help center; for bespoke guidance contact support for tailored recommendations.",
  },
];

export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q.replace(/<[^>]*>/g, ""),
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a.replace(/<[^>]*>/g, ""),
      },
    })),
  };

  return (
    <Container className="py-12 sm:py-16">
      {/* JSON-LD for FAQ */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <main className="max-w-6xl mx-auto">
        <p className="text-xs font-semibold tracking-[0.26em] text-charcoal/70">FAQ</p>
        <h1 className="mt-4 font-heading text-3xl tracking-tight text-ink sm:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-charcoal/85 sm:text-base">
          Answers to common questions about orders, wholesale, product care, shipping and returns — written to
          help you find what you need quickly. If you can't find an answer, contact us at{" "}
          <Link href="/contact" className="underline">
            our support page
          </Link>
          .
        </p>

        {/* Accordion list */}
        <section className="mt-8 grid gap-4">
          {FAQS.map((faq, idx) => (
            <details
              key={idx}
              className="group rounded-none border border-neutral-200 bg-white p-5 transition-shadow duration-200"
            >
              <summary
                className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-medium text-neutral-800 outline-none"
                aria-expanded="false"
              >
                <span dangerouslySetInnerHTML={{ __html: faq.q }} />
                <svg
                  className="h-4 w-4 shrink-0 transform transition-transform duration-200 group-open:rotate-180"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 8l5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </summary>

              <div
                className="mt-3 prose max-w-none text-sm text-charcoal/85"
                dangerouslySetInnerHTML={{ __html: faq.a }}
              />
            </details>
          ))}
        </section>

        {/* CTA / support */}
        <div className="mt-10 flex flex-col items-center gap-4 border-t border-neutral-100 pt-8">
          <p className="text-sm text-neutral-600 max-w-2xl text-center">
            Didn't find an answer? Our support team is happy to help with product recommendations, bulk orders
            and partner programs.
          </p>
          <div className="flex gap-3">
            <Link
              href="/contact"
              className="inline-block rounded-none border border-black bg-white px-6 py-3 text-sm font-medium tracking-widest transition-colors duration-200 hover:bg-black hover:text-white"
            >
              Contact Support
            </Link>
            <Link
              href="/bulk-enquiry"
              className="inline-block rounded-none border border-black bg-white px-6 py-3 text-sm font-medium tracking-widest transition-colors duration-200 hover:bg-black hover:text-white"
            >
              Bulk Enquiry
            </Link>
          </div>
        </div>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* subtle visual polish */
        details[open] summary {
          color: #0f1720; /* text-ink */
        }
        /* animate the chevron - depends on UA open state; respects prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          svg {
            transition: none !important;
          }
        }

        /* Minimal "prose" typography tweaks for answers */
        .prose p {
          margin: 0 0 0.75rem 0;
        }
        .prose a {
          color: inherit;
          text-decoration: underline;
        }
      `,
        }}
      />
    </Container>
  );
}
