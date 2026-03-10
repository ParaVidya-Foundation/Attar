"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import AstroForm from "@/components/AstroForm";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const reveal = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

const seoSections = [
  {
    title: "What is a Nakshatra Fragrance?",
    body: "A nakshatra perfume is a fragrance selected to reflect the lunar mansion active at birth. In the Astro Fragrance Finder, your nakshatra fragrance acts like a personal ritual scent, translating Vedic symbolism into an astrology perfume experience that feels intimate, memorable, and easy to wear.",
  },
  {
    title: "How Astrology Influences Fragrance Preferences",
    body: "Astrology perfume recommendations connect identity, mood, and sensory preference. Your Sun sign often aligns with the scent profile that supports confidence, your Moon sign points toward emotional comfort, and your birth chart perfume profile brings those layers together into a luxury zodiac fragrance selection.",
  },
  {
    title: "Planetary Perfumes in Vedic Tradition",
    body: "In Vedic astrology perfume practice, planets are associated with qualities such as radiance, calm, attraction, and devotion. A planetary perfume or zodiac fragrance can be used intentionally: a Moon scent for emotional grounding, a Venus scent for elegance, or a nakshatra perfume as part of a daily sacred fragrance ritual.",
  },
];

export default function FindFragranceExperience() {
  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-neutral-200 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.p
            variants={reveal}
            initial="hidden"
            animate="show"
            className="text-sm font-medium uppercase tracking-[0.14em] text-black"
          >
            Luxury Astrology Consultation
          </motion.p>
          <motion.h1
            variants={reveal}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.08, duration: 0.5, ease: EASE_OUT }}
            className="mt-8 text-3xl font-semibold text-black md:text-4xl"
          >
            Discover the Fragrance Written in Your Stars
          </motion.h1>
          <motion.p
            variants={reveal}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.16, duration: 0.5, ease: EASE_OUT }}
            className="mx-auto mt-8 max-w-3xl text-base leading-relaxed text-neutral-600"
          >
            Your birth chart reveals the scents that naturally resonate with your energy.
          </motion.p>
          <motion.div
            variants={reveal}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.24, duration: 0.5, ease: EASE_OUT }}
            className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/collections/nakshatra"
              className="inline-flex items-center justify-center rounded-md border border-black bg-white px-6 py-3 font-medium text-black transition hover:bg-neutral-900 hover:text-white focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              Explore Nakshatra Attars
            </Link>
          </motion.div>
        </div>
      </section>

      <AstroForm />

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="rounded-md border border-neutral-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-black">
              Astrology Perfume Guide
            </p>
            <h2 className="mt-8 text-3xl font-semibold text-black md:text-4xl">
              Luxury fragrance discovery through Vedic symbolism
            </h2>
            <div className="mt-8 grid gap-8 lg:grid-cols-3">
              {seoSections.map((section, index) => (
                <motion.article
                  key={section.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: EASE_OUT }}
                  className="rounded-md border border-neutral-200 bg-white p-6 shadow-sm"
                >
                  <h3 className="text-xl font-medium text-black">{section.title}</h3>
                  <p className="mt-4 text-base leading-relaxed text-neutral-600">{section.body}</p>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
