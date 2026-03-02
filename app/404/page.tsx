import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Page Not Found",
    description: "The page you are looking for does not exist.",
    path: "/404",
    type: "website",
  }),
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <Container className="min-h-[70vh] flex items-center justify-center py-16 sm:py-24">
      <main className="w-full max-w-3xl text-center animate-fade-in">
        {/* Label */}
        <p className="text-xs font-semibold tracking-[0.32em] text-charcoal/60">ERROR 404</p>

        {/* Heading */}
        <h1 className="mt-6 font-heading text-4xl sm:text-5xl tracking-tight text-ink">Page not found</h1>

        {/* Description */}
        <p className="mt-6 text-sm sm:text-base leading-7 text-charcoal/80 max-w-xl mx-auto">
          The page you’re looking for doesn’t exist or may have been moved. Explore our collections or return
          to the homepage to continue your journey with Anand Rasa.
        </p>

        {/* Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-none border border-black px-8 py-3 text-sm font-medium tracking-widest text-white transition-colors duration-200 hover:bg-white hover:text-black"
          >
            GO TO HOME
          </Link>

          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-none border border-black bg-white px-8 py-3 text-sm font-medium tracking-widest text-black transition-colors duration-200 hover:bg-black hover:text-white"
          >
            EXPLORE SHOP
          </Link>
        </div>

        {/* Secondary recovery links */}
        <div className="mt-10 text-xs text-neutral-500 space-x-4">
          <Link href="/collections/zodiac-attar" className="hover:underline">
            Zodiac Attars
          </Link>
          <Link href="/collections/planets-attar" className="hover:underline">
            Planet Attars
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact Support
          </Link>
        </div>
      </main>

      {/* Subtle background accent */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        main {
          animation: fade-in 0.35s ease-out;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          main {
            animation: none;
          }
        }
      `,
        }}
      />
    </Container>
  );
}
