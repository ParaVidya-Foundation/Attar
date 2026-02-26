import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "Terms & Conditions",
  description: "Terms and conditions for using the Anand Rasa demo storefront.",
  path: "/terms",
  type: "website",
});

export default function TermsPage() {
  return (
    <Container className="py-12 sm:py-16">
      <p className="text-xs font-semibold tracking-[0.26em] text-charcoal/70">TERMS</p>
      <h1 className="mt-4 font-heading text-3xl tracking-tight text-ink sm:text-4xl">
        Terms &amp; Conditions
      </h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-charcoal/85 sm:text-base">
        <p>
          This is a demo storefront used to showcase a luxury attar UI and does not process real payments or
          orders.
        </p>
        <p>
          In a production deployment, this page should describe your legal terms, limitation of liability, and
          customer rights in clear language.
        </p>
      </div>
    </Container>
  );
}

