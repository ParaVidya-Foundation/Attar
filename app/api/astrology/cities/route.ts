import { NextResponse } from "next/server";

import { suggestBirthLocations } from "@/lib/geography/resolveBirthLocation";
import { getClientIdentifier, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const identifier = `astrology-cities:${getClientIdentifier(req)}`;
  const limit = await rateLimit(identifier, 60, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ suggestions: [] }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const suggestions = await suggestBirthLocations(q);
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
