import nodemailer from "nodemailer";

import type { AstrologyCalculationResult } from "@/lib/types/astrology";
import { serverError, serverWarn } from "@/lib/security/logger";

type AstroLeadPayload = {
  name: string;
  email: string;
  dob: string;
  time: string;
  city: string;
  astrology: Pick<AstrologyCalculationResult, "sunSign" | "moonSign" | "nakshatra">;
};

export async function sendAstroLeadEmail(payload: AstroLeadPayload): Promise<void> {
  const host = process.env.ASTRO_SMTP_HOST;
  const port = process.env.ASTRO_SMTP_PORT ? Number(process.env.ASTRO_SMTP_PORT) : undefined;
  const user = process.env.ASTRO_SMTP_USER;
  const pass = process.env.ASTRO_SMTP_PASS;

  if (!host || !port || !user || !pass) {
    serverError("astro/email", "SMTP configuration is missing; skipping lead email send.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const to = "anandrasafragnance@gmail.com";
  const from = process.env.ASTRO_SMTP_FROM || user;

  const subject = "New Astro Fragrance Finder lead";
  const lines = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Date of Birth: ${payload.dob}`,
    `Time of Birth: ${payload.time}`,
    `City: ${payload.city}`,
    "",
    `Sun sign: ${payload.astrology.sunSign}`,
    `Moon sign: ${payload.astrology.moonSign}`,
    `Nakshatra: ${payload.astrology.nakshatra}`,
  ];

  try {
    const info = await transporter.sendMail({
      to,
      from,
      subject,
      text: lines.join("\n"),
    });
    serverWarn(
      "astro/email",
      JSON.stringify({
        event: "sent",
        to,
        messageId: info.messageId ?? null,
      }),
    );
  } catch (err) {
    serverError("astro/email", err);
  }
}
