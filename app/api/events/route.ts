import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { recordUserEvent } from "@/lib/recommendations";

const eventSchema = z.object({
  productId: z.string().uuid(),
  eventType: z.enum(["view_product", "add_to_cart", "purchase"]),
});

export async function POST(req: Request) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  let userId: string | null = null;

  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    userId = null;
  }

  await recordUserEvent({
    userId,
    productId: parsed.data.productId,
    eventType: parsed.data.eventType,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
