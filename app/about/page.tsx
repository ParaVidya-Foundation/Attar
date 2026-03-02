import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Image from "next/image";
import BrandStory from "@/components/about/BrandStory";
import HeadPerson from "@/components/about/HeadPerson";
import OurMission from "@/components/about/ouraim";

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
    <div className="relative">
      {/* Brand Story Section */}
      <BrandStory />

      {/* Border + Head Section */}
      <section className="relative w-full">
        {/* Top Paper Border */}
        <div className="pointer-events-none absolute left-0 right-0 -top-[115px] z-40">
          <div className="relative w-full h-[230px]">
            <Image
              src="/about/Paper-Border.webp"
              alt="Paper Border Top"
              fill
              priority
              sizes="100vw"
              className="object-fill"
            />
          </div>
        </div>

        {/* Content (HeadPerson should be interactive) */}
        <div className="relative z-30">
          <HeadPerson />
        </div>

        {/* Bottom Paper Border */}
        <div className="pointer-events-none absolute left-0 right-0 -bottom-[105px] z-40 rotate-180">
          <div className="relative w-full h-[230px]">
            <Image
              src="/about/Paper-Border.webp"
              alt="Paper Border Bottom"
              fill
              sizes="100vw"
              className="object-fill"
            />
          </div>
        </div>
      </section>
      <OurMission />
    </div>
  );
}
