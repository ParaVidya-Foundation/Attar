"use client";

import Image from "next/image";
import Link from "next/link";

type Blog = {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  href: string;
};
export default function BlogCardHome({ blog }: { blog: Blog }) {
  return (
    <div>
      <Link href={blog.href} className="block">
        {/* Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
          <Image
            src={blog.image}
            alt={blog.title}
            fill
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
          />
        </div>

        {/* Meta */}
        <p className="mt-5 text-[11px] uppercase tracking-widest text-gray-500">{blog.date}</p>

        {/* Title */}
        <h3 className="mt-2 font-serif text-lg text-[#1e2023] transition group-hover:opacity-80">
          {blog.title}
        </h3>

        {/* Excerpt */}
        <p className="mt-2 text-sm leading-6 text-gray-600">{blog.excerpt}</p>

        {/* CTA */}
        <span className="mt-4 inline-block text-xs tracking-wider border-b border-black pb-[2px]">
          READ MORE
        </span>
      </Link>
    </div>
  );
}
