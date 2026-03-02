import BlogCard from "@/components/blog/BlogCard";
import type { BlogPostListItem } from "@/lib/blog";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/images";

type Props = {
  title: string;
  posts: BlogPostListItem[];
};

export default function BlogSidebarSection({ title, posts }: Props) {
  if (posts.length === 0) return null;

  return (
    <section className="border border-neutral-200 bg-white p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-900">{title}</h2>
      <div className="mt-4 space-y-4">
        {posts.map((post) => (
          <BlogCard
            key={post.id}
            id={post.id}
            title={post.title}
            image={post.cover_image || PLACEHOLDER_IMAGE_URL}
            imageAlt={post.title}
            date={post.published_at ?? ""}
            href={`/blog/${post.slug}`}
            variant="compact"
          />
        ))}
      </div>
    </section>
  );
}
