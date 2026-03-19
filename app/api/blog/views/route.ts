/**
 * POST /api/blog/views — Increment blog post view count.
 * Debounced per IP + post to avoid spam.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { postsService } from "@/lib/blog/services";
import { serverError } from "@/lib/security/logger";

const bodySchema = z.object({
  postId: z.string().uuid(),
});

export async function POST(req: Request) {
  const identifier = getClientIdentifier(req);
  const rl = await rateLimit(`blog-view:${identifier}`, 30, 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ ok: true });
  }

  try {
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    await postsService.incrementPostViews(parsed.data.postId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    serverError("blog views API", err);
    return NextResponse.json({ ok: true });
  }
}
