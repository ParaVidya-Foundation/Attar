"use client";

import React from "react";
import BlogLayout, { type BlogArticle } from "@/components/blog/bloglayout";
import RelatedPosts from "@/components/blog/relatedpost";
import RecentPosts from "@/components/blog/recentpost";
import Categories from "@/components/blog/categories";
import type { BlogCardProps } from "@/components/blog/BlogCard";

/* -------------------- Demo Blog Data -------------------- */
const featuredPost: BlogArticle = {
  id: "ai-astrology",
  title: "Stree Dosh",
  image: "/Blogs/blogimg/StreeDosh.webp",
  imageAlt: "Stree Dosh",
  date: "2025-08-03",
  author: "Soham Vashist",
  category: "Stree Dosh",
  excerpt: "Explore how Stree Dosh can be used to improve the accuracy of predictions.",
  content: {
    featuredGraphic: {
      title: "Stree Dosh",
      image: "/Blogs/blogimg/StreeDosh.webp",
      alt: "Stree Dosh",
    },
    sections: [
      {
        heading: "Blending Tradition With Innovation",
        paragraphs: [
          "Stree Dosh is a dosh that can be used to improve the accuracy of predictions.",
          "Stree Dosh can be used to improve the accuracy of predictions.",
        ],
      },
      {
        heading: "Building Smarter Forecasting Tools",
        paragraphs: [
          "Stree Dosh can be used to improve the accuracy of predictions.",
          "Stree Dosh can be used to improve the accuracy of predictions.",
        ],
      },
    ],
  },
};

const recentPosts: BlogCardProps[] = [
  {
    id: "1",
    title: "Pitra Dosh",
    image: "/Blogs/blogimg/PitraDosh.webp",
    imageAlt: "Pitra Dosh",
    date: new Date("2025-08-02"),
    href: "/research/blogs/BlogPage",
  },
  {
    id: "2",
    title: "Mangal Badh",
    image: "/Blogs/blogimg/MangalBadh.webp",
    imageAlt: "Mangal Badh",
    date: new Date("2025-08-01"),
    href: "/research/blogs/BlogPage",
  },
  {
    id: "3",
    title: "Stree Dosh",
    image: "/Blogs/blogimg/StreeDosh.webp",
    imageAlt: "Stree Dosh",
    date: new Date("2025-07-28"),
    href: "/research/blogs/BlogPage",
  },
];

const relatedPosts: BlogCardProps[] = recentPosts;

/* ============================================================
   PAGE — FIXED: SIDEBAR + BLOG LAYOUT TOP-ALIGNED SIDE-BY-SIDE
=============================================================== */
export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      {/* -------------------------------------- */}
      {/* TOP SECTION — BLOG + SIDEBAR TOGETHER */}
      {/* -------------------------------------- */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div
          className="
            grid grid-cols-1 
            lg:grid-cols-[2fr_1fr] 
            gap-12
          "
        >
          {/* LEFT: BLOG ARTICLE */}
          <div className="w-full">
            <BlogLayout post={featuredPost} />
          </div>

          {/* RIGHT: STICKY SIDEBAR */}
          <aside className="hidden lg:block sticky top-24 space-y-10 h-fit">
            <RecentPosts posts={recentPosts} />

            <Categories />
          </aside>
        </div>
      </section>

      {/* -------------------------------------- */}
      {/* RELATED POSTS */}
      {/* -------------------------------------- */}
      <section className="border-t border-gray-200 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <RelatedPosts posts={relatedPosts} />
        </div>
      </section>

      {/* -------------------------------------- */}
      {/* FOOTER */}
      {/* -------------------------------------- */}
      <footer className="border-t border-gray-200 mt-24 py-12 text-center text-sm text-gray-500">
        <p>© 2025 Kalyan Research. All rights reserved.</p>
      </footer>
    </main>
  );
}
