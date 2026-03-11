import Link from "next/link";
import { CheckCircle } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import { mapToCardProduct } from "@/lib/productMapper";
import { getPostPurchaseRecommendations } from "@/lib/recommendations";
import { absoluteUrl } from "@/lib/seo";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/images";

type PageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function OrderSuccessPage({ searchParams }: PageProps) {
  const { orderId } = await searchParams;
  const recommendations = orderId ? await getPostPurchaseRecommendations(orderId, 4) : [];

  return (
    <div className="bg-white px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {recommendations.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ItemList",
                itemListElement: recommendations.map((product, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  item: {
                    "@type": "Product",
                    name: product.name,
                    image: product.images[0]?.url
                      ? product.images[0].url.startsWith("http")
                        ? product.images[0].url
                        : absoluteUrl(product.images[0].url)
                      : absoluteUrl(PLACEHOLDER_IMAGE_URL),
                    url: absoluteUrl(`/product/${product.slug}`),
                    offers: {
                      "@type": "Offer",
                      priceCurrency: "INR",
                      price: product.price / 100,
                      availability: "https://schema.org/InStock",
                    },
                  },
                })),
              }),
            }}
          />
        )}

        <div className="mx-auto flex min-h-[50vh] max-w-md items-center justify-center text-center">
          <div className="w-full">
            <div className="mx-auto flex h-16 w-16 items-center justify-center border border-green-200 bg-green-50">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            <h1 className="mt-6 font-heading text-3xl tracking-tight text-neutral-900">
              Order Confirmed
            </h1>

            <p className="mt-3 text-sm text-neutral-500">
              Thank you for your purchase. Your payment has been received and your order is being processed.
            </p>

            {orderId && (
              <div className="mt-6 border border-neutral-200 bg-neutral-50 px-5 py-4">
                <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Order ID
                </p>
                <p className="mt-1 font-mono text-sm text-neutral-700">
                  {orderId.slice(0, 8).toUpperCase()}
                </p>
              </div>
            )}

            <p className="mt-6 text-xs text-neutral-400">
              A confirmation will be sent to your email shortly.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/shop"
                className="bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black"
              >
                Continue Shopping
              </Link>
              <Link
                href="/"
                className="border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        {recommendations.length > 0 && (
          <section className="py-20">
            <div className="mb-10 text-center">
              <p className="text-xs font-semibold tracking-[0.24em] text-neutral-500">POST PURCHASE</p>
              <h2 className="mt-2 font-heading text-3xl text-neutral-900">You May Also Like</h2>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-14 md:grid-cols-3 lg:grid-cols-4">
              {recommendations.map((product) => (
                <ProductCard key={product.id} product={mapToCardProduct(product)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
