import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "Policies",
  description: "Shipping, returns, privacy, and terms. Template policies for a frontend-only demo.",
  path: "/policies",
  type: "website",
});

export default function PoliciesPage() {
  return (
    <Container className="py-12 sm:py-16">
      <p className="text-xs font-semibold tracking-[0.26em] text-charcoal/70">POLICIES</p>
      <h1 className="mt-4 font-heading text-4xl tracking-tight text-ink sm:text-5xl">Policies</h1>
      <div className="mt-6 grid gap-4 text-sm leading-7 text-charcoal/85 sm:text-base">
        <section aria-labelledby="shipping">
          <h2 id="shipping" className="font-heading text-2xl text-ink">
            Shipping
          </h2>
          <p>
            Frontend-only demo. In production, show serviceable pincodes, ETA, and carrier tracking links.
          </p>
        </section>
        <section aria-labelledby="returns">
          <h2 id="returns" className="font-heading text-2xl text-ink">
            Returns
          </h2>
          <p>In production, define return eligibility for opened oils and hygiene-sensitive goods.</p>
        </section>
        <section aria-labelledby="privacy">
          <h2 id="privacy" className="font-heading text-2xl text-ink">
            Privacy
          </h2>
          <p>
            This template stores cart items in your browser local storage. No personal data is transmitted in
            the demo.
          </p>
        </section>
      </div>
    </Container>
  );
}
