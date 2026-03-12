"use client";

import Image from "next/image";
import Link from "next/link";

const categories = [
  { title: "Planet Attar", image: "/PlanetHero.webp", link: "/collections/planets" },
  { title: "Zodiac Attar", image: "/PlanetHero.webp", link: "/collections/zodiac" },
  { title: "Nakshatra Attar", image: "/NakshatraGif.gif", link: "/collections/nakshatra" },
  { title: "Chakra Attar", image: "/chakra.webp", link: "/collections/Chakra-attar" },
  { title: "Stress Relief Attar", image: "/stress/stress_calm.webp", link: "/collections/stress" },
  { title: "Love Attar", image: "/love.webp", link: "/collections/Love-attar" },
  { title: "Incense Sticks", image: "/incense.jpg", link: "/collections/Incense" },
  { title: "Discovery Kit", image: "/images/discovery-kit.png", link: "/discovery" },
];

export default function CategoryGrid() {
  return (
    <section className="bg-white w-full px-4 md:px-8 py-12">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((cat, i) => (
          <Link key={i} href={cat.link} className="group relative block overflow-hidden">
            {/* Image */}
            <div className="relative w-full aspect-[3/2]">
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                priority={i < 2}
                sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/35 transition-opacity duration-500 group-hover:bg-black/50" />

              {/* Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
                <h3 className="shadow-md text-sm md:text-lg tracking-widest font-semibold">{cat.title}</h3>

                <span className="mt-2 text-xs md:text-sm border-b border-white/70 pb-[2px]">Explore</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
