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
export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "Home",
  description:
    "Luxury attars crafted for calm presence. Explore heritage perfume oils with minimal, airy design and royal accents.",
  path: "/home",
  type: "website",
});

export default function HomePage() {
  return (
    <div className="">
      <Hero />
      <Showcase />
      <ShopTrio />
      <PerfumePlanets />
      <ZodiacHero />
      <ZodiacShowcase />
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
