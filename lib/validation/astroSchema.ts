import { z } from "zod";

function sanitizeText(value: string): string {
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim();
}

const latitudeSchema = z
  .union([z.number(), z.string()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === null || value === "") return undefined;
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  })
  .refine((value) => value === undefined || (value >= -90 && value <= 90), "Latitude must be between -90 and 90");

const longitudeSchema = z
  .union([z.number(), z.string()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === null || value === "") return undefined;
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  })
  .refine((value) => value === undefined || (value >= -180 && value <= 180), "Longitude must be between -180 and 180");

export const astroSchema = z
  .object({
    name: z.string().trim().min(2, "Name is required").max(120).transform(sanitizeText),
    email: z
      .string()
      .trim()
      .min(5, "Email is required")
      .max(254)
      .email("Please enter a valid email address")
      .transform(sanitizeText),
    dob: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "DOB must be YYYY-MM-DD")
      .refine((value) => {
        const date = new Date(`${value}T00:00:00Z`);
        return !Number.isNaN(date.getTime()) && date <= new Date();
      }, "DOB must be a valid past date"),
    time: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be HH:MM in 24-hour format"),
    city: z
      .string()
      .trim()
      .max(120)
      .regex(/^[\p{L}\p{N}\s.,'-]*$/u, "City contains unsupported characters")
      .transform(sanitizeText),
    gender: z.enum(["male", "female", "other"]),
    latitude: latitudeSchema,
    longitude: longitudeSchema,
  })
  .refine(
    (value) => {
      const hasCity = value.city.trim().length >= 2;
      const hasManualCoordinates = typeof value.latitude === "number" && typeof value.longitude === "number";
      return hasCity || hasManualCoordinates;
    },
    {
      message: "Enter a city or provide latitude/longitude",
      path: ["city"],
    },
  );

export type AstroSchemaInput = z.infer<typeof astroSchema>;
