"use client";

import Image from "next/image";
import Link from "next/link";

export default function ComboSet() {
  return (
    <section className="w-full bg-white border-b-[2px] border-[#1e2023]/10">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-16 md:grid-cols-2 md:gap-16 md:py-20">
        {/* LEFT — Product Image */}
        <div className="relative w-full animate-fadeUp">
          <div className="relative mx-auto aspect-[4/3] w-full max-w-[640px]">
            <Image
              src="/images/discovery-kit.png" // replace image
              alt="Perfume discovery kit with multiple attar samples in premium box"
              fill
              priority
              sizes="(max-width:768px) 100vw, 50vw"
              className="object-contain"
            />
          </div>
        </div>

        {/* RIGHT — Content */}
        <div className="animate-fadeUp text-center md:text-left">
          <h2 className="font-serif text-3xl tracking-wide text-[#1e2023] sm:text-4xl">Discovery Kit</h2>

          <p className="mt-5 max-w-md text-sm leading-7 text-gray-600 md:text-base">
            The Discovery Kit is your personal journey through scent. A curated collection crafted to match
            different moods and moments — where tradition meets modern expression.
          </p>

          <Link
            href="/shop/discovery-kit"
            className="
              inline-block mt-8
              border border-[#1e2023]
              px-8 py-3
              text-xs tracking-[0.2em]
              text-[#1e2023]
              transition-all duration-300
              hover:bg-black hover:text-white
              active:scale-[0.97]
            "
          >
            SHOP NOW
          </Link>
        </div>
      </div>

      {/* Animation (lightweight, no library) */}
      <style jsx>{`
        .animate-fadeUp {
          opacity: 0;
          transform: translateY(18px);
          animation: fadeUp 0.6s ease-out forwards;
        }
        @keyframes fadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
