import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  console.log("=== LIVE DATABASE PROBE ===\n");

  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("*")
    .limit(3);

  if (prodErr) {
    console.error("products SELECT * error:", prodErr.message);
  } else {
    console.log("products row count (sample):", products?.length);
    if (products?.[0]) {
      console.log("products columns:", Object.keys(products[0]).join(", "));
      console.log("sample row:", JSON.stringify(products[0], null, 2));
    } else {
      console.log("products table is EMPTY");
    }
  }

  console.log();

  const { data: cats, error: catErr } = await supabase
    .from("categories")
    .select("*")
    .limit(10);

  if (catErr) {
    console.error("categories error:", catErr.message);
  } else {
    console.log("categories count:", cats?.length);
    if (cats?.length) {
      console.log("categories:", cats.map((c: { slug: string; id: string }) => `${c.slug} (${c.id})`).join(", "));
    }
  }

  console.log();

  const { data: variants, error: varErr } = await supabase
    .from("product_variants")
    .select("*")
    .limit(5);

  if (varErr) {
    console.error("product_variants error:", varErr.message);
  } else {
    console.log("product_variants rows (sample):", variants?.length);
    if (variants?.[0]) console.log("sample:", JSON.stringify(variants[0]));
  }

  console.log("\n=== FETCHER COLUMN TEST ===");
  const { error: fetcherTest } = await supabase
    .from("products")
    .select("id,name,slug,description,short_description,category_id,price,original_price,is_active,created_at")
    .limit(1);

  if (fetcherTest) {
    console.error("FETCHER COLUMNS FAIL:", fetcherTest.code, fetcherTest.message);
  } else {
    console.log("FETCHER COLUMNS: ALL PRESENT ✓");
  }
}

main().catch(console.error);
