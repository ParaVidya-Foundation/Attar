import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import Link from "next/link";
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
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { PRODUCT_FAQS } from "@/lib/seo/productFaq";

export const revalidate = 60;

const IncenseTable = dynamic(() => import("@/components/product/features/incensetable"));
const FAQincense = dynamic(() => import("@/components/product/features/FAQincense"));
const StressUse = dynamic(() => import("@/components/product/features/stressuse"));
const CustomerSupport = dynamic(() => import("@/components/product/features/CustomerSupport"));
const FindProduct = dynamic(() => import("@/components/product/features/findproduct"));

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

  const path = `/product/${product.slug}`;
  return {
    ...pageMetadata({
      title,
      description,
      path,
      type: "product",
    }),
    alternates: { canonical: absoluteUrl(path) },
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
  variants?: { id: string; price: number; size_ml: number }[];
}) {
  const url = absoluteUrl(`/product/${product.slug}`);
  const image = product.images[0]?.url
    ? product.images[0].url.startsWith("http")
      ? product.images[0].url
      : absoluteUrl(product.images[0].url)
    : absoluteUrl(PLACEHOLDER_IMAGE_URL);
  const desc = product.short_description ?? product.description ?? "Premium handcrafted attar.";
  const variants = product.variants ?? [];
  const prices = variants.length > 0 ? variants.map((v) => v.price / 100) : [product.price / 100];
  const lowPrice = Math.min(...prices);
  const highPrice = Math.max(...prices);
  const useAggregate = variants.length > 1;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: desc,
    image: [image],
    url,
    brand: { "@type": "Brand", name: BRAND.name },
    category: "Attar / Natural Perfume Oil",
    offers: useAggregate
      ? {
          "@type": "AggregateOffer",
          priceCurrency: "INR",
          lowPrice,
          highPrice,
          offerCount: variants.length,
          availability: "https://schema.org/InStock",
          url,
        }
      : {
          "@type": "Offer",
          priceCurrency: "INR",
          price: lowPrice,
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
  const features = getProductFeatures(product.slug, product.category_slug);
  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: product.name, path: `/product/${product.slug}` },
  ]);

  return (
    <main className="w-full min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: PRODUCT_FAQS.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: f.answer,
              },
            })),
          }),
        }}
      />
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

      {features.showStressUse && <StressUse />}
      {features.showIncenseTable && <IncenseTable />}
      {features.showFindProduct && <FindProduct />}

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

      {/* Visible FAQ section for SEO + AI discoverability */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-6">
          <header className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#1e2023] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-neutral-500 mt-2">
              About attars, zodiac perfumes &amp; spiritual fragrances
            </p>
          </header>
          <div className="space-y-3">
            {PRODUCT_FAQS.map((faq, idx) => (
              <details key={idx} className="group border border-neutral-200 bg-white p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-medium text-neutral-800">
                  <span>{faq.question}</span>
                  <svg
                    className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 8l5 5 5-5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </summary>
                <p className="mt-3 text-sm text-neutral-600 leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Internal linking for SEO crawl depth */}
      <nav className="bg-white pb-16" aria-label="Explore more">
        <div className="mx-auto max-w-3xl px-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/shop"
            className="border border-neutral-300 px-5 py-2.5 text-sm text-neutral-700 transition-colors hover:border-black hover:text-black"
          >
            Shop All Fragrances
          </Link>
          <Link
            href="/collections/zodiac"
            className="border border-neutral-300 px-5 py-2.5 text-sm text-neutral-700 transition-colors hover:border-black hover:text-black"
          >
            Zodiac Attars
          </Link>
          <Link
            href="/collections/planets"
            className="border border-neutral-300 px-5 py-2.5 text-sm text-neutral-700 transition-colors hover:border-black hover:text-black"
          >
            Planet Attars
          </Link>
          <Link
            href="/find-fragrance"
            className="border border-neutral-300 px-5 py-2.5 text-sm text-neutral-700 transition-colors hover:border-black hover:text-black"
          >
            Astro Fragrance Finder
          </Link>
          <Link
            href="/blog"
            className="border border-neutral-300 px-5 py-2.5 text-sm text-neutral-700 transition-colors hover:border-black hover:text-black"
          >
            Fragrance Journal
          </Link>
        </div>
      </nav>

      <TrustBar />
      {features.showDiscountPoster && <DiscountPosterIncense />}
      {features.showFAQincense && <FAQincense />}
      <CustomerSupport />
    </main>
  );
}
