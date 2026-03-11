"use client";

import Image from "next/image";
import Link from "next/link";

export default function DiscountPosterIncense() {
  return (
    <section className="w-full bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <Link
          href="/gift-sets"
          className="group relative block w-full overflow-hidden border border-neutral-200"
        >
          <div className="relative w-full aspect-video">
            <Image
              src="/products/incense-sleeve.jpg"
              alt="Luxury incense gift sets discount"
              fill
              priority
              sizes="(max-width:768px) 100vw, (max-width:1280px) 90vw, 1200px"
              className="
                object-cover
                transition-transform
                duration-[1200ms]
                ease-out
                group-hover:scale-105
              "
            />
          </div>
        </Link>
      </div>
    </section>
  );
}
