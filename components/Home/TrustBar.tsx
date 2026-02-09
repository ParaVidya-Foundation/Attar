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

  // Performance-optimized observer (runs once)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // stop observing after first reveal
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section aria-label="Brand assurances" className="w-full bg-white">
      <div
        ref={ref}
        className="
          mx-auto max-w-7xl
          px-6 py-16
          sm:py-18
          lg:px-8 lg:py-20
        "
      >
        <ul
          className="
            grid
            grid-cols-1
            gap-14
            text-center
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          {items.map((item, index) => (
            <li
              key={item.title}
              className={`
                flex flex-col items-center justify-center
                transition-all duration-700 ease-out
                motion-reduce:transition-none
                ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
              `}
              style={{ transitionDelay: `${index * 120}ms` }}
            >
              {/* Icon */}
              <div className="relative mb-6 h-16 w-16 sm:h-18 sm:w-18 lg:h-20 lg:w-20">
                <Image
                  src={item.img}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 64px, (max-width: 1024px) 72px, 80px"
                  className="
                    object-contain
                    grayscale
                    transition-transform duration-500 ease-out
                    motion-reduce:transition-none
                    group-hover:scale-105
                  "
                />
              </div>

              {/* Text */}
              <p
                className="
                  max-w-[240px]
                  font-serif
                  text-[15px] leading-7
                  text-charcoal/85
                  sm:text-[16px]
                  lg:text-[17px]
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
