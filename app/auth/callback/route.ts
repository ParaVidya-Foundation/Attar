import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/env";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  let siteUrl: string;
  try {
    siteUrl = getSiteUrl();
  } catch {
    siteUrl = request.url ? new URL(request.url).origin : "https://anandrasafragnance.com";
  }

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/login?error=auth`);
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${siteUrl}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${siteUrl}/login?error=auth`);
  }

  const next = searchParams.get("next") ?? "/";
  const path = next.startsWith("/") ? next : `/${next}`;
  return NextResponse.redirect(`${siteUrl}${path}`);
}
