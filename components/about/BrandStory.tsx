"use client";

import Image from "next/image";

export default function BrandStory({
  title = "About Us",
  subtitle = "Crafting fragrances rooted in tradition, devotion, and timeless luxury.",
  imageSrc = "/about/logo.png",
}: {
  title?: string;
  subtitle?: string;
  imageSrc?: string;
}) {
  return (
    <section className="w-full overflow-hidden mb-10">
      {/* ================= HERO (Pink) ================= */}
      <div className="relative bg-[#F89ABE] text-white text-center">
        <div className="mx-auto max-w-7xl px-3 pt-12 pb-44 sm:pt-28 sm:pb-56 md:pb-64 lg:pb-80">
          <h1
            className="text-5xl sm:text-6xl md:text-7xl leading-none animate-fade-in"
            style={{
              fontFamily: '"Playfair Display", "Cormorant Garamond", serif',
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            {title}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm sm:text-base text-white/80 leading-relaxed animate-fade-in">
            {subtitle}
          </p>
        </div>

        {/* LOGO — Half Pink / Half Cream */}
        {imageSrc && (
          <div
            className="
              absolute left-1/2 bottom-0
              -translate-x-1/2 translate-y-1/2
              w-[260px]
              sm:w-[360px]
              md:w-[460px]
              lg:w-[560px]
              animate-fade-in
            "
          >
            <Image
              src={imageSrc}
              alt="Anand Rasa Logo"
              width={600}
              height={600}
              priority
              className="w-full h-auto object-contain"
            />
          </div>
        )}
      </div>

      {/* ================= CREAM SECTION ================= */}
      {/* padding-top = space for half logo height */}
      <div className="bg-[#F6F1E7] pt-20 sm:pt-56 md:pt-72 lg:pt-96 pb-16">
        <div className="mx-auto max-w-3xl px-6 text-center animate-fade-in">
          <p className="text-sm sm:text-base text-black/70 leading-relaxed">
            Anand Rasa was born from a simple belief: fragrance is not just scent — it is identity,
            devotion, and cosmic connection. We are India&apos;s astrology-inspired fragrance house,
            handcrafting luxury alcohol-free attars, zodiac perfume oils, planet fragrances,
            agarbatti, and spiritual incense rooted in Vedic tradition. Every bottle carries the
            intention of its celestial alignment — from the fiery confidence of a Mars attar to the
            serene calm of a Moon fragrance. Our perfumers blend rare natural ingredients using
            time-honoured distillation methods, creating skin-close aromas designed for meditation,
            pooja, and daily ritual. Based in Gurugram, Haryana, we honour the ancient Indian art
            of attar-making while bringing it to a modern, design-conscious audience.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-black/10" />
    </section>
  );
}
