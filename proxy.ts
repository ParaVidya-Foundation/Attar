import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { assertAdmin, ForbiddenError, NotAuthenticatedError, ProfileMissingError } from "@/lib/admin/assertAdmin";
import { serverError } from "@/lib/security/logger";

const PROTECTED_PREFIXES = ["/account", "/admin"];
const CANONICAL_HOST = "anandrasafragnance.com";
const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;

function isLocalHost(host: string): boolean {
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.startsWith("192.168.") ||
    host.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
  );
}

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const host = url.hostname.toLowerCase();
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction && host !== CANONICAL_HOST && !isLocalHost(host)) {
    const canonicalUrl = new URL(url.pathname + url.search, CANONICAL_ORIGIN);
    return NextResponse.redirect(canonicalUrl.toString(), 301);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  const response = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;
    const isProtected = PROTECTED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

    if (isProtected && !user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (path.startsWith("/admin") && user) {
      try {
        await assertAdmin(supabase);
      } catch (error) {
        if (error instanceof NotAuthenticatedError) {
          return NextResponse.redirect(new URL("/login", request.url));
        }
        if (error instanceof ForbiddenError || error instanceof ProfileMissingError) {
          return NextResponse.redirect(new URL("/", request.url));
        }
        serverError("proxy", error);
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  } catch (error) {
    serverError("proxy", error);
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
