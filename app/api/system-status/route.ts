import { NextResponse } from "next/server";
import { getEnvPresence, getSiteUrl } from "@/lib/env";
import { createStaticClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAllProducts } from "@/lib/api/products";

export const dynamic = "force-dynamic";

type CheckResult<T> = { ok: true; value: T } | { ok: false; error: string };

function ok<T>(value: T): CheckResult<T> {
  return { ok: true, value };
}

function fail(error: unknown): CheckResult<never> {
  return {
    ok: false,
    error: error instanceof Error ? error.message : "Unknown error",
  };
}

function getValue<T>(result: CheckResult<T>): T | null {
  return result.ok ? result.value : null;
}

export async function GET() {
  const env = getEnvPresence();

  const supabaseCheck = await (async () => {
    try {
      const supabase = createStaticClient();
      const [
        productsCount,
        variantsCount,
        imagesCount,
        categoriesCount,
      ] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("product_variants").select("id", { count: "exact", head: true }),
        supabase.from("product_images").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
      ]);

      return ok({
        reachable: true,
        publicActiveProducts: productsCount.count ?? 0,
        publicVariants: variantsCount.count ?? 0,
        publicImages: imagesCount.count ?? 0,
        publicCategories: categoriesCount.count ?? 0,
      });
    } catch (error) {
      return fail(error);
    }
  })();

  const adminCheck = await (async () => {
    try {
      const admin = createAdminClient();
      const [
        activeProductsCount,
        variantsCount,
        imagesCount,
      ] = await Promise.all([
        admin.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
        admin.from("product_variants").select("id", { count: "exact", head: true }),
        admin.from("product_images").select("id", { count: "exact", head: true }),
      ]);

      return ok({
        activeProducts: activeProductsCount.count ?? 0,
        variants: variantsCount.count ?? 0,
        images: imagesCount.count ?? 0,
      });
    } catch (error) {
      return fail(error);
    }
  })();

  const productApiCheck = await (async () => {
    try {
      const products = await getAllProducts();
      return ok({
        count: products.length,
        zeroRowsWarning:
          products.length === 0 ? "getAllProducts returned zero rows - check env, RLS, or DB" : null,
      });
    } catch (error) {
      return fail(error);
    }
  })();

  const supabaseValue = getValue(supabaseCheck);
  const adminValue = getValue(adminCheck);
  const productApiValue = getValue(productApiCheck);

  const publicActiveProducts = supabaseValue?.publicActiveProducts ?? null;
  const adminActiveProducts = adminValue?.activeProducts ?? null;

  const payload = {
    env,
    supabase: supabaseValue
      ? {
          ...supabaseValue,
          rlsPublicReadAligned:
            adminActiveProducts == null ? null : publicActiveProducts === adminActiveProducts,
        }
      : supabaseCheck,
    products: productApiValue ?? productApiCheck,
    database: adminValue ?? adminCheck,
    auth: {
      browserClientEnvReady:
        env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY && env.NEXT_PUBLIC_SITE_URL,
      callbackRoute: "/auth/callback",
      callbackExchangeEnabled: true,
      siteUrl: env.NEXT_PUBLIC_SITE_URL ? getSiteUrl() : null,
    },
    razorpay: {
      browserKeyReady: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      serverKeyReady: env.RAZORPAY_KEY_SECRET,
      webhookSecretReady: env.RAZORPAY_WEBHOOK_SECRET,
      checkoutScriptUrl: "https://checkout.razorpay.com/v1/checkout.js",
    },
  };

  const healthy =
    Object.values(env).every(Boolean) &&
    supabaseCheck.ok &&
    adminCheck.ok &&
    productApiCheck.ok &&
    publicActiveProducts !== 0;

  return NextResponse.json(payload, {
    status: healthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
