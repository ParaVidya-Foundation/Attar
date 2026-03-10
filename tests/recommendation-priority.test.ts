import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/astrologyPerfumeMappings", () => ({
  getDeterministicMappedPerfumes: async ({ nakshatraName }: { nakshatraName: string }) => {
    const base = {
      sunSign: {
        id: "sun",
        name: "Surya Attar",
        slug: "surya-attar",
        description: "",
        short_description: null,
        price: 1000,
        original_price: null,
        images: [{ url: "x" }],
        category_slug: "astrology-perfume",
        variants: [],
        meta_title: null,
        meta_description: null,
        featured: false,
        is_active: true,
        created_at: null,
      },
      moonSign: {
        id: "moon",
        name: "Chandra Attar",
        slug: "chandra-attar",
        description: "",
        short_description: null,
        price: 1000,
        original_price: null,
        images: [{ url: "x" }],
        category_slug: "astrology-perfume",
        variants: [],
        meta_title: null,
        meta_description: null,
        featured: false,
        is_active: true,
        created_at: null,
      },
      venus: {
        id: "venus",
        name: "Shukra Attar",
        slug: "shukra-attar",
        description: "",
        short_description: null,
        price: 1000,
        original_price: null,
        images: [{ url: "x" }],
        category_slug: "astrology-perfume",
        variants: [],
        meta_title: null,
        meta_description: null,
        featured: false,
        is_active: true,
        created_at: null,
      },
    };

    if (nakshatraName === "Dhanishta") {
      return {
        ...base,
        nakshatra: {
          id: "dhanishta",
          name: "Dhanishta Nakshatra Attar",
          slug: "dhanishta-nakshatra-attar",
          description: "",
          short_description: null,
          price: 1000,
          original_price: null,
          images: [{ url: "x" }],
          category_slug: "astrology-perfume",
          variants: [],
          meta_title: null,
          meta_description: null,
          featured: false,
          is_active: true,
          created_at: null,
        },
      };
    }

    if (nakshatraName === "Rohini") {
      return {
        ...base,
        nakshatra: {
          id: "rohini",
          name: "Rohini Nakshatra Attar",
          slug: "rohini-nakshatra-attar",
          description: "",
          short_description: null,
          price: 1000,
          original_price: null,
          images: [{ url: "x" }],
          category_slug: "astrology-perfume",
          variants: [],
          meta_title: null,
          meta_description: null,
          featured: false,
          is_active: true,
          created_at: null,
        },
      };
    }

    return {
      ...base,
      nakshatra: {
        id: "magha",
        name: "Magha Nakshatra Attar",
        slug: "magha-nakshatra-attar",
        description: "",
        short_description: null,
        price: 1000,
        original_price: null,
        images: [{ url: "x" }],
        category_slug: "astrology-perfume",
        variants: [],
        meta_title: null,
        meta_description: null,
        featured: false,
        is_active: true,
        created_at: null,
      },
    };
  },
}));

vi.mock("@/lib/redis", () => ({
  cacheGet: async () => null,
  cacheSet: async () => undefined,
}));

vi.mock("@/lib/api/products", () => ({
  getAllProducts: async () => [
    {
      id: "sun",
      name: "Surya Attar",
      slug: "surya-attar",
      description: "",
      short_description: null,
      price: 1000,
      original_price: null,
      images: [{ url: "x" }],
      category_slug: "astrology-perfume",
      variants: [],
      meta_title: null,
      meta_description: null,
      featured: false,
      is_active: true,
      created_at: null,
    },
    {
      id: "moon",
      name: "Chandra Attar",
      slug: "chandra-attar",
      description: "",
      short_description: null,
      price: 1000,
      original_price: null,
      images: [{ url: "x" }],
      category_slug: "astrology-perfume",
      variants: [],
      meta_title: null,
      meta_description: null,
      featured: false,
      is_active: true,
      created_at: null,
    },
    {
      id: "venus",
      name: "Shukra Attar",
      slug: "shukra-attar",
      description: "",
      short_description: null,
      price: 1000,
      original_price: null,
      images: [{ url: "x" }],
      category_slug: "astrology-perfume",
      variants: [],
      meta_title: null,
      meta_description: null,
      featured: false,
      is_active: true,
      created_at: null,
    },
    {
      id: "dhanishta",
      name: "Dhanishta Nakshatra Attar",
      slug: "dhanishta-nakshatra-attar",
      description: "",
      short_description: null,
      price: 1000,
      original_price: null,
      images: [{ url: "x" }],
      category_slug: "astrology-perfume",
      variants: [],
      meta_title: null,
      meta_description: null,
      featured: false,
      is_active: true,
      created_at: null,
    },
    {
      id: "rohini",
      name: "Rohini Nakshatra Attar",
      slug: "rohini-nakshatra-attar",
      description: "",
      short_description: null,
      price: 1000,
      original_price: null,
      images: [{ url: "x" }],
      category_slug: "astrology-perfume",
      variants: [],
      meta_title: null,
      meta_description: null,
      featured: false,
      is_active: true,
      created_at: null,
    },
    {
      id: "magha",
      name: "Magha Nakshatra Attar",
      slug: "magha-nakshatra-attar",
      description: "",
      short_description: null,
      price: 1000,
      original_price: null,
      images: [{ url: "x" }],
      category_slug: "astrology-perfume",
      variants: [],
      meta_title: null,
      meta_description: null,
      featured: false,
      is_active: true,
      created_at: null,
    },
  ],
}));

import { buildAstroApiResponse } from "@/lib/astrology/recommendations";

function mockAstrology(nakshatra: string) {
  return {
    sunSign: "Taurus",
    moonSign: "Aquarius",
    nakshatra,
    nakshatraPada: 1 as const,
    planets: { sun: 40, moon: 301 },
  };
}

describe("Deterministic relational recommendation mapping", () => {
  it("Dhanishta returns exact Dhanishta perfume with Sun/Moon/Venus core set", async () => {
    const response = await buildAstroApiResponse(mockAstrology("Dhanishta"));
    const slugs = response.recommendedProducts.map((p) => p.slug);
    expect(slugs).toEqual([
      "surya-attar",
      "chandra-attar",
      "dhanishta-nakshatra-attar",
      "shukra-attar",
    ]);
  });

  it("Rohini returns Rohini as exact Nakshatra mapping", async () => {
    const response = await buildAstroApiResponse(mockAstrology("Rohini"));
    expect(response.recommendedProducts.map((p) => p.slug)).toContain("rohini-nakshatra-attar");
  });

  it("Magha returns Magha as exact Nakshatra mapping", async () => {
    const response = await buildAstroApiResponse(mockAstrology("Magha"));
    expect(response.recommendedProducts.map((p) => p.slug)).toContain("magha-nakshatra-attar");
  });
});
