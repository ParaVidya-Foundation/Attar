import Image from "next/image";
import Link from "next/link";
import { getNakshatraAttars } from "@/lib/products/getNakshatraAttars";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/images";

export default async function NakshatraAttarShowcase() {
  const products = await getNakshatraAttars();
  const items = products.slice(0, 27);

  if (!items.length) return null;

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
      url: `/products/${product.slug}`,
    })),
  };

  return (
    <section className="bg-[#F6F1E7] py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl text-neutral-900">
              Nakshatra Attar Collection
            </h2>
            <p className="mt-2 max-w-xl text-sm sm:text-base text-neutral-700">
              Twenty-seven artisanal attars, each tuned to a lunar mansion.
              Choose the fragrance aligned with your birth star.
            </p>
          </div>
          <p className="text-xs uppercase tracking-[0.18em] text-neutral-600">
            27 nakshatra attars
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group"
            >
              <article className="flex h-full flex-col bg-white border border-black/5 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={PLACEHOLDER_IMAGE_URL}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    priority={false}
                  />
                </div>

                <div className="flex flex-1 flex-col px-4 sm:px-5 py-4 sm:py-5">
                  <div className="flex-1">
                    <h3 className="font-heading text-base sm:text-lg text-neutral-900">
                      {product.name}
                    </h3>
                    {product.short_description && (
                      <p className="mt-2 text-sm text-neutral-600 line-clamp-3">
                        {product.short_description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-neutral-900">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="mt-0.5 text-xs text-neutral-500 line-through">
                          ₹{product.original_price.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    <span className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium tracking-wide text-neutral-900 border border-neutral-900">
                      View Product
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
    </section>
  );
}

