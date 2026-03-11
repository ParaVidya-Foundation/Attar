import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import ProductShowcase from "@/components/product/ProductShowcase";
import ProductInfo from "@/components/product/Productinfo";
import TrustBar from "@/components/Home/TrustBar";
import OtherInfo from "@/components/product/otherinfo";
import { getProductBySlug } from "@/lib/api/products";
import { absoluteUrl, BRAND } from "@/lib/seo";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/images";
import { getProductFeatures } from "@/config/productFeatures";
import ProductCard from "@/components/shop/ProductCard";
import { mapToCardProduct } from "@/lib/productMapper";
import { ProductEventTracker } from "@/components/recommendations/ProductEventTracker";
import { getBehavioralRecommendations } from "@/lib/recommendations";
import DiscountPosterIncense from "@/components/product/features/DiscountPosterincense";

export const revalidate = 60;

const IncenseTable = dynamic(() => import("@/components/product/features/incensetable"));
const FAQincense = dynamic(() => import("@/components/product/features/FAQincense"));

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
  const description =
    product.meta_description ?? product.short_description ?? product.description ?? "Shop premium attars.";

  return {
    title,
    description,
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: product.images[0]?.url
            ? product.images[0].url.startsWith("http")
              ? product.images[0].url
              : absoluteUrl(product.images[0].url)
            : absoluteUrl(PLACEHOLDER_IMAGE_URL),
        },
      ],
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
    ? product.images[0].url.startsWith("http")
      ? product.images[0].url
      : absoluteUrl(product.images[0].url)
    : absoluteUrl(PLACEHOLDER_IMAGE_URL);
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

  const recommended = await getBehavioralRecommendations(product.id, 4);

  const mappedImages =
    product.images
      ?.map((img) => (typeof img.url === "string" ? img.url.trim() : ""))
      .filter((url) => url.length > 0)
      .map((url) => ({ src: url, alt: product.name })) ?? [];

  const images = mappedImages.length > 0 ? mappedImages : [{ src: PLACEHOLDER_IMAGE_URL, alt: product.name }];

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
    inStock: true,
  };

  const jsonLd = buildProductJsonLd(product);
  const features = getProductFeatures(product.slug);

  return (
    <main className="w-full min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductEventTracker productId={product.id} />

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

      {features.showIncenseTable && <IncenseTable />}

      {recommended.length > 0 && (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <header className="mb-10 text-center">
              <h2 className="text-2xl sm:text-3xl font-semibold text-black">Recommended Fragrances</h2>
            </header>

            <div className="grid grid-cols-2 gap-x-8 gap-y-14 md:grid-cols-3 lg:grid-cols-4">
              {recommended.map((rec) => (
                <ProductCard key={rec.id} product={mapToCardProduct(rec)} />
              ))}
            </div>

            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "ItemList",
                  itemListElement: recommended.map((rec, index) => ({
                    "@type": "ListItem",
                    position: index + 1,
                    item: {
                      "@type": "Product",
                      name: rec.name,
                      image: rec.images[0]?.url
                        ? rec.images[0].url.startsWith("http")
                          ? rec.images[0].url
                          : absoluteUrl(rec.images[0].url)
                        : absoluteUrl(PLACEHOLDER_IMAGE_URL),
                      url: absoluteUrl(`/product/${rec.slug}`),
                      offers: {
                        "@type": "Offer",
                        priceCurrency: "INR",
                        price: rec.price / 100,
                        availability: "https://schema.org/InStock",
                      },
                    },
                  })),
                }),
              }}
            />
          </div>
        </section>
      )}

      <TrustBar />
      {features.showDiscountPoster && <DiscountPosterIncense />}
      {features.showFAQincense && <FAQincense />}
    </main>
  );
}
