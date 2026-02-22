"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { BlogCardProps } from "@/components/blog/BlogCard";
import { format } from "date-fns";

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
    <main className="w-full bg-white">
      {/* Editorial container (Apple reading width) */}
      <div className="mx-auto max-w-[1100px] px-6 sm:px-8 lg:px-10 py-10 sm:py-14 lg:py-16">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs tracking-wide text-black/50 mb-8">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-black transition-colors">
                Home
              </Link>
            </li>
            <span>/</span>
            <li>
              <Link href="/research/blogs" className="hover:text-black transition-colors">
                Blogs
              </Link>
            </li>
            <span>/</span>
            <li className="text-black">{post.category}</li>
          </ol>
        </nav>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="
            font-heading
            text-3xl
            sm:text-4xl
            lg:text-5xl
            leading-tight
            tracking-tight
            text-[#1e2023]
            max-w-4xl
          "
        >
          {post.title}
        </motion.h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mt-6 text-sm text-black/60">
          {post.author && <span className="text-[#1e2023] font-medium">By {post.author}</span>}

          {post.date && (
            <>
              <span>•</span>
              <time>{typeof post.date === "string" ? post.date : format(post.date, "d MMM yyyy")}</time>
            </>
          )}

          {post.category && (
            <>
              <span>•</span>
              <span className="tracking-wide">{post.category}</span>
            </>
          )}
        </div>

        {/* Featured Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
          className="
            relative
            mt-12
            w-full
            aspect-[16/10]
            overflow-hidden
            border border-black/10
          "
        >
          <Image
            src={post.content.featuredGraphic.image}
            alt={post.content.featuredGraphic.alt}
            fill
            priority
            sizes="(max-width:768px) 100vw, 1100px"
            className="object-cover"
          />
        </motion.div>

        {/* Article */}
        <article className="mt-14 max-w-3xl mx-auto">
          {post.content.sections.map((section, i) => (
            <motion.section
              key={i}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.05 }}
              className="mb-12"
            >
              {/* Section Heading */}
              <h2
                className="
                  font-heading
                  text-2xl
                  sm:text-3xl
                  tracking-tight
                  text-[#1e2023]
                  mb-4
                "
              >
                {section.heading}
              </h2>

              {/* Paragraphs */}
              {section.paragraphs.map((paragraph, j) => (
                <p
                  key={j}
                  className="
                    text-[17px]
                    leading-[1.75]
                    text-black/80
                    mb-5
                  "
                >
                  {paragraph}
                </p>
              ))}
            </motion.section>
          ))}
        </article>
      </div>
    </main>
  );
}
