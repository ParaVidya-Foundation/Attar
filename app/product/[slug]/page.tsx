import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductShowcase from "@/components/product/ProductShowcase";
import ProductInfo from "@/components/product/Productinfo";
import TrustBar from "@/components/Home/TrustBar";
import OtherInfo from "@/components/product/otherinfo";
import { getProductBySlug } from "@/lib/fetchers";

export const revalidate = 3600;

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

  const description = product.short_description ?? product.description ?? "Shop premium attars.";

  return {
    title: product.name,
    description,
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    openGraph: {
      title: product.name,
      description,
      images: [{ url: `/products/${product.slug}.webp` }],
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const images = [
    {
      src: `/products/${product.slug}.webp`,
      alt: product.name,
    },
  ];

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
    brand: "Kamal Vallabh",
    price: `₹${product.price.toLocaleString("en-IN")}`,
    priceValue: product.price,
    currency: "INR",
    description: product.short_description ?? product.description ?? "",
    longDescription: product.description ?? undefined,
    images,
    inStock: true,
  };

  return (
    <main className="w-full min-h-screen bg-white" itemScope itemType="https://schema.org/Product">
      <div className="flex w-full flex-col lg:flex-row">
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
