import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPostBySlug, getAllBlogSlugs } from "@/lib/blog";
import { absoluteUrl, pageMetadata, articleJsonLdFromRow } from "@/lib/seo";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/images";

export const revalidate = 3600;

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

  const publishedAt = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null;
  const imageUrl = post.cover_image ?? PLACEHOLDER_IMAGE_URL;
  const articleLd = articleJsonLdFromRow(post);

  return (
    <main className="min-h-screen bg-white">
      <article className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />

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
            {post.author_name && <span>{post.author_name}</span>}
            {publishedAt && <time dateTime={post.published_at ?? undefined}>{publishedAt}</time>}
            {post.reading_time != null && post.reading_time > 0 && (
              <span>{post.reading_time} min read</span>
            )}
          </div>
        </header>

        {post.cover_image && (
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-neutral-100">
            <Image
              src={post.cover_image.startsWith("http") ? post.cover_image : imageUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 672px"
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

        <p className="mt-12">
          <Link href="/blog" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
            ← Back to Journal
          </Link>
        </p>
      </article>
    </main>
  );
}
