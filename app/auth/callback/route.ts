import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSiteUrl, requireClientSupabaseEnv } from "@/lib/env";
import { serverError, serverWarn } from "@/lib/security/logger";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  serverWarn("auth/callback", `received code=${Boolean(code)} next=${searchParams.get("next") ?? "/"}`);

  let siteUrl: string;
  try {
    siteUrl = getSiteUrl();
  } catch {
    siteUrl = request.url ? new URL(request.url).origin : "https://anandrasafragnance.com";
  }

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/login?error=auth`);
  }

  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  let env: { url: string; anonKey: string };
  try {
    env = requireClientSupabaseEnv();
  } catch (error) {
    serverError("auth/callback env", error);
    return NextResponse.redirect(`${siteUrl}/login?error=auth`);
  }

  const supabase = createSupabaseServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, {
              ...options,
              secure: isProduction,
              sameSite: "lax",
              httpOnly: true,
              path: "/",
            });
          });
        } catch {
          // Ignored — will be set on redirect response below
        }
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    serverError("auth/callback exchangeCodeForSession", error);
    return NextResponse.redirect(
      `${siteUrl}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    serverWarn("auth/callback", "exchangeCodeForSession completed but no user session was found");
    return NextResponse.redirect(`${siteUrl}/login?error=auth`);
  }

  const next = searchParams.get("next") ?? "/";
  const path = next.startsWith("/") ? next : `/${next}`;
  serverWarn("auth/callback", `session established user_id=${user.id} redirect=${path}`);
  return NextResponse.redirect(`${siteUrl}${path}`);
}
