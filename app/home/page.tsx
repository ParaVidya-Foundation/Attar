import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Hero from "@/components/Home/Hero";
import ShopTrio from "@/components/Home/shoptrio";
import TrustBar from "@/components/Home/TrustBar";
import Showcase from "@/components/Home/showcase";
import PerfumePlanets from "@/components/Home/PerfumePlanets";
import ZodiacHero from "@/components/Home/ZodiacHero";
import ZodiacShowcase from "@/components/Home/ZodiacShowcase";
import ComboSet from "@/components/Home/ComboSet";
import PureAttar from "@/components/Home/pureattar";
import BlogSection from "@/components/Home/BlogSection";
import Link from "next/link";
import Image from "next/image";
import { getFeaturedProducts, getProductsByCategory } from "@/lib/api/products";
import { COLLECTION_SLUGS } from "@/lib/constants/collections";
import type { ProductDisplay } from "@/types/product";
import type { ShowcaseProduct } from "@/components/Home/showcase";
import type { ZodiacShowcaseProduct } from "@/components/Home/ZodiacShowcase";

export const revalidate = 60;

function toShowcaseProduct(p: ProductDisplay): ShowcaseProduct {
  const firstVariant = p.variants?.[0];
  return {
    id: p.id,
    name: p.name,
    type: p.category_slug ? p.category_slug.charAt(0).toUpperCase() + p.category_slug.slice(1) : "Attar",
    description: p.short_description ?? p.description ?? "",
    price: `₹${(p.price / 100).toLocaleString("en-IN")}`,
    size: firstVariant ? `${firstVariant.size_ml} ml` : undefined,
    image: p.images?.[0]?.url ?? `/products/${p.slug}.webp`,
    href: `/product/${p.slug}`,
  };
}

export const metadata: Metadata = pageMetadata({
  title: "Home",
  description:
    "Luxury attars crafted for calm presence. Explore heritage perfume oils with minimal, airy design and royal accents.",
  path: "/home",
  type: "website",
});

export default async function HomePage() {
  const [featuredProducts, zodiacProducts] = await Promise.all([
    getFeaturedProducts(),
    getProductsByCategory(COLLECTION_SLUGS.zodiac),
  ]);
  console.log("[PAGE] home featured received:", featuredProducts?.length ?? "null/undefined");
  console.log("[PAGE] home zodiac received:", zodiacProducts?.length ?? "null/undefined");
  const showcaseProducts = featuredProducts.length > 0 ? featuredProducts.map(toShowcaseProduct) : (await getProductsByCategory(COLLECTION_SLUGS.planets)).slice(0, 8).map(toShowcaseProduct);
  const zodiacShowcaseProducts = zodiacProducts.map(toShowcaseProduct) as ZodiacShowcaseProduct[];

  return (
    <div className="">
      <Hero />
      <Showcase products={showcaseProducts} />
      <ShopTrio />
      <PerfumePlanets />
      <ZodiacHero />
      <ZodiacShowcase products={zodiacShowcaseProducts} />
      <Link
        href="/shop/incense"
        className="
        group block w-full overflow-hidden bg-white border-b-[2px] border-[#1e2023]
      "
        aria-label="Shop Incense"
      >
        {/* 16:9 Container — prevents layout shift */}
        <div className="relative w-full aspect-[16/9]">
          <Image
            src="/incense.jpg"
            alt="Luxury Incense Collection"
            fill
            priority
            sizes="100vw"
            className="
            object-contain
            transition-transform duration-700 ease-out
            group-hover:scale-[1.02]
            will-change-transform
          "
            quality={100}
          />
        </div>
      </Link>
      <ComboSet />
      <PureAttar />
      <TrustBar />
      <BlogSection />
    </div>
  );
}
