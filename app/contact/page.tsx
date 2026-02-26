import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "Contact Anand Rasa for orders, support, and fragrance guidance.",
  path: "/contact",
  type: "website",
});

export default function ContactPage() {
  return (
    <Container className="py-12 sm:py-16">
      <p className="text-xs font-semibold tracking-[0.26em] text-charcoal/70">CONTACT</p>
      <h1 className="mt-4 font-heading text-3xl tracking-tight text-ink sm:text-4xl">Contact Us</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-charcoal/85 sm:text-base">
        <p>
          For questions about orders, bulk enquiries, or fragrance recommendations, you can reach the Anand Rasa
          team using the details below.
        </p>
        <p>
          Email:{" "}
          <a href="mailto:hello@anandrasafragnance.com" className="underline-offset-4 hover:underline">
            hello@anandrasafragnance.com
          </a>
        </p>
        <p>
          Phone:{" "}
          <a href="tel:+919000000000" className="underline-offset-4 hover:underline">
            +91-90000-00000
          </a>
        </p>
      </div>
    </Container>
  );
}

