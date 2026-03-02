"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function HeadPerson() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Parallax motion
  const parallaxUp = useTransform(scrollYProgress, [0, 1], ["-6vh", "6vh"]);
  const parallaxDown = useTransform(scrollYProgress, [0, 1], ["6vh", "-6vh"]);

  // Idle float + soft rotation
  const float = {
    y: ["0%", "-8%", "0%"],
    rotate: ["0deg", "2deg", "-2deg", "0deg"],
    transition: {
      duration: 7,
      ease: "easeInOut",
      repeat: Infinity,
    },
  };

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#F89ABE]/40 backdrop-blur-xl w-full overflow-visible py-28 md:py-36"
    >
      {/* ========================= CONTENT ========================= */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 grid gap-14 md:gap-20">
        {/* ROW 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-14">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center md:text-left"
          >
            <h2
              className={`${playfair.className} text-6xl md:text-6xl font-semibold text-black tracking-tight`}
            >
              Handpicked Attars For You
            </h2>
            <p className="mt-4 text-2xl md:text-2xl text-black/75 leading-relaxed max-w-md mx-auto md:mx-0">
              The craft of balancing top, heart, and base notes—creating a signature that feels uniquely
              yours.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative w-full max-w-[560px] mx-auto"
          >
            <Image
              src="/about/sunil_vashist.webp"
              alt="Perfume Making"
              width={900}
              height={1100}
              className="w-full h-auto object-contain"
              quality={95}
            />
          </motion.div>
        </div>

        {/* ROW 2 */}
        {/* ROW 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-14">
          {/* IMAGE — LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-1 relative w-full max-w-[560px] mx-auto"
          >
            <Image
              src="/about/soham_vashist.webp"
              alt="Choosing Perfume"
              width={900}
              height={1100}
              className="w-full h-auto object-contain"
              quality={95}
            />
          </motion.div>

          {/* TEXT — RIGHT */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="order-2 text-center md:text-left"
          >
            <h3 className={`${playfair.className} text-6xl md:text-6xl font-semibold tracking-tight`}>
              Select Your Attar
            </h3>
            <p className="mt-4 text-2xl md:text-2xl text-black/75 leading-relaxed max-w-md mx-auto md:mx-0">
              Explore refined blends—from bright citrus openings to warm, long-lasting ambers—curated for
              every mood.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ========================= FLOATING FLOWERS ========================= */}

      {/* LEFT — TOP */}
      <motion.div
        aria-hidden
        style={{ y: parallaxUp }}
        animate={float as any}
        className="pointer-events-none absolute left-[-5vw] top-[6vh] z-[2]"
      >
        <Image
          src="/about/flower-1.webp"
          alt=""
          width={260}
          height={260}
          className="w-[180px] md:w-[240px] opacity-85"
          quality={90}
        />
      </motion.div>

      {/* RIGHT — MID */}
      <motion.div
        aria-hidden
        style={{ y: parallaxDown }}
        animate={float as any}
        className="pointer-events-none absolute right-[-4vw] top-[28vh] z-[2]"
      >
        <Image
          src="/about/flower-2.webp"
          alt=""
          width={260}
          height={260}
          className="w-[170px] md:w-[230px] opacity-85"
          quality={90}
        />
      </motion.div>

      {/* RIGHT — LOWER */}
      <motion.div
        aria-hidden
        style={{ y: parallaxUp }}
        animate={float as any}
        className="pointer-events-none absolute right-[-4vw] bottom-[18vh] z-[2]"
      >
        <Image
          src="/about/flower-3.webp"
          alt=""
          width={260}
          height={260}
          className="w-[200px] md:w-[260px] opacity-85"
          quality={90}
        />
      </motion.div>

      {/* LEFT — LOWER */}
      <motion.div
        aria-hidden
        style={{ y: parallaxDown }}
        animate={float as any}
        className="pointer-events-none absolute left-[-4vw] bottom-[26vh] z-[2]"
      >
        <Image
          src="/about/flower-4.webp"
          alt=""
          width={240}
          height={240}
          className="w-[170px] md:w-[220px] opacity-85"
          quality={90}
        />
      </motion.div>

      {/* CENTER — SOFT ACCENT */}
      <motion.div
        aria-hidden
        style={{ y: parallaxUp }}
        animate={float as any}
        className="pointer-events-none absolute left-[42vw] top-[12vh] z-[1]"
      >
        <Image
          src="/about/flower-4.webp"
          alt=""
          width={200}
          height={200}
          className="w-[140px] md:w-[180px] opacity-90"
          quality={90}
        />
      </motion.div>

      {/* CENTER — LOWER */}
      <motion.div
        aria-hidden
        style={{ y: parallaxDown }}
        animate={float as any}
        className="pointer-events-none absolute left-[38vw] bottom-[10vh] z-[1]"
      >
        <Image
          src="/about/flower-1.webp"
          alt=""
          width={220}
          height={220}
          className="w-[150px] md:w-[200px] opacity-90"
          quality={90}
        />
      </motion.div>
    </section>
  );
}
