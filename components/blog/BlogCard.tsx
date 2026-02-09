"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";

export interface BlogCardProps {
  id: string;
  title: string;
  image: string;
  imageAlt: string;
  date: Date | string;
  excerpt?: string;
  author?: string;
  category?: string;
  href?: string;
}

export const BlogCard: React.FC<BlogCardProps> = ({
  id,
  title,
  image,
  imageAlt,
  date,
  excerpt,
  author,
  category,
  href,
}) => {
  const formattedDate = typeof date === "string" ? date : format(new Date(date), "d MMM yyyy");
  const blogUrl = href || `/research/blogs/${id || "BlogPage"}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="group relative flex flex-col h-full rounded-2xl overflow-hidden border border-gray-200 bg-gradient-to-b from-white/90 to-gray-50 backdrop-blur-sm shadow-md hover:shadow-2xl hover:border-sky-200 transition-all duration-500"
      itemScope
      itemType="https://schema.org/BlogPosting"
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square overflow-hidden">
        <Link
          href={blogUrl}
          className="block w-full h-full focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 rounded-t-2xl"
          aria-label={`Read more about ${title}`}
        >
          <motion.div
            className="w-full h-full overflow-hidden"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={image || "/placeholder.png"}
              alt={imageAlt || title}
              fill
              quality={90}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover rounded-t-2xl"
              loading="lazy"
              priority={false}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmNWY1ZjUiLz48L3N2Zz4="
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== "/placeholder.png") {
                  target.src = "/placeholder.png";
                }
              }}
            />
          </motion.div>
        </Link>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {category && (
            <span className="px-3 py-1 bg-white/90 text-gray-700 text-xs font-medium rounded-full backdrop-blur-sm shadow-sm">
              {category}
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 px-3 py-1.5 bg-sky-600/90 text-white text-xs font-medium rounded-full shadow-md backdrop-blur-sm">
          <time
            dateTime={typeof date === "string" ? date : format(new Date(date), "yyyy-MM-dd")}
            itemProp="datePublished"
          >
            {formattedDate}
          </time>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-grow p-5 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-sky-600 transition-colors duration-300">
          <Link href={blogUrl} itemProp="headline">
            {title}
          </Link>
        </h2>

        {author && (
          <p
            className="text-sm text-gray-600 mb-3 italic"
            itemProp="author"
            itemScope
            itemType="https://schema.org/Person"
          >
            By <span itemProp="name">{author}</span>
          </p>
        )}

        {excerpt && (
          <p className="text-sm text-gray-600 leading-relaxed mb-5 line-clamp-3" itemProp="description">
            {excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between">
          <Link
            href={blogUrl}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            aria-label={`Read more: ${title}`}
          >
            Read More
            <motion.span initial={{ x: 0 }} whileHover={{ x: 5 }} transition={{ duration: 0.3 }}>
              →
            </motion.span>
          </Link>

          <div className="text-xs text-gray-500">{formattedDate}</div>
        </div>
      </div>

      {/* Animated Border Glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-sky-400/60 transition duration-500 pointer-events-none"
        animate={{
          boxShadow: [
            "0 0 0px rgba(56,189,248,0)",
            "0 0 25px rgba(56,189,248,0.25)",
            "0 0 0px rgba(56,189,248,0)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "@id": blogUrl,
            headline: title,
            image: image,
            datePublished: typeof date === "string" ? date : format(new Date(date), "yyyy-MM-dd"),
            author: author ? { "@type": "Person", name: author } : undefined,
            description: excerpt,
            url: blogUrl,
          }),
        }}
      />
    </motion.article>
  );
};

export default BlogCard;
