import { NextResponse } from "next/server";
import { getEnvPresence, getServerEnv } from "@/lib/env";
import { createStaticClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAllProducts } from "@/lib/api/products";

export async function GET() {
  const envStatus = getEnvPresence();
  let env: ReturnType<typeof getServerEnv> | null = null;
  try {
    env = getServerEnv();
  } catch {
    env = null;
  }

  let supabaseReachable = false;
  let productsSampleCount = 0;
  let variantsSampleCount = 0;
  let imagesSampleCount = 0;

  try {
    const supabase = createStaticClient();
    const { data: products, error } = await supabase.from("products").select("id").limit(5);
    supabaseReachable = !error;
    productsSampleCount = products?.length ?? 0;
  } catch {
    supabaseReachable = false;
  }

  try {
    const admin = createAdminClient();
    const { count: varCount } = await admin
      .from("product_variants")
      .select("id", { count: "exact", head: true });
    const { count: imgCount } = await admin
      .from("product_images")
      .select("id", { count: "exact", head: true });
    variantsSampleCount = varCount ?? 0;
    imagesSampleCount = imgCount ?? 0;
  } catch {
    // ignore admin errors in debug payload
  }

  const productsDisplay = await getAllProducts();

  const payload = {
    node_env: process.env.NODE_ENV ?? "development",
    env_status: envStatus,
    supabase: {
      reachable: supabaseReachable,
      products_sample_count: productsSampleCount,
      variants_sample_count: variantsSampleCount,
      images_sample_count: imagesSampleCount,
      product_display_count: productsDisplay.length,
    },
    razorpay: {
      key_id_prefix: env?.NEXT_PUBLIC_RAZORPAY_KEY_ID?.slice(0, 8) ?? null,
    },
  };

  return NextResponse.json(payload, { status: 200 });
}
