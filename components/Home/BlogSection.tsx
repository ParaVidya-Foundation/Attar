import { getRecentPosts } from "@/lib/blog";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/images";
import BlogSectionClient, { type HomeBlogCard } from "@/components/Home/BlogSectionClient";

function formatBlogDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toHomeCard(post: Awaited<ReturnType<typeof getRecentPosts>>[number]): HomeBlogCard {
  const image =
    post.cover_image && post.cover_image.trim().length > 0 ? post.cover_image.trim() : PLACEHOLDER_IMAGE_URL;
  const excerpt =
    (post.excerpt && post.excerpt.trim().length > 0 ? post.excerpt.trim() : null) ?? "Read the latest from our journal.";

  return {
    id: post.id,
    title: post.title,
    excerpt,
    date: formatBlogDate(post.published_at),
    image,
    href: `/blog/${post.slug}`,
  };
}

export const revalidate = 3600;

export default async function BlogSection() {
  const posts = await getRecentPosts(6);
  const blogs = posts.map(toHomeCard);
  return <BlogSectionClient blogs={blogs} />;
}
