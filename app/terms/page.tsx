import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "Terms & Conditions",
  description:
    "Terms and conditions for shopping at Anand Rasa Fragrance — ordering, shipping, returns, payments & liability for attars, perfumes & agarbatti.",
  path: "/terms",
  type: "website",
});

export default function TermsPage() {
  return (
    <Container className="py-12 sm:py-16">
      <p className="text-xs font-semibold tracking-[0.26em] text-charcoal/70">LEGAL</p>
      <h1 className="mt-4 font-heading text-3xl tracking-tight text-ink sm:text-4xl">
        Terms &amp; Conditions
      </h1>
      <p className="mt-2 text-sm text-charcoal/60">Last updated: 15 March 2026</p>

      <div className="mt-8 space-y-8 text-sm leading-7 text-charcoal/85 sm:text-base">
        <section>
          <h2 className="font-heading text-xl text-ink">1. Introduction</h2>
          <p className="mt-3">
            These terms and conditions govern your use of the Anand Rasa Fragrance website
            (anandrasafragnance.com) and the purchase of products including attars, zodiac perfume
            oils, planet fragrances, agarbatti, incense sticks, and related fragrance products. By
            accessing our website or placing an order, you agree to be bound by these terms.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-ink">2. Products & Descriptions</h2>
          <p className="mt-3">
            We make every effort to display product colours, descriptions, and fragrance notes
            accurately. However, fragrance is subjective, and natural ingredients may result in
            slight batch-to-batch variations. Product images are representative and actual products
            may differ slightly in appearance.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-ink">3. Pricing & Payment</h2>
          <ul className="mt-3 list-disc pl-6 space-y-1">
            <li>All prices are listed in Indian Rupees (INR) and include applicable GST.</li>
            <li>We reserve the right to update prices without prior notice.</li>
            <li>Payments are processed securely via Razorpay (UPI, debit/credit cards, net banking).</li>
            <li>Orders are confirmed only after successful payment verification.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl text-ink">4. Ordering & Fulfilment</h2>
          <p className="mt-3">
            Once an order is placed and payment is confirmed, we begin processing your order.
            Standard domestic orders are dispatched within 2–5 business days. You will receive
            tracking information via email once your order ships.
          </p>
          <p className="mt-2">
            We reserve the right to cancel orders if products are out of stock or if we suspect
            fraudulent activity. In such cases, a full refund will be issued.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-ink">5. Shipping</h2>
          <ul className="mt-3 list-disc pl-6 space-y-1">
            <li>We ship across India. International shipping is available on request.</li>
            <li>Shipping timelines: Standard 3–7 business days; Express 1–3 business days.</li>
            <li>Free shipping may apply on select orders (see product/collection pages for details).</li>
            <li>
              Delivery timelines are estimates and may vary due to courier service conditions,
              holidays, or unforeseen circumstances.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl text-ink">6. Returns & Refunds</h2>
          <p className="mt-3">
            Due to the nature of fragrance products (hygiene and safety), we follow a limited
            returns policy:
          </p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>
              <strong>Damaged or defective items:</strong> Contact us within 48 hours of delivery
              with photos. We will arrange a replacement or full refund.
            </li>
            <li>
              <strong>Wrong item received:</strong> Contact us within 48 hours. We will arrange
              an exchange at no extra cost.
            </li>
            <li>
              <strong>Unopened products:</strong> May be returned within 7 days of delivery in
              original packaging. Return shipping costs are borne by the customer.
            </li>
            <li>
              Opened fragrance products (attars, perfume oils, incense) are not eligible for
              return unless defective.
            </li>
          </ul>
          <p className="mt-2">
            Refunds are processed within 7–10 business days to the original payment method.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-ink">7. Intellectual Property</h2>
          <p className="mt-3">
            All content on this website — including text, images, logos, product photography,
            fragrance names, and brand assets — is the intellectual property of Anand Rasa
            Fragrance. Unauthorised reproduction or distribution is prohibited.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-ink">8. Limitation of Liability</h2>
          <p className="mt-3">
            Anand Rasa Fragrance shall not be liable for any indirect, incidental, or consequential
            damages arising from the use of our website or products. Our total liability is limited
            to the purchase price of the product(s) in question.
          </p>
          <p className="mt-2">
            Fragrance products should be patch-tested before extended use, especially on sensitive
            skin. We are not liable for allergic reactions to natural ingredients.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-ink">9. Account Responsibility</h2>
          <p className="mt-3">
            You are responsible for maintaining the confidentiality of your account credentials. Any
            activity conducted through your account is your responsibility. Notify us immediately if
            you suspect unauthorised access.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-ink">10. Governing Law</h2>
          <p className="mt-3">
            These terms are governed by the laws of India. Any disputes shall be subject to the
            exclusive jurisdiction of courts in Gurugram, Haryana.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-ink">11. Contact</h2>
          <p className="mt-3">
            For questions about these terms, contact us at:{" "}
            <a href="mailto:anandrasafragnance@gmail.com" className="underline-offset-4 hover:underline">
              anandrasafragnance@gmail.com
            </a>{" "}
            or call{" "}
            <a href="tel:+919311336643" className="underline-offset-4 hover:underline">
              +91-93113-36643
            </a>
            .
          </p>
          <p className="mt-2">
            <Link href="/contact" className="underline-offset-4 hover:underline">
              Visit our Contact page →
            </Link>
          </p>
        </section>
      </div>
    </Container>
  );
}
