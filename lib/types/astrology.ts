import type { ProductDisplay } from "@/types/product";

export type Gender = "male" | "female" | "other";

export interface AstroRequest {
  name: string;
  email: string;
  dob: string;
  time: string;
  city: string;
  gender: Gender;
  latitude?: number;
  longitude?: number;
}

export interface BirthLocation {
  latitude: number;
  longitude: number;
  timezone?: string;
  timezoneOffsetMinutes?: number;
}

export interface AstrologyEngineInput {
  dob: string;
  time: string;
  location: BirthLocation;
  timezoneOffsetMinutes: number;
}

export const PLANET_NAMES = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "rahu",
  "ketu",
] as const;

export type PlanetName = (typeof PLANET_NAMES)[number];
export type ClassicalPlanetName = "sun" | "moon";

export type PlanetLongitudes = {
  sun: number;
  moon: number;
} & Partial<Record<Exclude<PlanetName, "sun" | "moon">, number>>;
export type PlanetSpeeds = Partial<Record<PlanetName, number>>;
export type DignityStatus = "own" | "exalted" | "debilitated" | "friendly" | "enemy" | "neutral";

export interface RecommendationReason {
  productId: string;
  reason: string;
}

export interface AstrologyCalculationResult {
  sunSign: string;
  moonSign: string;
  nakshatra: string;
  nakshatraPada: 1 | 2 | 3 | 4;
  planets: PlanetLongitudes;
}

export interface AstroApiResponse {
  sunSign: string;
  moonSign: string;
  nakshatra: string;
  nakshatraPada: 1 | 2 | 3 | 4;
  planets: PlanetLongitudes;
  recommendedProducts: ProductDisplay[];
  recommendationReasons: RecommendationReason[];
  message?: string;
}

// Legacy types kept to avoid breaking older modules that are still present in the codebase.
export type StrengthGrade = "exalted" | "own" | "friendly" | "neutral" | "enemy" | "debilitated";

export interface PlanetStrength {
  score: number;
  grade: StrengthGrade;
  sign: string;
}

export interface PlanetStrengthScores {
  sun: PlanetStrength;
  moon: PlanetStrength;
  mercury: PlanetStrength;
  venus: PlanetStrength;
  mars: PlanetStrength;
  jupiter: PlanetStrength;
  saturn: PlanetStrength;
  rahu: PlanetStrength;
  ketu: PlanetStrength;
}

export interface FragranceWheel {
  sun: string;
  moon: string;
  venus: string;
  mars: string;
  mercury: string;
  jupiter: string;
  saturn: string;
}

export interface PlanetRemedy {
  planet: string;
  recommendation: string;
  explanation: string;
}

export interface NakshatraArchetype {
  title: string;
  profile: string;
  fragrance: string;
}

export interface RecommendedProductCard {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  images: {
    primary: string;
    secondary?: string;
  };
  href?: string;
  isSale?: boolean;
  slug?: string;
  defaultVariantId?: string;
}
