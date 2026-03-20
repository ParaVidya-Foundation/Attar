import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Analytics } from "@vercel/analytics/react";
import { poppins, caudex } from "@/app/fonts";
import "@/styles/globals.css";
import { BRAND, LOGO_PATH, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { getSiteUrl } from "@/lib/env";
import { CartProvider } from "@/components/cart/CartProvider";
import { RazorpayScript } from "@/components/system/RazorpayScript";
import { SkipToContent } from "@/components/ui/SkipToContent";
import { ScrollToTop } from "@/components/navigation/ScrollToTop";
import { BrowserDiagnostics } from "@/components/system/BrowserDiagnostics";
import Header from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";
import FloatingContact from "@/components/contact/FloatingContact";

const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer").then((m) => m.CartDrawer), {
  loading: () => null,
});

function getMetadata(): Metadata {
  let siteUrl: string;
  try {
    siteUrl = getSiteUrl();
  } catch {
    siteUrl = BRAND.url;
  }
  return {
    metadataBase: new URL(siteUrl),
    title: { default: BRAND.homeTitle, template: `%s — ${BRAND.name}` },
    description: BRAND.homeDescription,
    applicationName: BRAND.nameSeo,
    icons: {
      icon: LOGO_PATH,
      apple: LOGO_PATH,
    },
    openGraph: {
      type: "website",
      siteName: BRAND.nameSeo,
      title: BRAND.homeTitle,
      description: BRAND.homeDescription,
      locale: BRAND.locale,
      url: siteUrl,
      images: [{ url: BRAND.ogImage, width: 1200, height: 630, alt: BRAND.nameSeo }],
    },
    twitter: {
      card: "summary_large_image",
      title: BRAND.homeTitle,
      description: BRAND.homeDescription,
      images: [BRAND.ogImage],
    },
    robots: "index, follow",
  };
}

export const metadata: Metadata = getMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgLd = organizationJsonLd();
  const webLd = websiteJsonLd();
  return (
    <html
      lang="en-IN"
      className={`${poppins.variable} ${caudex.variable}`}
      style={
        {
          "--font-heading": '"Poppins", ui-sans-serif, system-ui, sans-serif',
          "--font-body": '"Caudex", ui-serif, Georgia, serif',
        } as CSSProperties
      }
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://checkout.razorpay.com" crossOrigin="" />
        <link rel="preconnect" href="https://api.razorpay.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webLd) }}
        />
        <RazorpayScript />
      </head>
      <body className="font-body bg-cream text-ink antialiased">
        <CartProvider>
          <BrowserDiagnostics />
          <Suspense fallback={null}>
            <FloatingContact />
            <ScrollToTop />
          </Suspense>
          <SkipToContent />
          <Header />
          <main id="content" className="min-h-[70vh]">
            {children}
          </main>
          <Footer />
          <CartDrawer />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
