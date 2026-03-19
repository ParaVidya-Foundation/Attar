import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  getPostBySlug,
  getAllBlogSlugs,
  getRecentPosts,
  getRelatedPosts,
  getBlogCategoriesWithCounts,
  getPopularPosts,
} from "@/lib/blog";
import { absoluteUrl, pageMetadata, articleJsonLdFromRow, breadcrumbJsonLd } from "@/lib/seo";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/images";
import BlogSidebarSection from "@/components/blog/BlogSidebarSection";
import BlogCategorySidebar from "@/components/blog/BlogCategorySidebar";
import { PostViewTracker } from "@/components/blog/PostViewTracker";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };

  const title = `${post.title} | Anand Ras — Spiritual Fragrance Guide`;
  const description = post.excerpt ?? post.title;
  const path = `/blog/${post.slug}`;
  const image = post.cover_image
    ? (post.cover_image.startsWith("http") ? post.cover_image : absoluteUrl(post.cover_image))
    : absoluteUrl("/og/blog-1200x630.jpg");

  return {
    ...pageMetadata({
      title: post.title,
      description,
      path,
      ogImage: image,
      type: "article",
    }),
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: absoluteUrl(path),
      siteName: "Anand Rasa Fragrance",
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
      ...(post.published_at && { publishedTime: post.published_at }),
      ...(post.author_name && { authors: [post.author_name] }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [image],
    },
    alternates: { canonical: path },
    robots: "index, follow",
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [recentPosts, relatedPosts, categoryCounts, popularPosts] = await Promise.all([
    getRecentPosts(5),
    getRelatedPosts(
      post.id,
      post.blog_categories?.id ?? undefined,
      post.tags.map((tag) => tag.id),
      4
    ),
    getBlogCategoriesWithCounts(),
    getPopularPosts(4),
  ]);

  const filteredRecentPosts = recentPosts.filter((p) => p.id !== post.id).slice(0, 5);
  const filteredRelatedPosts = relatedPosts.filter((p) => p.id !== post.id).slice(0, 4);
  const filteredPopularPosts = popularPosts.filter((p) => p.id !== post.id).slice(0, 4);
  const continueReading = [...filteredRelatedPosts, ...filteredRecentPosts]
    .filter((value, index, self) => self.findIndex((item) => item.id === value.id) === index)
    .slice(0, 4);

  const publishedAt = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null;
  const imageUrl = post.cover_image ?? PLACEHOLDER_IMAGE_URL;
  const articleLd = articleJsonLdFromRow(post);
  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Journal", path: "/blog" },
    ...(post.blog_categories ? [{ name: post.blog_categories.name, path: `/blog/category/${post.blog_categories.slug}` }] : []),
    { name: post.title, path: `/blog/${post.slug}` },
  ]);

  return (
    <main className="min-h-screen bg-white">
      <PostViewTracker postId={post.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-16 lg:grid-cols-[1fr_320px] sm:py-20">
        <article>
          <header className="mb-10">
            {post.blog_categories && (
              <Link
                href={`/blog/category/${post.blog_categories.slug}`}
                className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
              >
                {post.blog_categories.name}
              </Link>
            )}
            <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl leading-tight">
              {post.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1 text-base text-neutral-500">
              {post.author_name && <author>{post.author_name}</author>}
              {publishedAt && <time dateTime={post.published_at ?? undefined}>{publishedAt}</time>}
              {post.reading_time != null && post.reading_time > 0 && <span>{post.reading_time} min read</span>}
            </div>
          </header>

          {post.cover_image && (
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
              <Image
                src={post.cover_image.startsWith("http") ? post.cover_image : imageUrl}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover"
                priority
              />
            </div>
          )}

          {post.excerpt && (
            <p className="mt-8 text-xl leading-relaxed text-neutral-600">{post.excerpt}</p>
          )}

          {post.content && (
            <div
              className="prose prose-neutral prose-lg mt-10 max-w-none font-body text-neutral-800 prose-p:leading-relaxed prose-p:text-[1.125rem] prose-headings:font-heading prose-headings:tracking-tight prose-a:text-neutral-900 prose-img:rounded-lg"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          )}

          {post.tags.length > 0 && (
            <footer className="mt-14 border-t border-neutral-200 pt-8">
              <span className="text-sm text-neutral-500">Tags: </span>
              {post.tags.map((t) => (
                <Link
                  key={t.id}
                  href={`/blog/tag/${t.slug}`}
                  className="mr-2 text-sm font-medium text-neutral-700 hover:text-neutral-900"
                >
                  {t.name}
                </Link>
              ))}
            </footer>
          )}

          {continueReading.length > 0 && (
            <section className="mt-14 border-t border-neutral-200 pt-8">
              <h2 className="text-lg font-semibold text-neutral-900">Continue Reading</h2>
              <ul className="mt-4 space-y-3">
                {continueReading.map((item) => (
                  <li key={item.id}>
                    <Link href={`/blog/${item.slug}`} className="text-sm text-neutral-700 hover:text-neutral-900">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="mt-12">
            <Link href="/blog" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
              ← Back to Journal
            </Link>
          </p>
        </article>
        <aside className="space-y-4">
          <BlogSidebarSection title="Recent Posts" posts={filteredRecentPosts} />
          <BlogSidebarSection title="Related Posts" posts={filteredRelatedPosts} />
          <BlogCategorySidebar categories={categoryCounts} activeSlug={post.blog_categories?.slug} />
          <BlogSidebarSection title="Popular Posts" posts={filteredPopularPosts} />
        </aside>
      </div>
    </main>
  );
}
