import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();
    await supabase.auth.signOut();
  } catch {}
  return NextResponse.redirect(new URL("/", request.url));
}
