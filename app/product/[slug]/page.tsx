/**
 * Product page — ISR, server-rendered
 * Fetches from Supabase, renders with ProductShowcase + ProductInfo
 */
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { pageMetadata, BRAND, absoluteUrl } from "@/lib/seo";
import ProductShowcase from "@/components/product/ProductShowcase";
import ProductInfo from "@/components/product/Productinfo";
import TrustBar from "@/components/Home/TrustBar";
import OtherInfo from "@/components/product/otherinfo";
import type { Product } from "@/lib/types";

export const revalidate = 3600;

async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select(
      `
      id,
      slug,
      name,
      description,
      origin,
      notes,
      zodiac,
      planet,
      longevity,
      spiritual_benefits,
      badges,
      price,
      currency,
      meta_title,
      meta_description,
      product_images (url, alt, position),
      product_sizes (size_ml, price)
    `,
    )
    .eq("slug", slug)
    .is("deleted_at", null)
    .single();

  if (!product) return null;

  const { data: inv } = await supabase
    .from("inventory")
    .select("size_ml, stock")
    .eq("product_id", product.id);

  const stockBySize = new Map((inv ?? []).map((r) => [r.size_ml, r.stock]));
  const totalStock = (inv ?? []).reduce((s, r) => s + r.stock, 0);
  const inStock = totalStock > 0;

  const sizes = (product.product_sizes ?? []).sort(
    (a, b) => (a as { size_ml: number }).size_ml - (b as { size_ml: number }).size_ml,
  );
  const minPrice = sizes.length
    ? Math.min(...sizes.map((s) => (s as { price: number }).price))
    : product.price;

  return {
    ...product,
    product_images: product.product_images ?? [],
    product_sizes: sizes,
    inStock,
    stockBySize,
    minPrice,
  } as Product & { inStock: boolean; stockBySize: Map<number, number>; minPrice: number };
}

export async function generateStaticParams() {
  const { readFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const dataPath = path.join(process.cwd(), "data", "attars.json");
  let slugs: string[] = [];
  try {
    const raw = await readFile(dataPath, "utf8");
    const attars = JSON.parse(raw);
    slugs = attars.map((a: { slug: string }) => a.slug);
  } catch {
    slugs = [];
  }
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const title = product.meta_title ?? product.name;
  const description = product.meta_description ?? (product.description ?? "").slice(0, 160);
  const image = (product.product_images?.[0] as { url?: string } | undefined)?.url ?? BRAND.ogImage;
  return pageMetadata({
    title,
    description,
    path: `/product/${product.slug}`,
    ogImage: image,
    type: "product",
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const images = (product.product_images ?? [])
    .sort((a, b) => (a as { position: number }).position - (b as { position: number }).position)
    .map((img) => ({
      src: (img as { url: string }).url,
      alt: (img as { alt?: string }).alt ?? product.name,
    }));
  if (images.length === 0) {
    images.push({ src: BRAND.ogImage, alt: product.name });
  }

  const sizes = (product.product_sizes ?? []).map((s) => {
    const row = s as { size_ml: number; price: number };
    return {
      id: `${row.size_ml}ml`,
      label: `${row.size_ml} ml — ₹${row.price.toLocaleString("en-IN")}`,
      priceModifier: row.price - product.price,
    };
  });

  const notes = product.notes as { opening?: string[]; heart?: string[]; base?: string[] } | null | undefined;
  const notesForComponent = notes
    ? {
        top: notes.opening ?? [],
        heart: notes.heart ?? [],
        base: notes.base ?? [],
      }
    : undefined;

  const minPrice =
    sizes.length > 0
      ? Math.min(...(product.product_sizes ?? []).map((s) => (s as { price: number }).price))
      : product.price;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: (product.description ?? "").slice(0, 500),
    brand: { "@type": "Brand", name: BRAND.name },
    category: "Attar / Natural Perfume Oil",
    image: images.map((i) => i.src),
    url: absoluteUrl(`/product/${product.slug}`),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: minPrice,
      highPrice:
        sizes.length > 0
          ? Math.max(...(product.product_sizes ?? []).map((s) => (s as { price: number }).price))
          : minPrice,
      offerCount: sizes.length || 1,
      availability: (product as { inStock?: boolean }).inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/product/${product.slug}`),
    },
  };

  const showcaseProduct = {
    id: product.id,
    slug: product.slug,
    title: product.name,
    images,
  };

  const infoProduct = {
    id: product.id,
    slug: product.slug,
    title: product.name,
    brand: BRAND.name,
    price: `₹${minPrice.toLocaleString("en-IN")}`,
    priceValue: minPrice,
    currency: product.currency,
    description: (product.description ?? "").slice(0, 200),
    longDescription: product.description ?? undefined,
    images,
    sizes,
    notes: notesForComponent,
    inStock: (product as { inStock?: boolean }).inStock ?? true,
  };

  return (
    <main className="w-full min-h-screen bg-white" itemScope itemType="https://schema.org/Product">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="flex w-full flex-col lg:flex-row">
        <ProductShowcase product={showcaseProduct} />
        <ProductInfo product={infoProduct} />
      </div>

      <OtherInfo
        items={[
          { title: "Origin", text: product.origin ?? "India" },
          { title: "Longevity", text: product.longevity ?? "8–10 hours" },
          {
            title: "Spiritual Benefits",
            text: (product.spiritual_benefits ?? []).join(" • ") || "Calm, presence",
          },
        ]}
      />

      <TrustBar />
    </main>
  );
}
