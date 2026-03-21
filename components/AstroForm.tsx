"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import SignCard from "@/components/SignCard";
import ProductCard from "@/components/shop/ProductCard";
import { mapToCardProduct } from "@/lib/productMapper";
import type { AstroApiResponse, Gender } from "@/lib/types/astrology";
import type { ProductDisplay } from "@/types/product";

type FormState = {
  name: string;
  email: string;
  dob: string;
  time: string;
  city: string;
  gender: Gender;
};

type CitySuggestion = {
  suggestions: string[];
};

type ProductSignal = "sun" | "moon" | "nakshatra" | "venus" | "general";

type FragranceRevealCard = {
  key: Exclude<ProductSignal, "general">;
  eyebrow: string;
  explanation: string;
  product: ProductDisplay | null;
};

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  dob: "",
  time: "",
  city: "",
  gender: "male",
};

const PROCESSING_STEPS = [
  "Calculating planetary positions...",
  "Analyzing your birth star...",
  "Matching fragrances with your cosmic energy...",
] as const;

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

function normalize(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getSunProfile(sign: string): string {
  const profiles: Record<string, string> = {
    aries:
      "Your Sun sign shapes identity and confidence. Aries energy expresses itself through initiative, courage, and fragrances with a decisive, radiant character.",
    taurus:
      "Your Sun sign shapes identity and confidence. Taurus energy prefers sensory richness, calm authority, and scents that feel grounded, smooth, and enduring.",
    gemini:
      "Your Sun sign shapes identity and confidence. Gemini energy thrives on freshness, movement, and fragrances that feel bright, articulate, and contemporary.",
    cancer:
      "Your Sun sign shapes identity and confidence. Cancer energy values warmth, intuition, and scents that feel soft, protective, and emotionally familiar.",
    leo:
      "Your Sun sign shapes identity and confidence. Leo energy seeks luminous elegance, presence, and fragrances that feel regal, expressive, and memorable.",
    virgo:
      "Your Sun sign shapes identity and confidence. Virgo energy is refined through clarity, restraint, and scents with polished structure and quiet precision.",
    libra:
      "Your Sun sign shapes identity and confidence. Libra energy is aesthetic and harmonious, best mirrored by balanced fragrances with grace and social charm.",
    scorpio:
      "Your Sun sign shapes identity and confidence. Scorpio energy is magnetic and layered, drawn to scents with depth, mystery, and a strong inner pulse.",
    sagittarius:
      "Your Sun sign shapes identity and confidence. Sagittarius energy is expansive and spirited, reflected in fragrances that feel uplifting, open, and adventurous.",
    capricorn:
      "Your Sun sign shapes identity and confidence. Capricorn energy values distinction, discipline, and fragrances that project composure and timeless strength.",
    aquarius:
      "Your Sun sign shapes identity and confidence. Aquarius energy is original and future-facing, suited to fragrances that feel unusual, airy, and intelligent.",
    pisces:
      "Your Sun sign shapes identity and confidence. Pisces energy is imaginative and fluid, resonating with fragrances that feel gentle, artistic, and dreamlike.",
  };

  return (
    profiles[normalize(sign)] ??
    "Your Sun sign reflects identity and confidence, revealing how you naturally project yourself into the world."
  );
}

function getMoonProfile(sign: string): string {
  const profiles: Record<string, string> = {
    aries:
      "Your Moon sign rules emotions and your inner world. Aries Moon energy restores balance through grounding scents that steady passion and direct feeling.",
    taurus:
      "Your Moon sign rules emotions and your inner world. Taurus Moon energy feels safe with smooth, comforting fragrances that create emotional ease.",
    gemini:
      "Your Moon sign rules emotions and your inner world. Gemini Moon energy benefits from crisp, airy notes that bring clarity and movement to the mind.",
    cancer:
      "Your Moon sign rules emotions and your inner world. Cancer Moon energy is deeply intuitive and finds calm in nurturing, familiar scent profiles.",
    leo:
      "Your Moon sign rules emotions and your inner world. Leo Moon energy opens through warm, generous fragrances that support joy and confidence.",
    virgo:
      "Your Moon sign rules emotions and your inner world. Virgo Moon energy relaxes with clean, measured fragrances that reduce mental noise.",
    libra:
      "Your Moon sign rules emotions and your inner world. Libra Moon energy returns to center with balanced fragrances that feel graceful and serene.",
    scorpio:
      "Your Moon sign rules emotions and your inner world. Scorpio Moon energy prefers cocooning depth, with scents that hold emotion without overwhelming it.",
    sagittarius:
      "Your Moon sign rules emotions and your inner world. Sagittarius Moon energy feels best with bright fragrances that create space and optimism.",
    capricorn:
      "Your Moon sign rules emotions and your inner world. Capricorn Moon energy is soothed by elegant, restrained fragrances that support steadiness.",
    aquarius:
      "Your Moon sign rules emotions and your inner world. Aquarius Moon energy responds to refined, modern scents that create emotional perspective.",
    pisces:
      "Your Moon sign rules emotions and your inner world. Pisces Moon energy is nourished by tranquil fragrances that soften sensitivity and invite calm.",
  };

  return (
    profiles[normalize(sign)] ??
    "Your Moon sign reflects emotions and your inner world, showing how you seek comfort, calm, and restoration."
  );
}

function getNakshatraProfile(nakshatra: string, pada: number): string {
  return `Your Nakshatra reveals your soul's rhythm. ${nakshatra} Nakshatra, Pada ${pada}, points to the subtle instinct behind how you move through relationships, desire, and daily ritual.`;
}

function getProductSignal(product: { name: string; slug: string }, result: AstroApiResponse): ProductSignal {
  const text = normalize(`${product.name} ${product.slug}`);

  if (text.includes(normalize(result.nakshatra))) return "nakshatra";
  if (text.includes(normalize(result.sunSign))) return "sun";
  if (text.includes(normalize(result.moonSign))) return "moon";
  if (text.includes("venus") || text.includes("shukra")) return "venus";

  return "general";
}

function buildRevealCards(result: AstroApiResponse | null): FragranceRevealCard[] {
  if (!result) return [];

  const pool = [...result.recommendedProducts];
  const usedIds = new Set<string>();

  const pickProduct = (signal: Exclude<ProductSignal, "general">) => {
    const exact = pool.find((product) => !usedIds.has(product.id) && getProductSignal(product, result) === signal);
    if (exact) {
      usedIds.add(exact.id);
      return exact;
    }

    const fallback = pool.find((product) => !usedIds.has(product.id));
    if (fallback) {
      usedIds.add(fallback.id);
      return fallback;
    }

    return null;
  };

  return [
    {
      key: "sun",
      eyebrow: "Sun Sign Fragrance",
      explanation: `This fragrance reflects the radiant energy of your ${result.sunSign} Sun sign and enhances your natural confidence.`,
      product: pickProduct("sun"),
    },
    {
      key: "moon",
      eyebrow: "Moon Sign Fragrance",
      explanation: `This fragrance supports the emotional tone of your ${result.moonSign} Moon sign with calm, softness, and balance.`,
      product: pickProduct("moon"),
    },
    {
      key: "nakshatra",
      eyebrow: "Nakshatra Fragrance",
      explanation: `This fragrance is chosen to echo the soul rhythm of ${result.nakshatra} Nakshatra and deepen your personal ritual.`,
      product: pickProduct("nakshatra"),
    },
    {
      key: "venus",
      eyebrow: "Shukra Fragrance",
      explanation:
        "This fragrance channels Shukra (Venus), enhancing attraction, refinement, and the sense of quiet luxury around you.",
      product: pickProduct("venus"),
    },
  ];
}

function fallbackEmailFromName(name: string): string {
  const safe = normalize(name).replace(/\s+/g, ".").replace(/[^a-z0-9.]/g, "").slice(0, 24) || "guest";
  return `${safe}.astro@anandrasa.local`;
}

function toGender(value: string | null): Gender {
  if (value === "male" || value === "female" || value === "other") return value;
  return "male";
}

export default function AstroForm() {
  const searchParams = useSearchParams();
  const hasAutoSubmittedRef = useRef(false);
  const resultSectionRef = useRef<HTMLDivElement | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AstroApiResponse | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const city = form.city.trim();
    if (city.length < 3) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/astrology/cities?q=${encodeURIComponent(city)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          setSuggestions([]);
          return;
        }

        const payload = (await response.json()) as CitySuggestion;
        setSuggestions(payload.suggestions ?? []);
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [form.city]);

  useEffect(() => {
    if (!loading) {
      setLoadingStep(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingStep((current) => (current + 1) % PROCESSING_STEPS.length);
    }, 1100);

    return () => clearInterval(interval);
  }, [loading]);

  const fragranceRevealCards = useMemo(() => buildRevealCards(result), [result]);

  const primaryCtaHref = result?.recommendedProducts[0]?.slug
    ? `/product/${result.recommendedProducts[0].slug}`
    : "/shop";

  const submitAstroForm = useCallback(async (payload: FormState) => {
    setForm(payload);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const requestPayload = {
        name: payload.name,
        email: payload.email,
        dob: payload.dob,
        time: payload.time,
        city: payload.city,
        gender: payload.gender,
      };

      const [response] = await Promise.all([
        fetch("/api/astrology", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestPayload),
        }),
        new Promise((resolve) => setTimeout(resolve, 3400)),
      ]);

      const responsePayload = (await response.json()) as AstroApiResponse | { error: string };
      if (!response.ok) {
        const serverError =
          "error" in responsePayload && typeof responsePayload.error === "string"
            ? responsePayload.error
            : "Unable to compute astrology data";
        setError(serverError);
        return;
      }

      setResult(responsePayload as AstroApiResponse);
      requestAnimationFrame(() => {
        resultSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "";
      if (
        message.toLowerCase().includes("city") ||
        message.toLowerCase().includes("latitude") ||
        message.toLowerCase().includes("location")
      ) {
        setError("We could not find that city. Please try again.");
      } else {
        setError("Sorry, we could not calculate your profile right now. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasAutoSubmittedRef.current) return;
    const dynamicSearch =
      searchParams.toString() || (typeof window !== "undefined" ? window.location.search.slice(1) : "");
    const params = new URLSearchParams(dynamicSearch);
    if (params.get("source") !== "product-page") return;

    const name = params.get("name")?.trim() ?? "";
    const dob = params.get("dob")?.trim() ?? "";
    const time = params.get("time")?.trim() ?? "";
    const city = params.get("city")?.trim() ?? "";
    const gender = toGender(params.get("gender"));
    const email = params.get("email")?.trim() || fallbackEmailFromName(name);

    if (!name || !dob || !time || !city) return;

    const prefilledForm: FormState = { name, email, dob, time, city, gender };
    setForm(prefilledForm);
    hasAutoSubmittedRef.current = true;
    void submitAstroForm(prefilledForm);
  }, [searchParams, submitAstroForm]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitAstroForm(form);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <motion.section
        id="cosmic-profile-form"
        variants={sectionVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="overflow-hidden rounded-md border border-neutral-200 bg-white shadow-sm"
      >
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          <div className="border-b border-neutral-200 px-6 py-10 lg:border-b-0 lg:border-r lg:px-10">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-sm font-medium uppercase tracking-[0.14em] text-black">Private Consultation</p>
                <h2 className="text-3xl font-semibold text-black md:text-4xl">Your Cosmic Profile</h2>
                <p className="text-base leading-relaxed text-neutral-600">
                  These details allow us to calculate your exact birth chart.
                </p>
              </div>
              <div className="grid gap-4">
                <div className="rounded-md border border-neutral-200 p-6">
                  <p className="text-sm font-medium text-black">Step 1</p>
                  <p className="mt-3 text-base leading-relaxed text-neutral-600">
                    Share your birth details for an accurate Vedic reading.
                  </p>
                </div>
                <div className="rounded-md border border-neutral-200 p-6">
                  <p className="text-sm font-medium text-black">Step 2</p>
                  <p className="mt-3 text-base leading-relaxed text-neutral-600">
                    We interpret Sun, Moon, Nakshatra, and Shukra influences.
                  </p>
                </div>
                <div className="rounded-md border border-neutral-200 p-6">
                  <p className="text-sm font-medium text-black">Step 3</p>
                  <p className="mt-3 text-base leading-relaxed text-neutral-600">
                    Receive your personalized fragrance reveal and ritual guidance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <motion.form
            onSubmit={handleSubmit}
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="grid gap-8 px-6 py-10 lg:px-10"
          >
            <motion.div variants={sectionVariants} className="space-y-2 sm:col-span-2">
              <label htmlFor="name" className="text-sm font-medium text-black">
                Name
              </label>
              <input
                id="name"
                name="name"
                autoComplete="name"
                className="w-full rounded-md border border-neutral-300 px-4 py-3 text-black outline-none transition focus:ring-2 focus:ring-black"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </motion.div>

            <motion.div variants={sectionVariants} className="space-y-2 sm:col-span-2">
              <label htmlFor="email" className="text-sm font-medium text-black">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                className="w-full rounded-md border border-neutral-300 px-4 py-3 text-black outline-none transition focus:ring-2 focus:ring-black"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="you@example.com"
                required
              />
            </motion.div>

            <motion.div variants={sectionVariants} className="space-y-2">
              <label htmlFor="dob" className="text-sm font-medium text-black">
                Date of Birth
              </label>
              <input
                id="dob"
                name="dob"
                type="date"
                className="w-full rounded-md border border-neutral-300 px-4 py-3 text-black outline-none transition focus:ring-2 focus:ring-black"
                value={form.dob}
                onChange={(event) => setForm((prev) => ({ ...prev, dob: event.target.value }))}
                required
              />
            </motion.div>

            <motion.div variants={sectionVariants} className="space-y-2">
              <label htmlFor="time" className="text-sm font-medium text-black">
                Time of Birth
              </label>
              <input
                id="time"
                name="time"
                type="time"
                className="w-full rounded-md border border-neutral-300 px-4 py-3 text-black outline-none transition focus:ring-2 focus:ring-black"
                value={form.time}
                onChange={(event) => setForm((prev) => ({ ...prev, time: event.target.value }))}
                required
              />
            </motion.div>

            <motion.div variants={sectionVariants} className="space-y-2 sm:col-span-2">
              <label htmlFor="city" className="text-sm font-medium text-black">
                City
              </label>
              <input
                id="city"
                name="city"
                list="city-suggestions"
                autoComplete="address-level2"
                className="w-full rounded-md border border-neutral-300 px-4 py-3 text-black outline-none transition focus:ring-2 focus:ring-black"
                value={form.city}
                onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                placeholder="Start typing city"
                required
              />
              <datalist id="city-suggestions">
                {suggestions.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </motion.div>

            <motion.fieldset variants={sectionVariants} className="space-y-4 sm:col-span-2">
              <legend className="text-sm font-medium text-black">Gender</legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {(["male", "female", "other"] as const).map((gender) => (
                  <label
                    key={gender}
                    className={`inline-flex cursor-pointer items-center justify-center rounded-md border px-4 py-3 text-sm font-medium capitalize transition ${
                      form.gender === gender
                        ? "border-black bg-black text-white"
                        : "border-neutral-300 bg-white text-black hover:bg-neutral-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={gender}
                      checked={form.gender === gender}
                      onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value as Gender }))}
                      className="sr-only"
                    />
                    {gender}
                  </label>
                ))}
              </div>
            </motion.fieldset>

            <motion.div variants={sectionVariants} className="sm:col-span-2">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.99 }}
                disabled={loading}
                className="w-full rounded-md bg-black px-6 py-3 font-medium text-white transition hover:bg-neutral-900 focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Preparing Your Reading" : "Find My Cosmic Fragrance"}
              </motion.button>
            </motion.div>

            {error ? (
              <motion.p
                variants={sectionVariants}
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 p-6 text-base leading-relaxed text-black sm:col-span-2"
              >
                {error}
              </motion.p>
            ) : null}
          </motion.form>
        </div>
      </motion.section>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.section
            key="processing"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mt-8 rounded-md border border-neutral-200 bg-white px-6 py-20 shadow-sm"
          >
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-black">Cosmic Processing</p>
              <h3 className="mt-8 text-3xl font-semibold text-black md:text-4xl">Interpreting your celestial signature</h3>
              <div className="mt-8 h-10 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={PROCESSING_STEPS[loadingStep]}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="text-base leading-relaxed text-neutral-600"
                  >
                    {PROCESSING_STEPS[loadingStep]}
                  </motion.p>
                </AnimatePresence>
              </div>
              <div className="mx-auto mt-8 grid max-w-sm grid-cols-3 gap-4">
                {PROCESSING_STEPS.map((step, index) => (
                  <motion.div
                    key={step}
                    animate={{ opacity: loadingStep === index ? 1 : 0.3, scaleX: loadingStep === index ? 1.03 : 1 }}
                    transition={{ duration: 0.3 }}
                    className="h-1 rounded-full bg-black"
                  />
                ))}
              </div>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            ref={resultSectionRef}
            key="result"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            className="mt-8 space-y-8"
          >
            <motion.section variants={sectionVariants} className="rounded-md border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="max-w-4xl">
                <p className="text-sm font-medium uppercase tracking-[0.14em] text-black">Birth Chart Story</p>
                <h3 className="mt-4 text-3xl font-semibold text-black md:text-4xl">Your Cosmic Fragrance Profile</h3>
                <p className="mt-6 text-base leading-relaxed text-neutral-600">
                  At the moment you were born, the Sun was in {result.sunSign}, the Moon in {result.moonSign}, and the
                  stars aligned under the {result.nakshatra} Nakshatra. This rare cosmic alignment reflects your
                  personality, emotions, and natural rhythm.
                </p>
              </div>
              <div className="mt-8 grid gap-8 md:grid-cols-3">
                <SignCard title="Sun Sign" value={result.sunSign} meta={getSunProfile(result.sunSign)} />
                <SignCard title="Moon Sign" value={result.moonSign} meta={getMoonProfile(result.moonSign)} />
                <SignCard
                  title="Nakshatra"
                  value={`${result.nakshatra} • Pada ${result.nakshatraPada}`}
                  meta={getNakshatraProfile(result.nakshatra, result.nakshatraPada)}
                />
              </div>
            </motion.section>

            <motion.section variants={sectionVariants} className="rounded-md border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="max-w-3xl">
                <p className="text-sm font-medium uppercase tracking-[0.14em] text-black">Fragrance Revelation</p>
                <h3 className="mt-4 text-3xl font-semibold text-black md:text-4xl">Your Personalized Fragrance Selection</h3>
                <p className="mt-6 text-base leading-relaxed text-neutral-600">
                  These fragrances are chosen to resonate with the planetary energies present in your birth chart.
                </p>
                {result.message ? (
                  <p className="mt-8 rounded-md border border-amber-200 bg-amber-50 p-6 text-base leading-relaxed text-black">
                    {result.message}
                  </p>
                ) : null}
              </div>

              {fragranceRevealCards.some((card) => card.product) ? (
                <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                  {fragranceRevealCards.map((card) =>
                    card.product ? (
                      <motion.div
                        key={`${card.key}-${card.product.id}`}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-4"
                      >
                        <p className="text-sm font-medium text-black">{card.eyebrow}</p>
                        <ProductCard
                          product={{
                            ...mapToCardProduct(card.product),
                            description: card.explanation,
                          }}
                        />
                      </motion.div>
                    ) : null,
                  )}
                </div>
              ) : (
                <div className="mt-8 rounded-md border border-neutral-200 bg-white p-6">
                  <p className="text-base leading-relaxed text-neutral-600">
                    Your chart is ready. Explore our perfume collection while we refine the most aligned fragrance set
                    for this profile.
                  </p>
                  <Link
                    href="/shop"
                    className="mt-8 inline-flex rounded-md border border-black bg-white px-6 py-3 font-medium text-black transition hover:bg-neutral-900 hover:text-white focus:ring-2 focus:ring-black focus:ring-offset-2"
                  >
                    Explore Collection
                  </Link>
                </div>
              )}
            </motion.section>

            <motion.section variants={sectionVariants} className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-md border border-neutral-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium uppercase tracking-[0.14em] text-black">Sacred Ritual Trigger</p>
                <h3 className="mt-4 text-3xl font-semibold text-black md:text-4xl">Your Fragrance Ritual</h3>
                <div className="mt-6 space-y-4 text-base leading-relaxed text-neutral-600">
                  <p>Apply your {result.nakshatra} fragrance in the morning to align with your natural cosmic rhythm.</p>
                  <p>
                    Use your Moon fragrance during moments of calm to restore emotional balance and soften mental
                    intensity.
                  </p>
                  <p>
                    Your Venus fragrance is best worn before gatherings, meetings, or evenings when you want to amplify
                    attraction and elegance.
                  </p>
                </div>
              </div>

              <div className="rounded-md border border-neutral-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium uppercase tracking-[0.14em] text-black">Cosmic Exclusivity</p>
                <h3 className="mt-4 text-3xl font-semibold text-black md:text-4xl">A Rare Cosmic Combination</h3>
                <p className="mt-6 text-base leading-relaxed text-neutral-600">
                  Only a small number of people share the exact alignment of Sun, Moon, and Nakshatra present in your
                  birth chart. These fragrances are curated specifically for this rare cosmic signature.
                </p>
              </div>
            </motion.section>

            <motion.section variants={sectionVariants} className="rounded-md border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-black">Purchase CTA</p>
              <h3 className="mt-4 text-3xl font-semibold text-black md:text-4xl">Your Fragrance Journey Begins Here</h3>
              <p className="mt-6 max-w-3xl text-base leading-relaxed text-neutral-600">
                Move from insight into ritual. Begin with the perfume that matched your chart most closely, or explore
                the full cosmic collection for a wider fragrance wardrobe.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center rounded-md bg-black px-6 py-3 font-medium text-white transition hover:bg-neutral-900 focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  Explore Your Cosmic Collection
                </Link>
                <Link
                  href={primaryCtaHref}
                  className="inline-flex items-center justify-center rounded-md border border-black bg-white px-6 py-3 font-medium text-black transition hover:bg-neutral-900 hover:text-white focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  View Your First Match
                </Link>
              </div>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
