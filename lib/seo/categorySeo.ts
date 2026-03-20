export type CategorySeoData = {
  intro: string;
  buyingGuide: string;
  faqs: { question: string; answer: string }[];
  internalLinks: { label: string; href: string }[];
};

const DEFAULT_CATEGORY_SEO: CategorySeoData = {
  intro:
    "Explore our handcrafted collection of luxury attars, zodiac perfume oils, and spiritual fragrances. Each product is crafted with natural ingredients using traditional Indian distillation methods — alcohol-free, skin-safe, and designed for daily ritual, meditation, and personal expression.",
  buyingGuide:
    "When choosing an attar, consider your intention: spiritual practice, daily wear, or gifting. Start with a 3ml vial to discover your preferred notes. Apply to pulse points — wrists, neck, and behind ears — for the best projection and longevity. Our attars are oil-based and alcohol-free, so a little goes a long way.",
  faqs: [
    {
      question: "What is attar and how is it different from perfume?",
      answer:
        "Attar (also called ittar) is a traditional Indian perfume oil made from natural botanical ingredients through hydro-distillation. Unlike commercial perfumes, attars are alcohol-free, oil-based, and more concentrated — a single drop can last 6–12 hours on skin.",
    },
    {
      question: "Are these fragrances suitable for daily pooja and meditation?",
      answer:
        "Yes. Many of our attars and agarbatti are specifically crafted for spiritual practices — meditation, daily pooja, temple rituals, and yoga. They use calming notes like sandalwood, vetiver, and jasmine that support focused, grounded practice.",
    },
  ],
  internalLinks: [
    { label: "Shop All Fragrances", href: "/shop" },
    { label: "Find Your Zodiac Fragrance", href: "/find-fragrance" },
    { label: "Read Our Blog", href: "/blog" },
  ],
};

