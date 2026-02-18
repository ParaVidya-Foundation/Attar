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
  if (!posts || posts.length === 0) return null;

  return (
    <section
      aria-label="Recent blog posts"
      className="
        w-full
        bg-white
        border border-black/10
      "
    >
      {/* Header */}
      <header className="px-6 py-5 border-b border-black/10">
        <h2 className="text-lg font-medium tracking-tight text-[#1e2023]">Recent Articles</h2>
      </header>

      {/* List */}
      <ul className="divide-y divide-black/5">
        {posts.map((post, index) => {
          const formattedDate =
            typeof post.date === "string" ? post.date : format(new Date(post.date), "d MMM yyyy");

          return (
            <li key={post.id}>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.05,
                  ease: "easeOut",
                }}
              >
                <Link
                  href={post.href || `/research/blogs/${post.id}`}
                  aria-label={`Read ${post.title}`}
                  className="
                    flex items-center gap-4
                    px-6 py-5
                    group
                    transition-colors
                    hover:bg-black/[0.02]
                  "
                >
                  {/* Thumbnail */}
                  <div
                    className="
                      relative
                      w-20 h-20
                      sm:w-24 sm:h-24
                      flex-shrink-0
                      overflow-hidden
                      bg-[#f5f5f5]
                      border border-black/10
                    "
                  >
                    <Image
                      src={post.image}
                      alt={post.imageAlt || post.title}
                      fill
                      sizes="96px"
                      className="
                        object-cover
                        transition-transform duration-500 ease-out
                        group-hover:scale-[1.03]
                      "
                      loading="lazy"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="
                        text-sm sm:text-[15px]
                        font-medium
                        text-[#1e2023]
                        leading-snug
                        line-clamp-2
                        tracking-tight
                      "
                    >
                      {post.title}
                    </h3>

                    <time
                      dateTime={
                        typeof post.date === "string" ? post.date : format(new Date(post.date), "yyyy-MM-dd")
                      }
                      className="
                        mt-2
                        block
                        text-[11px]
                        tracking-wider
                        text-black/50
                        uppercase
                      "
                    >
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
