/**
 * Seed products from data/attars.json into Supabase
 * Uses product_variants and product_images (no product_sizes or inventory).
 * Run: pnpm run seed:products [-- --dry-run]
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Attar } from "../../lib/types";

const DRY_RUN = process.argv.includes("--dry-run");

function getEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing env: ${key}`);
  return val;
}

function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

async function main() {
  if (DRY_RUN) console.info("[DRY RUN] No writes will be performed");

  const url = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  const dataPath = path.join(process.cwd(), "data", "attars.json");
  const raw = await readFile(dataPath, "utf8");
  const attars = JSON.parse(raw) as Attar[];

  console.info(`Found ${attars.length} attars to seed`);

  for (const attar of attars) {
    const description = Array.isArray(attar.description)
      ? attar.description.join("\n\n")
      : String(attar.description ?? "");

    const basePricePaise = toPaise(attar.price);
    const productRow = {
      slug: attar.slug,
      name: attar.name,
      description,
      short_description: description.slice(0, 160) || null,
      category_id: null,
      price: basePricePaise,
      original_price: null,
      is_active: true,
      meta_title: attar.name,
      meta_description: description.slice(0, 160) || null,
    };

    if (DRY_RUN) {
      console.info(`Would insert product: ${attar.slug}`);
      continue;
    }

    const { data: product, error: productErr } = await supabase
      .from("products")
      .insert(productRow)
      .select("id")
      .single();

    if (productErr) {
      console.error(`Failed to insert ${attar.slug}:`, productErr.message);
      continue;
    }

    const productId = product!.id;

    // Insert product_images (image_url, is_primary, sort_order)
    const images = attar.images ?? [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      await supabase.from("product_images").insert({
        product_id: productId,
        image_url: img.url,
        is_primary: i === 0,
        sort_order: i,
      });
    }

    // Insert product_variants (size_ml, price in paise, stock)
    const sizes = attar.sizes ?? [];
    const stockPerSize =
      sizes.length > 0
        ? Math.max(1, Math.floor((attar.stock ?? 0) / sizes.length))
        : 0;

    for (const sz of sizes) {
      await supabase.from("product_variants").insert({
        product_id: productId,
        size_ml: sz.ml,
        price: toPaise(sz.price),
        sku: null,
        stock: stockPerSize,
      });
    }

    if (sizes.length === 0) {
      await supabase.from("product_variants").insert({
        product_id: productId,
        size_ml: 3,
        price: basePricePaise,
        sku: null,
        stock: attar.stock ?? 0,
      });
    }

    console.info(`Seeded: ${attar.slug} (${productId})`);
  }

  console.info("Seed complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