const CATEGORY_SEO_MAP: Record<string, Partial<CategorySeoData>> = {
  zodiac: {
    intro:
      "Discover zodiac perfumes crafted to match the elemental energy of each astrological sign. From the fiery confidence of Aries to the dreamy intuition of Pisces, our zodiac attars translate cosmic symbolism into wearable, skin-close fragrance. Each zodiac perfume is composed with intention — aligning scent character to your Sun sign's personality, strengths, and emotional rhythm. Whether you follow Western astrology or Vedic jyotish, these fragrances offer a deeply personal way to connect with your celestial identity through the ancient Indian art of attar-making.",
    buyingGuide:
      "Start by identifying your Sun sign (or Moon sign for emotional depth). Each zodiac attar in our collection is designed around the dominant elemental energy — fire signs get warm, spicy profiles; earth signs receive grounding, woody blends; air signs enjoy light, fresh citrus; water signs experience soft, floral compositions. For gifting, a zodiac attar makes a uniquely personal present that shows thoughtfulness beyond generic perfume.",
    faqs: [
      {
        question: "What is a zodiac perfume?",
        answer:
          "A zodiac perfume is a fragrance formulated to reflect the personality, elemental energy, and emotional qualities of a specific zodiac sign. For example, an Aries perfume might feature bold, fiery notes like cinnamon and oud, while a Cancer perfume leans toward soft, nurturing florals like jasmine and water lily.",
      },
      {
        question: "Which zodiac perfume should I wear?",
        answer:
          "Choose the attar that matches your Sun sign for daily confidence, or your Moon sign for emotional comfort. If you're unsure, our Astro Fragrance Finder tool can recommend the ideal scent based on your birth chart.",
      },
      {
        question: "Can I gift a zodiac perfume to someone?",
        answer:
          "Absolutely. Zodiac perfumes are one of the most personal gifts you can give. Choose the recipient's Sun sign attar for a thoughtful, meaningful present that connects fragrance with identity.",
      },
      {
        question: "Are zodiac perfumes suitable for both men and women?",
        answer:
          "Yes. Our zodiac attars are designed to be unisex. Natural attar oils adapt to your body chemistry, creating a unique scent experience regardless of gender.",
      },
    ],
    internalLinks: [
      { label: "Find Your Zodiac Fragrance", href: "/find-fragrance" },
      { label: "Planet Attars Collection", href: "/collections/planets" },
      { label: "Nakshatra Attars Collection", href: "/collections/nakshatra" },
      { label: "Shop All Fragrances", href: "/shop" },
    ],
  },
  planets: {
    intro:
      "The Navagraha planet attars honour the nine celestial forces of Vedic astrology — Sun (Surya), Moon (Chandra), Mars (Mangal), Mercury (Budh), Jupiter (Guru), Venus (Shukra), Saturn (Shani), Rahu, and Ketu. Each planet attar is crafted to resonate with the cosmic energy, deity, and elemental quality of its planetary ruler. In Vedic tradition, wearing a planetary fragrance is an intentional practice — a daily ritual that harmonises your presence with celestial influences, supports spiritual grounding, and brings awareness to the planetary periods (dashas) active in your life.",
    buyingGuide:
      "To choose the right planet attar, consult your Vedic birth chart to identify your dominant or afflicted planets. A Sun attar supports confidence and leadership; a Moon attar promotes emotional calm; Venus encourages attraction and artistic expression. For general spiritual practice, Jupiter (Guru) attar supports wisdom and devotion. Apply to pulse points before meditation or pooja for best effect.",
    faqs: [
      {
        question: "What are Navagraha attars?",
        answer:
          "Navagraha attars are nine fragrance oils, each crafted to represent one of the nine planets in Vedic astrology. They use natural ingredients traditionally associated with each planet's energy — for example, sandalwood for Jupiter, rose for Venus, and spicy oud for Mars.",
      },
      {
        question: "How do I use planet attars for spiritual practice?",
        answer:
          "Apply 1–2 drops to pulse points before meditation, pooja, or prayer. You can choose the planet attar corresponding to the day of the week (e.g., Sun for Sunday, Moon for Monday) or based on your birth chart's planetary emphasis.",
      },
      {
        question: "Can planet attars help with astrological remedies?",
        answer:
          "While fragrance is not a substitute for formal astrological remedies, wearing a planet attar is a mindful, daily practice that many people find supportive alongside traditional Vedic remedies like gemstones and mantras.",
      },
    ],
    internalLinks: [
      { label: "Zodiac Attars Collection", href: "/collections/zodiac" },
      { label: "Find Your Astrology Fragrance", href: "/find-fragrance" },
      { label: "Nakshatra Attars", href: "/collections/nakshatra" },
      { label: "Shop All", href: "/shop" },
    ],
  },
  incense: {
    intro:
      "Our premium agarbatti and incense sticks are handcrafted using natural resins, herbs, and essential oils — completely chemical-free and bamboo-less. Designed for daily pooja, meditation, yoga, and temple rituals, each agarbatti burns cleanly with low smoke and fills your space with authentic Vedic fragrance. Unlike mass-produced incense loaded with synthetic oils and charcoal, our agarbatti uses traditional formulations that honour the ancient Indian practice of dhoop and agarbatti offering. The result is a purer burn, longer-lasting fragrance, and a spiritually grounding atmosphere.",
    buyingGuide:
      "Choose your agarbatti based on your ritual intention: calming blends for meditation, energising blends for morning pooja, or grounding blends for evening practice. Each stick burns for approximately 30–40 minutes. Store in a cool, dry place away from moisture. For bulk orders (temples, events, corporate gifting), visit our Bulk Enquiry page.",
    faqs: [
      {
        question: "What makes your agarbatti different from regular incense?",
        answer:
          "Our agarbatti is bamboo-less, chemical-free, and handcrafted using natural resins and essential oils. Unlike mass-produced incense that uses charcoal fillers and synthetic fragrance, our sticks burn cleanly with low smoke and authentic Vedic aroma.",
      },
      {
        question: "Are your incense sticks safe for daily use?",
        answer:
          "Yes. Our agarbatti is made from natural, non-toxic ingredients and produces minimal smoke. They are suitable for daily pooja, meditation, and home use. Always burn in a well-ventilated area.",
      },
      {
        question: "How long does each agarbatti stick burn?",
        answer:
          "Each stick burns for approximately 30–40 minutes with a steady, clean fragrance that gently fills the room without becoming overpowering.",
      },
      {
        question: "Can I order agarbatti in bulk for temples or events?",
        answer:
          "Yes. We offer bulk agarbatti orders for temples, retailers, event organisers, and corporate gifting. Visit our Bulk Enquiry page or contact us directly for wholesale pricing.",
      },
    ],
    internalLinks: [
      { label: "Bulk Enquiry", href: "/bulk-enquiry" },
      { label: "Shop All Products", href: "/shop" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  nakshatra: {
    intro:
      "The 27 Nakshatra attars honour the lunar mansions of Vedic astrology. Each Nakshatra represents a specific cosmic energy, deity, and symbolic quality — and our Nakshatra perfumes translate these qualities into wearable, skin-close fragrance. Your birth Nakshatra reveals the emotional tone and spiritual purpose most natural to you. Wearing your Nakshatra attar is a daily ritual of alignment — a quiet, personal practice that connects your scent to your cosmic blueprint.",
    buyingGuide:
      "Identify your birth Nakshatra using your Vedic birth chart (based on Moon's position at birth). Each Nakshatra attar is composed to mirror the mood, deity, and elemental quality of that lunar mansion. Use our Astro Fragrance Finder for personalised recommendations. Apply to pulse points for a subtle, all-day aura.",
    faqs: [
      {
        question: "What is a Nakshatra perfume?",
        answer:
          "A Nakshatra perfume is a fragrance selected to reflect the lunar mansion active at your time of birth. In Vedic astrology, your Nakshatra reveals your emotional nature, spiritual tendencies, and personality — and the corresponding attar translates those qualities into scent.",
      },
      {
        question: "How do I find my Nakshatra?",
        answer:
          "Your Nakshatra is determined by the Moon's position in the Vedic zodiac at your time of birth. You can find it using any Vedic astrology calculator or our Astro Fragrance Finder tool.",
      },
    ],
    internalLinks: [
      { label: "Find Your Nakshatra Fragrance", href: "/find-fragrance" },
      { label: "Zodiac Attars", href: "/collections/zodiac" },
      { label: "Planet Attars", href: "/collections/planets" },
    ],
  },
  stress: {
    intro:
      "Our stress relief attars are crafted to bring calm, reduce anxiety, and restore mental peace through the power of natural fragrance. Using calming botanicals like lavender, vetiver, sandalwood, and chamomile, these alcohol-free perfume oils work as a subtle, wearable form of aromatherapy. Unlike synthetic stress-relief products, our attars are concentrated natural oils that absorb into skin and release calming notes over hours. Whether you use them during meditation, before sleep, or throughout a demanding workday, these fragrances support emotional balance and grounded presence.",
    buyingGuide:
      "For anxiety and stress, choose attars with vetiver (grounding), lavender (calming), or sandalwood (centering) base notes. Apply to wrists and neck before stressful situations, or to temples before sleep. These attars also pair well with meditation and breathwork practices.",
    faqs: [
      {
        question: "Can attar really help with stress and anxiety?",
        answer:
          "Natural fragrance has been used for centuries in aromatherapy. Our stress relief attars use ingredients like lavender, vetiver, and sandalwood that are clinically associated with reducing cortisol levels and promoting relaxation. While not a medical treatment, many people find wearing calming fragrances supports emotional wellbeing.",
      },
      {
        question: "How should I use stress relief attars?",
        answer:
          "Apply 1–2 drops to pulse points (wrists, temples, behind ears) when you need calm — before meetings, during meditation, or at bedtime. The natural oil formula releases fragrance slowly over several hours.",
      },
    ],
    internalLinks: [
      { label: "Chakra Attars", href: "/collections/Chakra-attar" },
      { label: "Love Attars", href: "/collections/Love-attar" },
      { label: "Shop All", href: "/shop" },
    ],
  },
};

const SLUG_ALIASES: Record<string, string> = {
  "Incense": "incense",
  "Chakra-attar": "chakra",
  "Love-attar": "love",
};

export function getCategorySeo(slug: string): CategorySeoData {
  const key = SLUG_ALIASES[slug] ?? slug.toLowerCase();
  const custom = CATEGORY_SEO_MAP[key];
  if (!custom) return DEFAULT_CATEGORY_SEO;
  return {
    intro: custom.intro ?? DEFAULT_CATEGORY_SEO.intro,
    buyingGuide: custom.buyingGuide ?? DEFAULT_CATEGORY_SEO.buyingGuide,
    faqs: custom.faqs ?? DEFAULT_CATEGORY_SEO.faqs,
    internalLinks: custom.internalLinks ?? DEFAULT_CATEGORY_SEO.internalLinks,
  };
}
