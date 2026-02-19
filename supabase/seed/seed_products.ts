/**
 * Seed products from data/attars.json into Supabase
 * Uses SUPABASE_SERVICE_ROLE_KEY (admin client)
 * Run: pnpm tsx supabase/seed/seed_products.ts [--dry-run]
 */
import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Attar } from "../../lib/types";

const DRY_RUN = process.argv.includes("--dry-run");

function getEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing env: ${key}`);
  return val;
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

    const productRow = {
      slug: attar.slug,
      name: attar.name,
      description,
      origin: attar.origin ?? null,
      notes: attar.notes ?? null,
      zodiac: attar.zodiac ?? [],
      planet: attar.planet ?? null,
      longevity: attar.longevity ?? null,
      spiritual_benefits: attar.spiritual_benefits ?? [],
      badges: attar.badges ?? [],
      price: attar.price,
      currency: "INR",
      meta_title: attar.name,
      meta_description: description.slice(0, 160),
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

    // Insert images
    for (let i = 0; i < (attar.images?.length ?? 0); i++) {
      const img = attar.images![i];
      await supabase.from("product_images").insert({
        product_id: productId,
        url: img.url,
        alt: img.alt ?? null,
        position: i,
      });
    }

    // Insert sizes and inventory
    const sizes = attar.sizes ?? [];
    const stockPerSize = sizes.length > 0 ? Math.max(1, Math.floor((attar.stock ?? 0) / sizes.length)) : 0;

    for (const sz of sizes) {
      await supabase.from("product_sizes").insert({
        product_id: productId,
        size_ml: sz.ml,
        price: sz.price,
      });
      await supabase.from("inventory").insert({
        product_id: productId,
        size_ml: sz.ml,
        stock: stockPerSize,
      });
    }

    // If no sizes, use price and stock from root attar
    if (sizes.length === 0) {
      await supabase.from("product_sizes").insert({
        product_id: productId,
        size_ml: 3,
        price: attar.price,
      });
      await supabase.from("inventory").insert({
        product_id: productId,
        size_ml: 3,
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
