import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { assertAdmin, NotAuthenticatedError, ForbiddenError, ProfileMissingError } from "@/lib/admin/assertAdmin";

const PROTECTED_PREFIXES = ["/account", "/admin"];

export async function middleware(request: NextRequest) {
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
    const isProtected = PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));

    if (isProtected && !user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (path.startsWith("/admin") && user) {
      try {
        await assertAdmin(supabase);
      } catch (err) {
        if (err instanceof NotAuthenticatedError) {
          return NextResponse.redirect(new URL("/login", request.url));
        }
        if (err instanceof ForbiddenError || err instanceof ProfileMissingError) {
          return NextResponse.redirect(new URL("/", request.url));
        }
        console.error("[middleware] Admin check failed:", err);
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  } catch (error) {
    console.error("[middleware] Error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
