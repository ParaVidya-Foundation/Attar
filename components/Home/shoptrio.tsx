"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ShopTrio() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const Card = ({
    src,
    alt,
    href,
    dark = false,
  }: {
    src: string;
    alt: string;
    href: string;
    dark?: boolean;
  }) => (
    <div className="group relative h-full w-full overflow-hidden border-[2px] border-[#1e2023] bg-white">
      {/* Image */}
      <Image
        src={src}
        alt={alt}
        width={1000}
        height={1000}
        priority
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />

      {/* CTA */}
      <div className="absolute bottom-6 left-6">
        <Link href={href} prefetch>
          <button className="mt-6 border-[2px] border-[#1e2023] px-6 py-2 text-sm tracking-[0.18em] text-[#1e2023] transition-all duration-300 hover:bg-black hover:text-white">
            Shop Now
          </button>
        </Link>
      </div>
    </div>
  );

  return (
    <section className="w-full bg-white">
      {/* Entrance animation */}
      <div
        className={`grid w-full transition-all duration-700 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }
        md:grid-cols-2`}
      >
        {/* LEFT LARGE */}
        <div className="h-[420px] md:h-[600px]">
          <Card
            src="/Incensehero.webp"
            alt="Luxury perfume portrait minimal white background"
            href="/collections/Incense"
          />
        </div>

        {/* RIGHT STACK */}
        <div className="grid h-[420px] md:h-[600px] grid-rows-2">
          <div>
            <Card
              src="/images/perfume-drop.jpg"
              alt="Applying perfume dropper minimal studio lighting"
              href="/shop"
            />
          </div>

          <div>
            <Card
              src="/images/perfume-bottle.jpg"
              alt="Luxury perfume bottle minimal white background studio shadow"
              href="/shop"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
