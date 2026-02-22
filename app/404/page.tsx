import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = pageMetadata({
  title: "404",
  description: "Page not found.",
  path: "/404",
  type: "website",
});

export default function NotFoundPage() {
  return (
    <Container className="py-16">
      <p className="text-xs font-semibold tracking-[0.26em] text-charcoal/70">404</p>
      <h1 className="mt-4 font-heading text-4xl tracking-tight text-ink">Page not found</h1>
      <p className="mt-4 text-sm leading-7 text-charcoal/85">
        The page you requested does not exist. Return to the shop or the home page.
      </p>
      <div className="mt-8 flex gap-3">
        <Link className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream" href="/home">
          Home
        </Link>
        <Link
          className="rounded-full border border-ash/60 bg-white/50 px-6 py-3 text-sm font-semibold text-ink"
          href="/shop"
        >
          Shop
        </Link>
      </div>
    </Container>
  );
}
