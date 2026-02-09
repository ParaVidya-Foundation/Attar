"use client";

import Image from "next/image";
import Link from "next/link";

type Zodiac = {
  id: string;
  image: string;
  href: string;
  alt: string;
};

const ZODIACS: Zodiac[] = [
  { id: "aries", image: "/zodiac/aries.jpg", href: "/zodiac/aries", alt: "Aries zodiac fragrance" },
  { id: "taurus", image: "/zodiac/taurus.jpg", href: "/zodiac/taurus", alt: "Taurus zodiac fragrance" },
  { id: "gemini", image: "/zodiac/gemini.jpg", href: "/zodiac/gemini", alt: "Gemini zodiac fragrance" },
  { id: "cancer", image: "/zodiac/cancer.jpg", href: "/zodiac/cancer", alt: "Cancer zodiac fragrance" },
  { id: "leo", image: "/zodiac/leo.jpg", href: "/zodiac/leo", alt: "Leo zodiac fragrance" },
  { id: "virgo", image: "/zodiac/virgo.jpg", href: "/zodiac/virgo", alt: "Virgo zodiac fragrance" },
  { id: "libra", image: "/zodiac/libra.jpg", href: "/zodiac/libra", alt: "Libra zodiac fragrance" },
  { id: "scorpio", image: "/zodiac/scorpio.jpg", href: "/zodiac/scorpio", alt: "Scorpio zodiac fragrance" },
  {
    id: "sagittarius",
    image: "/zodiac/sagittarius.jpg",
    href: "/zodiac/sagittarius",
    alt: "Sagittarius zodiac fragrance",
  },
  {
    id: "capricorn",
    image: "/zodiac/capricorn.jpg",
    href: "/zodiac/capricorn",
    alt: "Capricorn zodiac fragrance",
  },
  {
    id: "aquarius",
    image: "/zodiac/aquarius.jpg",
    href: "/zodiac/aquarius",
    alt: "Aquarius zodiac fragrance",
  },
  { id: "pisces", image: "/zodiac/pisces.jpg", href: "/zodiac/pisces", alt: "Pisces zodiac fragrance" },
];

export default function ZodiacCollection() {
  return (
    <div className="w-full bg-white">
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {ZODIACS.map((zodiac, index) => (
          <Link key={zodiac.id} href={zodiac.href} className="group relative aspect-square overflow-hidden">
            <Image
              src={zodiac.image}
              alt={zodiac.alt}
              fill
              sizes="(max-width:640px) 100vw,
                     (max-width:1024px) 50vw,
                     25vw"
              className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              priority={index < 4} // optimize above-the-fold
            />

            {/* Premium hover overlay */}
            <div className="absolute inset-0 bg-black/0 transition duration-400 group-hover:bg-black/5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
