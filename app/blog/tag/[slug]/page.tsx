import type { Metadata } from "next";
import Link from "next/link";
import { getPostsByTag, getBlogTags } from "@/lib/blog";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import BlogList from "@/components/blog/BlogList";
import { notFound } from "next/navigation";

export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateStaticParams() {
  const tags = await getBlogTags();
  return tags.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { tag } = await getPostsByTag(slug, 1);
  if (!tag) return { title: "Tag not found" };

  const title = `${tag.name} | Journal`;
  const description = `Articles tagged with ${tag.name}. Spiritual fragrance guides and Vedic perfume wisdom.`;
  const path = `/blog/tag/${tag.slug}`;

  return {
    ...pageMetadata({ title, description, path, type: "website" }),
    robots: "index, follow",
  };
}

export default async function BlogTagPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(String(pageParam), 10) || 1);
  const { posts, totalPages, tag } = await getPostsByTag(slug, page);
  const tags = await getBlogTags();

  if (!tag) notFound();

  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Journal", path: "/blog" },
    { name: `Tag: ${tag.name}`, path: `/blog/tag/${tag.slug}` },
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
            Tag: {tag.name}
          </h1>
        </header>

        {tags.length > 0 && (
          <nav className="mb-10 flex flex-wrap gap-2" aria-label="Blog tags">
            {tags.map((t) => (
              <Link
                key={t.id}
                href={`/blog/tag/${t.slug}`}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  t.id === tag.id
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-900 hover:text-neutral-900"
                }`}
              >
                {t.name}
              </Link>
            ))}
          </nav>
        )}

        {posts.length === 0 ? (
          <p className="text-neutral-500">No posts with this tag yet.</p>
        ) : (
          <>
            <BlogList posts={posts} />
            {totalPages > 1 && (
              <nav className="mt-14 flex items-center justify-center gap-2" aria-label="Pagination">
                {page > 1 && (
                  <Link
                    href={page === 2 ? `/blog/tag/${slug}` : `/blog/tag/${slug}?page=${page - 1}`}
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
                    href={`/blog/tag/${slug}?page=${page + 1}`}
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
