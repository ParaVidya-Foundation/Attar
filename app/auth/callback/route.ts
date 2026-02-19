import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    console.log("[auth/callback] No code in URL, redirecting to login");
    return NextResponse.redirect(new URL("/login?error=auth", request.url));
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession error:", error.message);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("[auth/callback] No user after exchange");
    return NextResponse.redirect(new URL("/login?error=auth", request.url));
  }

  console.log("[auth/callback] OAuth success, user id:", user.id);

  const next = searchParams.get("next") ?? "/";
  const url = new URL(request.url);
  const redirectTo = `${url.origin}${next.startsWith("/") ? next : `/${next}`}`;

  return NextResponse.redirect(redirectTo);
}
