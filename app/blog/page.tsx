import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPosts, getBlogCategories } from "@/lib/blog";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import BlogList from "@/components/blog/BlogList";

export const revalidate = 3600;

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Blog",
    description:
      "Spiritual fragrance guides, attar rituals, and Vedic perfume wisdom. Stories and tips for meditation, puja, and daily ritual.",
    path: "/blog",
    type: "website",
  }),
  robots: "index, follow",
};

type Props = { searchParams: Promise<{ page?: string }> };

export default async function BlogPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(String(pageParam), 10) || 1);
  const { posts, total, totalPages } = await getBlogPosts(page);
  const categories = await getBlogCategories();
  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Journal", path: "/blog" },
  ]);

  return (
    <main className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        <header className="mb-14">
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
            Journal
          </h1>
          <p className="mt-4 text-xl text-neutral-600 leading-relaxed">
            Spiritual fragrance guides, attar rituals, and Vedic perfume wisdom.
          </p>
        </header>

        {categories.length > 0 && (
          <nav className="mb-10 flex flex-wrap gap-2" aria-label="Blog categories">
            <Link
              href="/blog"
              className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900"
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/blog/category/${cat.slug}`}
                className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900"
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        )}

        {posts.length === 0 ? (
          <p className="text-neutral-500">No posts yet. Check back soon.</p>
        ) : (
          <>
            <BlogList posts={posts} />
            {totalPages > 1 && (
              <nav className="mt-14 flex items-center justify-center gap-2" aria-label="Pagination">
                {page > 1 && (
                  <Link
                    href={page === 2 ? "/blog" : `/blog?page=${page - 1}`}
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
                    href={`/blog?page=${page + 1}`}
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
