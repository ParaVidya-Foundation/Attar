import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Inter, Playfair_Display } from "next/font/google";
import "@/styles/globals.css";
import { BRAND } from "@/lib/seo";
import { CartProvider } from "@/components/cart/CartProvider";
import { SkipToContent } from "@/components/ui/SkipToContent";
import Header from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";

const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer").then((m) => m.CartDrawer), {
  loading: () => null,
});

const inter = Inter({ variable: "--font-body", subsets: ["latin"], display: "swap" });
const playfair = Playfair_Display({ variable: "--font-serif", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),
  title: { default: `${BRAND.name} — Luxury Attars`, template: `%s — ${BRAND.name}` },
  description: BRAND.description,
  applicationName: BRAND.name,
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    title: `${BRAND.name} — Luxury Attars`,
    description: BRAND.description,
    locale: BRAND.locale,
    url: BRAND.url,
    images: [{ url: BRAND.ogImage, width: 1200, height: 630, alt: BRAND.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — Luxury Attars`,
    description: BRAND.description,
    images: [BRAND.ogImage],
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body className={`${inter.variable} ${playfair.variable} bg-cream text-ink antialiased`}>
        <CartProvider>
          <SkipToContent />
          <Header />
          <main id="content" className="min-h-[70vh]">
            {children}
          </main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
