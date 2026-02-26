import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "FAQ",
  description: "Frequently asked questions about Anand Rasa attars, shipping, and care.",
  path: "/faq",
  type: "website",
});

export default function FaqPage() {
  return (
    <Container className="py-12 sm:py-16">
      <p className="text-xs font-semibold tracking-[0.26em] text-charcoal/70">FAQ</p>
      <h1 className="mt-4 font-heading text-3xl tracking-tight text-ink sm:text-4xl">
        Frequently Asked Questions
      </h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-charcoal/85 sm:text-base">
        <p>
          This is a demo storefront. In a production store, you would answer common questions about ingredients,
          longevity, shipping times, returns, and how to layer attars.
        </p>
      </div>
    </Container>
  );
}

