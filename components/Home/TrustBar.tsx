"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Item = {
  img: string;
  title: string;
};

const items: Item[] = [
  {
    img: "/icons/india.png",
    title: "Packaged at source and shipped direct to you",
  },
  {
    img: "/icons/cruelty-free.png",
    title: "Not tested on animals",
  },
  {
    img: "/icons/science.png",
    title: "No animal derived ingredients",
  },
  {
    img: "/icons/shipping.png",
    title: "Free shipping",
  },
];

export default function TrustBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Reveal once (performance optimized)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section aria-label="Brand assurances" className="w-full bg-white">
      <div ref={ref} className="mx-auto max-w-7xl px-6 py-14 sm:py-16 lg:px-8 lg:py-20">
        <ul
          className="
            grid
            grid-cols-2        /* Mobile: 2 per row */
            gap-y-12 gap-x-6
            text-center
            sm:gap-y-14 sm:gap-x-10
            lg:grid-cols-4     /* Desktop: 4 in one row */
          "
        >
          {items.map((item, index) => (
            <li
              key={item.title}
              className={`
                group flex flex-col items-center justify-start
                transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)]
                motion-reduce:transition-none
                ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
              `}
              style={{ transitionDelay: `${index * 120}ms` }}
            >
              {/* Icon */}
              <div className="relative mb-4 h-14 w-14 sm:h-16 sm:w-16 lg:h-18 lg:w-18">
                <Image
                  src={item.img}
                  alt={item.title}
                  fill
                  sizes="(max-width:640px) 56px, (max-width:1024px) 64px, 72px"
                  className="
                    object-contain
                    grayscale
                    transition-transform duration-500 ease-out
                    group-hover:scale-105
                  "
                />
              </div>

              {/* Text */}
              <p
                className="
                  max-w-[200px]
                  font-serif
                  text-[14px] leading-6
                  text-charcoal/80
                  sm:text-[15px]
                  lg:text-[16px]
                "
              >
                {item.title}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
