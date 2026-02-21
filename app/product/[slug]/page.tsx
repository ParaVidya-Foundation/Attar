import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductShowcase from "@/components/product/ProductShowcase";
import ProductInfo from "@/components/product/Productinfo";
import TrustBar from "@/components/Home/TrustBar";
import OtherInfo from "@/components/product/otherinfo";
import { getProductBySlug } from "@/lib/api/products";
import { absoluteUrl, BRAND } from "@/lib/seo";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product",
      description: "Product details",
    };
  }

  const title = product.meta_title ?? product.name;
  const description = product.meta_description ?? product.short_description ?? product.description ?? "Shop premium attars.";

  return {
    title,
    description,
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    openGraph: {
      title,
      description,
      images: [
        {
          url: product.images[0]?.url
            ? (product.images[0].url.startsWith("http") ? product.images[0].url : absoluteUrl(product.images[0].url))
            : absoluteUrl(`/products/${product.slug}.webp`),
        },
      ],
      type: "website",
    },
  };
}

function buildProductJsonLd(product: {
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  description: string | null;
  short_description: string | null;
  images: { url: string }[];
}) {
  const url = absoluteUrl(`/product/${product.slug}`);
  const image = product.images[0]?.url
    ? (product.images[0].url.startsWith("http") ? product.images[0].url : absoluteUrl(product.images[0].url))
    : absoluteUrl(`/products/${product.slug}.webp`);
  const desc = product.short_description ?? product.description ?? "Premium handcrafted attar.";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: desc,
    image: [image],
    url,
    brand: { "@type": "Brand", name: BRAND.name },
    category: "Attar / Natural Perfume Oil",
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability: "https://schema.org/InStock",
      url,
      seller: { "@type": "Organization", name: BRAND.name },
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const images =
    product.images?.length > 0
      ? product.images.map((img) => ({ src: img.url, alt: product.name }))
      : [{ src: `/products/${product.slug}.webp`, alt: product.name }];

  const showcaseProduct = {
    id: product.id,
    slug: product.slug,
    title: product.name,
    images,
  };

  const variants = product.variants ?? [];
  const firstPrice = variants[0]?.price ?? product.price;
  const infoProduct = {
    id: product.id,
    slug: product.slug,
    title: product.name,
    brand: "Anand Ras",
    price: `₹${(firstPrice / 100).toLocaleString("en-IN")}`,
    priceValue: firstPrice,
    currency: "INR",
    description: product.short_description ?? product.description ?? "",
    longDescription: product.description ?? undefined,
    images,
    sizes: (variants ?? []).map((v) => ({ id: v.id, label: `${v.size_ml}ml`, priceValue: v.price })),
    inStock: (variants ?? []).some((v) => v.stock > 0),
  };

  const jsonLd = buildProductJsonLd(product);

  return (
    <main className="w-full min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex w-full flex-col lg:flex-row overflow-hidden">
        <ProductShowcase product={showcaseProduct} />
        <ProductInfo product={infoProduct} />
      </div>

      <OtherInfo
        items={[
          { title: "Description", text: product.short_description ?? "Premium handcrafted attar blend." },
          { title: "Details", text: product.description ?? "Crafted for long-lasting daily wear." },
          { title: "Category", text: "Luxury Attar" },
        ]}
      />

      <TrustBar />
    </main>
  );
}
