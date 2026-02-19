import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  console.log("=== LIVE DATABASE PROBE ===\n");

  // 1. Check products table — select * limit 1 to see column names
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

  // 2. Check categories table
  const { data: cats, error: catErr } = await supabase
    .from("categories")
    .select("*")
    .limit(10);

  if (catErr) {
    console.error("categories error:", catErr.message);
  } else {
    console.log("categories count:", cats?.length);
    if (cats?.length) {
      console.log("categories:", cats.map((c: any) => `${c.slug} (${c.id})`).join(", "));
    }
  }

  console.log();

  // 3. Check product_categories junction
  const { data: pc, error: pcErr } = await supabase
    .from("product_categories")
    .select("*")
    .limit(5);

  if (pcErr) {
    console.error("product_categories error:", pcErr.message);
  } else {
    console.log("product_categories rows (sample):", pc?.length);
    if (pc?.[0]) console.log("sample:", JSON.stringify(pc[0]));
  }

  console.log();

  // 4. Check product_sizes
  const { data: sizes, error: szErr } = await supabase
    .from("product_sizes")
    .select("*")
    .limit(5);

  if (szErr) {
    console.error("product_sizes error:", szErr.message);
  } else {
    console.log("product_sizes rows (sample):", sizes?.length);
    if (sizes?.[0]) console.log("sample:", JSON.stringify(sizes[0]));
  }

  // 5. Specifically test the columns the fetcher needs
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
