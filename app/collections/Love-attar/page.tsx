import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import ComingSoon from "@/components/comingsoon";

export const metadata: Metadata = pageMetadata({
  title: "Love Attars — Romantic & Sensual Perfume Oils",
  description:
    "Romantic attar perfume oils crafted for love, attraction & sensuality. Alcohol-free luxury fragrance oils with rose, jasmine & musk — Anand Rasa.",
  path: "/collections/Love-attar",
  type: "website",
  keywords: ["love attar", "romantic perfume", "sensual fragrance", "attraction perfume oil", "rose attar"],
});

export default function LoveAttarPage() {
  return (
    <div className="">
      <ComingSoon />
    </div>
  );
}
