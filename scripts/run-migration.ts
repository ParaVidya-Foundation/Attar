/**
 * Apply migration 003 to live Supabase database.
 *
 * Usage:
 *   npx tsx scripts/run-migration.ts <DATABASE_URL>
 *
 * Get DATABASE_URL from Supabase Dashboard → Settings → Database → Connection string (URI).
 * Example: postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
 *
 * Or use the direct connection:
 *   postgresql://postgres:[password]@db.zjvktkirgiurtjajcswh.supabase.co:5432/postgres
 */
import postgres from "postgres";

const dbUrl = process.argv[2];
if (!dbUrl) {
  console.error("Usage: npx tsx scripts/run-migration.ts <DATABASE_URL>");
  console.error("Get your DATABASE_URL from Supabase Dashboard → Settings → Database → Connection string");
  process.exit(1);
}

const sql = postgres(dbUrl, { ssl: "prefer", max: 1 });

async function main() {
  console.log("=== Running migration 003: products schema alignment ===\n");

  // Step 1: Rename base_price → price
  console.log("[1/5] Renaming base_price → price ...");
  try {
    await sql`ALTER TABLE products RENAME COLUMN base_price TO price`;
    console.log("  ✓ Done");
  } catch (e: any) {
    if (e.message?.includes("does not exist")) {
      console.log("  ⊘ Column base_price not found (already renamed?)");
    } else {
      throw e;
    }
  }

  // Step 2: Rename compare_price → original_price
  console.log("[2/5] Renaming compare_price → original_price ...");
  try {
    await sql`ALTER TABLE products RENAME COLUMN compare_price TO original_price`;
    console.log("  ✓ Done");
  } catch (e: any) {
    if (e.message?.includes("does not exist")) {
      console.log("  ⊘ Column compare_price not found (already renamed?)");
    } else {
      throw e;
    }
  }

  // Step 3: Fix category slugs
  console.log("[3/5] Fixing category slugs ...");
  const r1 = await sql`UPDATE categories SET slug = 'planets' WHERE slug = 'planet-attar'`;
  console.log(`  planet-attar → planets: ${r1.count} row(s) updated`);
  const r2 = await sql`UPDATE categories SET slug = 'zodiac' WHERE slug = 'zodiac-attar'`;
  console.log(`  zodiac-attar → zodiac: ${r2.count} row(s) updated`);

  // Step 4: RLS policy
  console.log("[4/5] Setting RLS policy ...");
  await sql`ALTER TABLE products ENABLE ROW LEVEL SECURITY`;
  await sql`DROP POLICY IF EXISTS "products_select_public" ON products`;
  await sql`DROP POLICY IF EXISTS "products_public_read" ON products`;
  await sql`CREATE POLICY "products_public_read" ON products FOR SELECT USING (is_active = true)`;
  console.log("  ✓ Policy products_public_read created");

  // Step 5: Verify
  console.log("\n[5/5] Verification ...");
  const products = await sql`
    SELECT id, name, slug, price, original_price, category_id, is_active
    FROM products
    LIMIT 10
  `;
  console.log(`  Products found: ${products.length}`);
  for (const p of products) {
    console.log(`  - ${p.name} | price=${p.price} | original_price=${p.original_price} | active=${p.is_active}`);
  }

  const cats = await sql`SELECT id, slug, name FROM categories ORDER BY name`;
  console.log(`\n  Categories (${cats.length}):`);
  for (const c of cats) {
    console.log(`  - ${c.slug} → ${c.name}`);
  }

  console.log("\n=== Migration complete ===");
  await sql.end();
}

main().catch(async (err) => {
  console.error("\n✗ Migration failed:", err.message);
  await sql.end();
  process.exit(1);
});
