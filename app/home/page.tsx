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
      <ComboSet />
      <PureAttar />
      <TrustBar />
      <BlogSection />
    </div>
  );
}
