"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type HomeBlogCard = {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  href: string;
};

export default function BlogSectionClient({ blogs }: { blogs: HomeBlogCard[] }) {
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(3);
  const intervalRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Responsive items per view (mobile-first) */
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setPerView(1);
      else if (w < 1024) setPerView(2);
      else setPerView(3);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  /* Auto slide */
  useEffect(() => {
    if (blogs.length <= 1) return;
    intervalRef.current = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % blogs.length);
    }, 7000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [blogs.length]);

  /* Pause on hover (desktop UX) */
  const pause = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const resume = () => {
    if (blogs.length <= 1) return;
    intervalRef.current = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % blogs.length);
    }, 7000);
  };

  if (blogs.length === 0) return null;

  /* Card width based on perView */
  const widthPercent = 100 / perView;

  return (
    <section className="w-full bg-white py-16 sm:py-20 border-t-[2px] border-[#1e2023]">
      {/* Header */}
      <header className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-heading text-3xl tracking-wide text-[#1e2023] sm:text-4xl">OUR JOURNAL</h2>
        <div className="mx-auto mt-3 h-[2px] w-12 bg-black/60" />
      </header>

      {/* Slider */}
      <div
        ref={containerRef}
        onMouseEnter={pause}
        onMouseLeave={resume}
        className="mx-auto mt-12 max-w-6xl px-6 overflow-hidden"
      >
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{
            transform: `translateX(-${index * widthPercent}%)`,
          }}
        >
          {blogs.concat(blogs).map((blog, i) => (
            <article
              key={`${blog.id}-${i}`}
              className="flex-shrink-0 px-4 animate-fadeUp"
              style={{
                width: `${widthPercent}%`,
                animationDelay: `${(i % perView) * 120}ms`,
              }}
            >
              <Link href={blog.href} className="block group">
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
                <p className="mt-4 text-[11px] uppercase tracking-widest text-gray-500">{blog.date}</p>

                {/* Title */}
                <h3 className="mt-2 font-heading text-lg text-[#1e2023] group-hover:opacity-80 transition">
                  {blog.title}
                </h3>

                {/* Excerpt */}
                <p className="mt-2 text-sm leading-6 text-gray-600 line-clamp-3">{blog.excerpt}</p>

                {/* CTA */}
                <span className="mt-4 inline-block text-xs tracking-wider border-b border-black pb-[2px]">
                  READ MORE
                </span>
              </Link>
            </article>
          ))}
        </div>
      </div>

      {/* Light animation */}
      <style jsx>{`
        .animate-fadeUp {
          opacity: 0;
          transform: translateY(14px);
          animation: fadeUp 0.6s ease forwards;
        }
        @keyframes fadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}

