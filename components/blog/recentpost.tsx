"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import type { BlogCardProps } from "@/components/blog/BlogCard";

interface RecentPostsProps {
  posts: BlogCardProps[];
}

export default function RecentPosts({ posts }: RecentPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section
      className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
      aria-label="Recent blog posts"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Posts</h2>
      <ul className="space-y-6">
        {posts.map((post, index) => {
          const formattedDate =
            typeof post.date === "string" ? post.date : format(new Date(post.date), "d MMM yyyy");

          return (
            <li key={post.id}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link
                  href={post.href || `/research/blogs/${post.id || "BlogPage"}`}
                  className="flex gap-4 w-full hover:opacity-80 transition-opacity group"
                  aria-label={`Read ${post.title}`}
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                    <Image
                      src={post.image}
                      alt={post.imageAlt}
                      fill
                      sizes="96px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm sm:text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-sky-600 transition-colors">
                      {post.title}
                    </div>
                    <time
                      dateTime={
                        typeof post.date === "string" ? post.date : format(new Date(post.date), "yyyy-MM-dd")
                      }
                      className="text-xs text-gray-500 flex items-center gap-1"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {formattedDate}
                    </time>
                  </div>
                </Link>
              </motion.div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
