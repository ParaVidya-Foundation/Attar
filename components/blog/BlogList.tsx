"use client";

import BlogCard from "./BlogCard";
import type { BlogPostListItem } from "@/lib/blog";

const PLACEHOLDER_IMAGE = "/products/placeholder.webp";

type Props = { posts: BlogPostListItem[] };

export default function BlogList({ posts }: Props) {
  return (
    <ul className="grid gap-14 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <li key={post.id}>
          <BlogCard
            id={post.id}
            title={post.title}
            image={post.cover_image || PLACEHOLDER_IMAGE}
            imageAlt={post.title}
            date={post.published_at ?? ""}
            excerpt={post.excerpt ?? undefined}
            author={post.author_name ?? undefined}
            category={post.category?.name}
            href={`/blog/${post.slug}`}
          />
        </li>
      ))}
    </ul>
  );
}
