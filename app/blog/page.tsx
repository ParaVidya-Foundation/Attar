import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPosts, getBlogCategoriesWithCounts, getRecentPosts } from "@/lib/blog";
import { pageMetadata, breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo";
import BlogList from "@/components/blog/BlogList";
import BlogCategorySidebar from "@/components/blog/BlogCategorySidebar";

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
  const [{ posts, totalPages }, categoryCounts, recentPosts] = await Promise.all([
    getBlogPosts(page),
    getBlogCategoriesWithCounts(),
    getRecentPosts(1),
  ]);
  const featuredPost = recentPosts[0] ?? null;

  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Journal", path: "/blog" },
  ]);
  const itemListLd = itemListJsonLd(posts.map((post) => ({ name: post.title, path: `/blog/${post.slug}` })));

  return (
    <main className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <header className="mb-10">
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">Journal</h1>
          <p className="mt-4 text-xl text-neutral-600 leading-relaxed">
            Spiritual fragrance guides, attar rituals, and Vedic perfume wisdom.
          </p>
        </header>

        {featuredPost && page === 1 && (
          <section className="mb-10 border border-neutral-200 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Latest</p>
            <h2 className="mt-2 text-2xl font-semibold text-neutral-900">
              <Link href={`/blog/${featuredPost.slug}`} className="hover:text-neutral-700">
                {featuredPost.title}
              </Link>
            </h2>
            {featuredPost.excerpt && <p className="mt-2 text-neutral-600">{featuredPost.excerpt}</p>}
          </section>
        )}

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <BlogCategorySidebar categories={categoryCounts} />
          </aside>

          <section>
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
                        className="border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
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
                        className="border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                      >
                        Next
                      </Link>
                    )}
                  </nav>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
