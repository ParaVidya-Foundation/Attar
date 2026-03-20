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
import ScrollVideo from "@/components/Home/ScrollVideo";
import CategoryGrid from "@/components/Home/CategoryGrid";
import FindYourFragrance from "@/components/Home/findyourfragrance";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Spiritual Attars, Zodiac Perfumes & Agarbatti — Anand Rasa Fragrance",
  description:
    "India's astrology-inspired fragrance house. Shop luxury alcohol-free attars, zodiac perfume oils, planet fragrances, agarbatti & spiritual incense — handcrafted for meditation, pooja & daily ritual.",
  path: "/home",
  type: "website",
  keywords: ["attar", "zodiac perfume", "agarbatti", "spiritual fragrance", "perfume India", "astrology fragrance"],
});

export default async function HomePage() {
  return (
    <div className="">
      <Hero />
      <CategoryGrid />
      <Showcase />
      <ShopTrio />
      <FindYourFragrance />
      <PerfumePlanets />
      {/* <ScrollVideo /> */}
      <ZodiacHero />
      <ZodiacShowcase />
      <Link
        href="/collections/Incense"
        className="
        group block w-full overflow-hidden bg-white border-b-[2px] border-[#1e2023]
      "
        aria-label="Shop Incense"
      >
        {/* 16:9 Container — prevents layout shift */}
        <div className="relative w-full aspect-[16/9]">
          <Image
            src="/incense.jpeg"
            alt="Luxury Incense Collection"
            fill
            priority
            sizes="(max-width:640px) 100vw, (max-width:1024px) 100vw, 100vw"
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
