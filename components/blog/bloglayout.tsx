// components/research/blogs/blogpage/bloglayout.tsx
"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { BlogCardProps } from "@/components/blog/BlogCard";

export interface BlogArticle extends BlogCardProps {
  content: {
    featuredGraphic: {
      title: string;
      image: string;
      alt: string;
    };
    sections: Array<{
      heading: string;
      paragraphs: string[];
    }>;
  };
}

interface BlogLayoutProps {
  post: BlogArticle;
}

export default function BlogLayout({ post }: BlogLayoutProps) {
  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 flex-wrap">
          <li>
            <a href="/" className="hover:text-gray-900">
              Home
            </a>
          </li>
          <li>
            <span className="mx-2 text-gray-400">/</span>
          </li>
          <li>
            <a href="/research/blogs" className="hover:text-gray-900">
              Blogs
            </a>
          </li>
          <li>
            <span className="mx-2 text-gray-400">/</span>
          </li>
          <li className="text-gray-900 font-medium">{post.category}</li>
        </ol>
      </nav>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight max-w-5xl"
      >
        {post.title}
      </motion.h1>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 mt-8 text-gray-600">
        {post.author && <span className="font-medium text-gray-900">By {post.author}</span>}
        <span>•</span>

        {post.category && (
          <>
            <span>•</span>
            <span className="px-3 py-1 bg-sky-100 text-sky-700 text-xs font-medium rounded-full">
              {post.category}
            </span>
          </>
        )}
      </div>

      {/* Featured Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative mt-12 w-full aspect-square lg:aspect-square rounded-2xl overflow-hidden shadow-xl"
      >
        <Image
          src={post.content.featuredGraphic.image}
          alt={post.content.featuredGraphic.alt}
          fill
          priority
          className="object-cover"
        />
      </motion.div>

      {/* Article Content */}
      <article className="mt-16 prose prose-lg max-w-none lg:prose-xl">
        {post.content.sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-16 mb-6 first:mt-0">
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph, j) => (
              <p key={j} className="text-gray-700 leading-relaxed text-lg mb-6">
                {paragraph}
              </p>
            ))}
          </motion.div>
        ))}
      </article>
    </div>
  );
}
