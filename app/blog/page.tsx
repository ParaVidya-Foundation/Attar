"use client";

import BlogCard from "@/components/blog/BlogCard";
import BlogHero from "@/components/blog/BlogHero";

const posts = [
  {
    id: "1",
    title: "Blog Post 1",
    image: "/images/blog/blog-1.jpg",
  },
  {
    id: "1",
    title: "Blog Post 1",
    image: "/images/blog/blog-1.jpg",
  },
  {
    id: "1",
    title: "Blog Post 1",
    image: "/images/blog/blog-1.jpg",
  },
  {
    id: "1",
    title: "Blog Post 1",
    image: "/images/blog/blog-1.jpg",
  },
];

export default function BlogsPage() {
  return (
    <main className="bg-white">
      <BlogHero />
      <div className="max-w-[1100px] mx-auto px-6 grid gap-14 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard
            key={post.id}
            id={post.id}
            title={post.title}
            image={post.image}
            imageAlt={post.title}
            date={new Date()}
          />
        ))}
      </div>
    </main>
  );
}
