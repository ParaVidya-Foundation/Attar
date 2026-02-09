"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BlogCard, BlogCardProps } from "./BlogCard";

export interface BlogGridProps {
  blogs: BlogCardProps[];
  selectedTopic?: string;
  searchQuery?: string;
}

export const BlogGrid: React.FC<BlogGridProps> = ({ blogs, selectedTopic, searchQuery = "" }) => {
  // Filter blogs based on search query and selected topic
  const filteredBlogs = React.useMemo(() => {
    let filtered = [...blogs];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(query) ||
          blog.excerpt?.toLowerCase().includes(query) ||
          blog.category?.toLowerCase().includes(query) ||
          blog.author?.toLowerCase().includes(query),
      );
    }

    // Filter by selected topic
    if (selectedTopic) {
      filtered = filtered.filter(
        (blog) =>
          blog.category?.toLowerCase() === selectedTopic.toLowerCase() ||
          blog.title.toLowerCase().includes(selectedTopic.toLowerCase()),
      );
    }

    return filtered;
  }, [blogs, searchQuery, selectedTopic]);

  if (filteredBlogs.length === 0) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8" aria-label="Blog posts">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="mb-4 rounded-full bg-gray-100 p-6">
            <svg
              className="h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-3 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No blog posts found</h2>
          <p className="text-gray-600 max-w-md">
            {searchQuery
              ? `We couldn't find any blog posts matching "${searchQuery}".`
              : selectedTopic
                ? `We couldn't find any blog posts for "${selectedTopic}".`
                : "No blog posts available at the moment."}
            {searchQuery || selectedTopic ? " Try adjusting your search or selecting a different topic." : ""}
          </p>
        </motion.div>
      </section>
    );
  }

  return (
    <section
      className="py-12 px-4 sm:px-6 lg:px-8 bg-white"
      aria-label="Blog posts"
      itemScope
      itemType="https://schema.org/CollectionPage"
    >
      <div className="mx-auto max-w-7xl">
        {/* Grid of Blog Cards */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          role="list"
        >
          <AnimatePresence mode="popLayout">
            {filteredBlogs.map((blog, idx) => (
              <motion.div
                key={blog.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  delay: idx * 0.05,
                  duration: 0.4,
                  ease: "easeOut",
                }}
                role="listitem"
              >
                <BlogCard {...blog} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Results Count (Optional) */}
        {(searchQuery || selectedTopic) && filteredBlogs.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-center text-sm text-gray-600"
            aria-live="polite"
          >
            Showing {filteredBlogs.length} of {blogs.length} blog post
            {blogs.length !== 1 ? "s" : ""}
          </motion.p>
        )}
      </div>
    </section>
  );
};

export default BlogGrid;
