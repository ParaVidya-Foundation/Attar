import type { Metadata } from "next";
import Link from "next/link";
import IncenseHero from "@/components/Incense/incenseHero";
import ProductCard, { type Product as CardProduct } from "@/components/shop/ProductCard";
import Image from "next/image";
import BulkOrder from "@/components/Incense/BulkOrder";
import { getProductsByCategory } from "@/lib/api/products";
import { COLLECTION_SLUGS } from "@/lib/constants/collections";
import { mapToCardProduct } from "@/lib/productMapper";
import BestSellerIncense from "@/components/Incense/BestSellerIncense";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Premium Agarbatti & Incense Sticks — Natural & Chemical-Free",
  description:
    "Shop handcrafted agarbatti and bamboo-less incense sticks for pooja, meditation & spiritual rituals. Chemical-free, Vedic-grade — made in India by Anand Rasa.",
  path: "/collections/Incense",
  type: "website",
  keywords: ["agarbatti", "incense sticks", "agarbatti for pooja", "natural incense", "bamboo-less incense", "meditation incense"],
});

export default async function IncensePage() {
  let products: CardProduct[] = [];
  try {
    products = (await getProductsByCategory(COLLECTION_SLUGS.incense)).map(mapToCardProduct);
  } catch {
    products = [];
  }

  return (
    <main className="w-full bg-white">
      {/* HERO */}
      <IncenseHero />

      {/* BEST SELLERS */}
      <section
        aria-labelledby="best-sellers"
        className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-14 md:py-16"
      >
        <header className="mb-10 text-center">
          <h2 id="best-sellers" className="font-heading text-3xl sm:text-4xl text-[#1e2023]">
            Best Sellers
          </h2>
        </header>

        <div
          className="
            grid
            gap-y-14 gap-x-8
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            xl:grid-cols-4
          "
        >
          {products.length === 0 ? (
            <p className="col-span-full text-center text-black/60 py-12">No products available.</p>
          ) : (
            products.map((product) => <ProductCard key={product.id} product={product} />)
          )}
        </div>
      </section>

      <BestSellerIncense />
      {/* EDITORIAL IMAGE BANNER */}
      <section aria-label="Incense collection showcase" className="relative w-full">
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9]">
          <Image
            src="/incense.jpeg"
            alt="Premium luxury incense collection in minimal studio lighting"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            quality={90}
          />
        </div>
      </section>

      {/* BULK ORDER (B2B SEO block) */}
      <section aria-label="Bulk incense orders">
        <BulkOrder />
      </section>

      {/* SEO Editorial Content */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="font-heading text-2xl text-center text-[#1e2023]">About Our Agarbatti</h2>
        <div className="mx-auto mt-4 h-[2px] w-12 bg-[#d4b07a]" />
        <p className="mt-6 text-sm sm:text-base leading-7 text-gray-600 text-center">
          Our agarbatti is handcrafted for devotees who want clean, honest smoke for pooja, meditation, and daily arati. Unlike mass-market sticks that rely on synthetic binders and harsh accelerants, these agarbatti blends foreground natural resins, herbs, and traditional masala methods—so the room fills with a soft, true scent rather than chemical sharpness. Whether you use agarbatti at home or in a small mandir, each stick is made to honour ritual without compromising air quality or peace of mind.
        </p>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <h2 className="font-heading text-2xl text-center text-[#1e2023]">Frequently Asked Questions</h2>
        <div className="mx-auto mt-4 h-[2px] w-12 bg-[#d4b07a]" />
        <div className="mt-8 space-y-3">
          <details className="group border border-neutral-200 bg-white p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-medium text-neutral-800">
              <span>What makes your agarbatti different from regular incense?</span>
              <svg className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </summary>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed">Our agarbatti is bamboo-less where noted in each product, formulated with natural resins and botanicals rather than cheap wood-pulp cores soaked in synthetic fragrance. We avoid the harsh chemicals common in discount incense so you get a cleaner burn and a more authentic aroma for pooja and quiet practice.</p>
          </details>
          <details className="group border border-neutral-200 bg-white p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-medium text-neutral-800">
              <span>Are your incense sticks safe for daily use?</span>
              <svg className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </summary>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed">Yes—when used with normal ventilation, our natural, non-toxic agarbatti is suitable for everyday arati and meditation. The sticks are crafted to produce comparatively low smoke and a steady, pleasant scent so you can light them regularly without overpowering your space.</p>
          </details>
          <details className="group border border-neutral-200 bg-white p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-medium text-neutral-800">
              <span>How long does each agarbatti stick burn?</span>
              <svg className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </summary>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed">Most of our agarbatti sticks burn for roughly 30–40 minutes under typical indoor conditions, giving you a full session for mantra, dhyana, or extended pooja without constant relighting.</p>
          </details>
          <details className="group border border-neutral-200 bg-white p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-medium text-neutral-800">
              <span>Can I order agarbatti in bulk for temples?</span>
              <svg className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </summary>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed">Yes. Temples, ashrams, and community organisers can request larger quantities and custom needs through our bulk enquiry page—we will follow up with pricing and lead times.</p>
          </details>
        </div>
      </section>

      {/* Internal Links */}
      <nav className="mx-auto max-w-3xl px-6 pb-16 flex flex-wrap justify-center gap-3" aria-label="Related pages">
        <Link href="/bulk-enquiry" className="border border-neutral-300 px-5 py-2.5 text-sm text-neutral-700 transition-colors hover:border-black hover:text-black">Bulk Enquiry</Link>
        <Link href="/shop" className="border border-neutral-300 px-5 py-2.5 text-sm text-neutral-700 transition-colors hover:border-black hover:text-black">Shop All</Link>
        <Link href="/faq" className="border border-neutral-300 px-5 py-2.5 text-sm text-neutral-700 transition-colors hover:border-black hover:text-black">FAQ</Link>
        <Link href="/blog" className="border border-neutral-300 px-5 py-2.5 text-sm text-neutral-700 transition-colors hover:border-black hover:text-black">Blog</Link>
      </nav>
    </main>
  );
}
