/**
 * POST /api/blog/publish-scheduled — Auto-publish scheduled blog posts.
 * Call via cron (Vercel cron, Supabase edge function, etc.)
 * Protected by admin auth.
 */
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdminEnv } from "@/lib/admin/envCheck";
import { assertAdmin, NotAuthenticatedError, ForbiddenError, ProfileMissingError } from "@/lib/admin/assertAdmin";
import { serverError } from "@/lib/security/logger";

export async function POST() {
  try {
    assertAdminEnv();
    await assertAdmin();
    const admin = createAdminClient();

    const { data, error } = await admin.rpc("publish_scheduled_blog_posts");
    if (error) {
      serverError("publish-scheduled", error);
      return NextResponse.json({ error: "Failed to publish scheduled posts" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, publishedCount: data ?? 0 });
  } catch (err) {
    if (err instanceof NotAuthenticatedError) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (err instanceof ForbiddenError || err instanceof ProfileMissingError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    serverError("publish-scheduled", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
