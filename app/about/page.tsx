import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "About Anand Ras: a minimal luxury attar house inspired by heritage craft and modern restraint.",
  path: "/about",
  type: "website",
});

export default function AboutPage() {
  return (
    <Container className="py-12 sm:py-16">
      <p className="text-xs font-semibold tracking-[0.26em] text-charcoal/70">ABOUT</p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-5xl">Anand Ras</h1>
      <div className="mt-6 grid gap-4 text-sm leading-7 text-charcoal/85 sm:text-base">
        <p>
          Anand Ras is a frontend-only, production-ready template for a luxury attar brand. It is
          intentionally minimal: cream lightness, indigo ink depth, and antique-gold accents.
        </p>
        <p>
          The product catalog and journal are mocked using local JSON files, but the architecture is ready for
          a real backend: replace the JSON loader in{" "}
          <code className="rounded bg-white/60 px-2 py-1">lib/fetchers.ts</code> with API calls.
        </p>
        <p>
          Our design philosophy: calm typography, semantic HTML, accessible components, and SEO-first
          structure with metadata and JSON-LD for product and article pages.
        </p>
      </div>
    </Container>
  );
}
