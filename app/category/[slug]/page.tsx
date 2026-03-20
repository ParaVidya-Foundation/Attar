import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductCard, { type Product as CardProduct } from "@/components/shop/ProductCard";
import { getCategories } from "@/lib/fetchers";
import { getProductsByCategory } from "@/lib/api/products";
import { mapToCardProduct } from "@/lib/productMapper";
import { breadcrumbJsonLd, absoluteUrl, pageMetadata } from "@/lib/seo";
import { getCategorySeo } from "@/lib/seo/categorySeo";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    return { title: "Category", description: "Browse category products." };
  }

  const title = `${category.name} Perfumes & Attars — Buy Online`;
  const description = `Shop ${category.name} perfumes, attars & fragrance oils. Discover zodiac, spiritual and long-lasting handcrafted fragrances by Anand Rasa — alcohol-free, made in India.`;
  const path = `/category/${category.slug}`;

  return {
    ...pageMetadata({
      title,
      description,
      path,
      type: "website",
      keywords: [`${category.name.toLowerCase()} attar`, `${category.name.toLowerCase()} perfume`, "buy attar online", "fragrance India"],
    }),
    robots: "index, follow",
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  let products: CardProduct[] = [];
  try {
    products = (await getProductsByCategory(slug)).map(mapToCardProduct);
  } catch {
    products = [];
  }

  const seo = getCategorySeo(slug);

  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: category.name, path: `/category/${category.slug}` },
  ]);

  const faqJsonLd = seo.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: seo.faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  } : null;

  return (
    <main className="w-full bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-12 md:py-16">
        <header className="text-center mb-12">
          <h1 className="font-heading text-3xl md:text-4xl text-[#1e2023]">{category.name}</h1>
          <div className="mx-auto mt-4 h-[2px] w-16 bg-[#d4b07a]" />
        </header>

        {/* SEO intro content */}
        <section className="mx-auto max-w-3xl mb-14">
          <p className="text-sm sm:text-base leading-7 text-gray-600 text-center">{seo.intro}</p>
        </section>

        {/* Product grid */}
        <section className="grid gap-y-14 gap-x-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {products.length === 0 ? (
            <p className="col-span-full text-center text-black/60 py-12">No products available.</p>
          ) : (
            products.map((product) => <ProductCard key={product.id} product={product} />)
          )}
        </section>

        {/* Buying guide */}
        <section className="mx-auto max-w-3xl mt-20">
          <h2 className="font-heading text-2xl text-[#1e2023] text-center">How to Choose</h2>
          <div className="mx-auto mt-4 h-[2px] w-12 bg-[#d4b07a]" />
          <p className="mt-6 text-sm sm:text-base leading-7 text-gray-600 text-center">{seo.buyingGuide}</p>
        </section>

        {/* FAQ section */}
        {seo.faqs.length > 0 && (
          <section className="mx-auto max-w-3xl mt-20">
            <h2 className="font-heading text-2xl text-[#1e2023] text-center">Frequently Asked Questions</h2>
            <div className="mx-auto mt-4 h-[2px] w-12 bg-[#d4b07a]" />
            <div className="mt-8 space-y-4">
              {seo.faqs.map((faq, idx) => (
                <details key={idx} className="group border border-neutral-200 bg-white p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-medium text-neutral-800">
                    <span>{faq.question}</span>
                    <svg className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </summary>
                  <p className="mt-3 text-sm text-neutral-600 leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Internal links */}
        {seo.internalLinks.length > 0 && (
          <nav className="mx-auto max-w-3xl mt-16 flex flex-wrap justify-center gap-3" aria-label="Related pages">
            {seo.internalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border border-neutral-300 px-5 py-2.5 text-sm text-neutral-700 transition-colors hover:border-black hover:text-black"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </main>
  );
}
