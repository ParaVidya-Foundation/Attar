"use client";

import { useEffect, useRef, useState } from "react";
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

const blogs: Blog[] = [
  {
    id: "1",
    title: "Crafting Scents with Intention",
    excerpt:
      "Every fragrance is composed to evoke emotion, balance energy, and elevate presence through timeless ingredients.",
    date: "August 17, 09:14 AM",
    image: "/blog/b1.jpg",
    href: "/blog/crafting-scents",
  },
  {
    id: "2",
    title: "The Art of Layering Attars",
    excerpt:
      "Discover how traditional layering techniques create a signature scent that evolves throughout the day.",
    date: "August 17, 09:14 AM",
    image: "/blog/b2.jpg",
    href: "/blog/layering-attars",
  },
  {
    id: "3",
    title: "Designing Functional Luxury",
    excerpt:
      "Minimal packaging, refined materials, and thoughtful design for modern ritual and everyday elegance.",
    date: "August 17, 09:14 AM",
    image: "/blog/b3.jpg",
    href: "/blog/functional-luxury",
  },
  {
    id: "4",
    title: "Planetary Fragrance Philosophy",
    excerpt: "Align your scent with celestial energy through notes inspired by the Navagraha tradition.",
    date: "August 17, 09:14 AM",
    image: "/blog/b4.jpg",
    href: "/blog/planetary-fragrance",
  },
];

export default function BlogSection() {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const visibleCount = () => {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  };

  const [perView, setPerView] = useState(3);

  // Responsive items per view
  useEffect(() => {
    const update = () => setPerView(visibleCount());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Auto slide every 7 seconds
  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % blogs.length);
    }, 7000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Visible slice logic
  const visibleBlogs = [];
  for (let i = 0; i < perView; i++) {
    visibleBlogs.push(blogs[(index + i) % blogs.length]);
  }

  return (
    <section className="w-full bg-white py-20 border-t-[2px] border-[#1e2023]">
      {/* Header */}
      <header className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-serif text-3xl tracking-wide text-[#1e2023] sm:text-4xl">OUR JOURNAL</h2>
        <div className="mx-auto mt-3 h-[2px] w-12 bg-black/60" />
      </header>

      {/* Slider Container */}
      <div className="mx-auto mt-14 max-w-6xl px-6 overflow-hidden">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {visibleBlogs.map((blog, i) => (
            <article
              key={blog.id}
              className="group opacity-0 animate-fadeUp"
              style={{ animationDelay: `${i * 120}ms` }}
            >
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
            </article>
          ))}
        </div>
      </div>

      {/* Ultra-light animation */}
      <style jsx>{`
        .animate-fadeUp {
          animation: fadeUp 0.6s ease forwards;
        }
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
