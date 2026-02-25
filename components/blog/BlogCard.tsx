"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/images";

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

export default function BlogCard({
  id,
  title,
  image,
  imageAlt,
  date,
  excerpt,
  author,
  category,
  href,
}: BlogCardProps) {
  const formattedDate = typeof date === "string" ? date : format(new Date(date), "d MMM yyyy");

  const blogUrl = href || `/blog/BlogPage`;

  return (
    <motion.article
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group flex flex-col h-full border-t border-neutral-200 pt-6"
      itemScope
      itemType="https://schema.org/BlogPosting"
    >
      {/* Image */}
      <Link
        href={blogUrl}
        aria-label={title}
        className="relative w-full aspect-[4/3] overflow-hidden bg-black/5"
      >
        <Image
          src={image || PLACEHOLDER_IMAGE_URL}
          alt={imageAlt || title}
          fill
          sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          priority={false}
        />
      </Link>

      {/* Content */}
      <div className="mt-5 flex flex-col flex-grow">
        {/* Meta */}
        <div className="text-xs tracking-wide text-neutral-500 uppercase">
          {category && <span>{category}</span>}
          {category && <span className="mx-2">•</span>}
          <time
            dateTime={typeof date === "string" ? date : format(new Date(date), "yyyy-MM-dd")}
            itemProp="datePublished"
          >
            {formattedDate}
          </time>
        </div>

        {/* Title */}
        <h2
          className="mt-2 text-xl leading-snug font-heading text-neutral-900 group-hover:text-neutral-700 transition-colors sm:text-2xl"
          itemProp="headline"
        >
          <Link href={blogUrl}>{title}</Link>
        </h2>

        {/* Author */}
        {author && (
          <p
            className="mt-2 text-sm text-neutral-600"
            itemProp="author"
            itemScope
            itemType="https://schema.org/Person"
          >
            By <span itemProp="name">{author}</span>
          </p>
        )}

        {/* Excerpt */}
        {excerpt && (
          <p className="mt-3 text-base leading-relaxed text-neutral-600 line-clamp-3" itemProp="description">
            {excerpt}
          </p>
        )}

        {/* Editorial CTA */}
        <div className="mt-5">
          <Link
            href={blogUrl}
            className="inline-flex items-center text-sm font-medium text-neutral-800 border-b border-neutral-300 pb-1 hover:border-neutral-900 transition-colors"
          >
            Read article →
          </Link>
        </div>
      </div>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
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
}
