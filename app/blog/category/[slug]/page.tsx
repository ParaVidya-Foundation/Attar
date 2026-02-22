import type { Metadata } from "next";
import Link from "next/link";
import { getPostsByCategory, getBlogCategories } from "@/lib/blog";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import BlogList from "@/components/blog/BlogList";
import { notFound } from "next/navigation";

export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateStaticParams() {
  const categories = await getBlogCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { category } = await getPostsByCategory(slug, 1);
  if (!category) return { title: "Category not found" };

  const title = `${category.name} | Journal`;
  const description =
    category.description ?? `Articles in ${category.name}. Spiritual fragrance guides and Vedic perfume wisdom.`;
  const path = `/blog/category/${category.slug}`;

  return {
    ...pageMetadata({ title, description, path, type: "website" }),
    robots: "index, follow",
  };
}

export default async function BlogCategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(String(pageParam), 10) || 1);
  const { posts, totalPages, category } = await getPostsByCategory(slug, page);
  const categories = await getBlogCategories();

  if (!category) notFound();

  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Journal", path: "/blog" },
    { name: category.name, path: `/blog/category/${category.slug}` },
  ]);

  return (
    <main className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        <header className="mb-14">
          <Link href="/blog" className="text-sm font-medium text-neutral-500 hover:text-neutral-900">
            Journal
          </Link>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-3 text-lg text-neutral-600">{category.description}</p>
          )}
        </header>

        {categories.length > 0 && (
          <nav className="mb-10 flex flex-wrap gap-2" aria-label="Blog categories">
            <Link
              href="/blog"
              className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900"
            >
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/blog/category/${c.slug}`}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  c.id === category.id
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-900 hover:text-neutral-900"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </nav>
        )}

        {posts.length === 0 ? (
          <p className="text-neutral-500">No posts in this category yet.</p>
        ) : (
          <>
            <BlogList posts={posts} />
            {totalPages > 1 && (
              <nav className="mt-14 flex items-center justify-center gap-2" aria-label="Pagination">
                {page > 1 && (
                  <Link
                    href={page === 2 ? `/blog/category/${slug}` : `/blog/category/${slug}?page=${page - 1}`}
                    className="rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    Previous
                  </Link>
                )}
                <span className="text-sm text-neutral-500">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`/blog/category/${slug}?page=${page + 1}`}
                    className="rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    Next
                  </Link>
                )}
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  );
}
