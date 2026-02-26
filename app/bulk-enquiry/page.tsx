import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "Bulk Enquiry",
  description: "Bulk and corporate gifting enquiries for Anand Rasa attars and incense.",
  path: "/bulk-enquiry",
  type: "website",
});

export default function BulkEnquiryPage() {
  return (
    <Container className="py-12 sm:py-16">
      <p className="text-xs font-semibold tracking-[0.26em] text-charcoal/70">BULK ENQUIRY</p>
      <h1 className="mt-4 font-heading text-3xl tracking-tight text-ink sm:text-4xl">Bulk &amp; Corporate</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-charcoal/85 sm:text-base">
        <p>
          For bulk orders, wedding hampers, or corporate gifting with Anand Rasa attars and incense, please share
          your requirements over email.
        </p>
        <p>
          Email:{" "}
          <a href="mailto:hello@anandrasafragnance.com" className="underline-offset-4 hover:underline">
            hello@anandrasafragnance.com
          </a>
        </p>
      </div>
    </Container>
  );
}

