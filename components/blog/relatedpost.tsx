"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { BlogCardProps } from "@/components/blog/BlogCard";

interface RelatedPostsProps {
  posts: BlogCardProps[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: "smooth",
      });
    }
  };

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 lg:mt-16" aria-label="Related blog posts">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6"
      >
        Related Posts
      </motion.h2>

      <div className="relative">
        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
        >
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex-shrink-0 w-72 sm:w-80"
            >
              <Link
                href={post.href || `/research/blogs/${post.id || "BlogPage"}`}
                className="block group"
                aria-label={`Read related post: ${post.title}`}
              >
                {/* Card */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                  {/* Image */}
                  <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                    <Image
                      src={post.image}
                      alt={post.imageAlt}
                      fill
                      sizes="(max-width: 640px) 288px, 320px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Title */}
                  <div className="p-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-sky-600 transition-colors">
                      {post.title}
                    </h3>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Scroll Arrow - Right */}
        {posts.length > 3 && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
            aria-label="Scroll to see more related posts"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        )}
      </div>
    </section>
  );
}
