"use client";

import Image from "next/image";
import Link from "next/link";
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
  variant?: "default" | "compact";
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
  variant = "default",
}: BlogCardProps) {
  const formattedDate = typeof date === "string" ? date : format(new Date(date), "d MMM yyyy");

  const blogUrl = href || "/blog";

  if (variant === "compact") {
    return (
      <article className="group border-t border-neutral-200 pt-4 first:border-t-0 first:pt-0">
        <Link href={blogUrl} className="grid grid-cols-[88px_1fr] gap-3">
          <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
            <Image
              src={image || PLACEHOLDER_IMAGE_URL}
              alt={imageAlt || title}
              fill
              sizes="88px"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
            />
          </div>
          <div>
            <h3 className="text-sm font-medium leading-snug text-neutral-900 transition-colors group-hover:text-neutral-700">
              {title}
            </h3>
            <time
              dateTime={typeof date === "string" ? date : format(new Date(date), "yyyy-MM-dd")}
              className="mt-1 block text-xs text-neutral-500"
            >
              {formattedDate}
            </time>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article
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
    </article>
  );
}
