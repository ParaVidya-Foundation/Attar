"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export type Product = {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  rating?: number;
  reviewsCount?: number;
  images: {
    primary: string;
    secondary?: string;
  };
  href: string;
  isSale?: boolean;
};

export default function ProductCard({ product }: { product: Product }) {
  const {
    title,
    price,
    originalPrice,
    currency = "₹",
    rating = 5,
    reviewsCount = 0,
    images,
    href: rawHref,
    isSale,
    id,
  } = product;
  const href = rawHref ?? `/product/${id}`;

  const [hovered, setHovered] = useState(false);

  const discount =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  return (
    <article className="group w-full max-w-[520px] mx-auto" itemScope itemType="https://schema.org/Product">
      {/* IMAGE BLOCK */}
      <Link
        href={href}
        aria-label={title}
        className="
          block relative bg-white
          border border-black/10
          transition-all duration-300 ease-out
          group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]
        "
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Sale Badge */}
        {isSale && (
          <span className="absolute left-4 top-4 z-20 bg-black text-white text-[11px] px-3 py-1 tracking-wide">
            SALE
          </span>
        )}

        {/* Large square visual area */}
        <div className="relative w-full aspect-square flex items-center justify-center p-10">
          {/* Primary image */}
          <Image
            src={images.primary}
            alt={title}
            fill
            sizes="(max-width:768px) 100vw, 520px"
            className={`object-contain transition-opacity duration-500 ease-out ${
              hovered && images.secondary ? "opacity-0" : "opacity-100"
            }`}
            priority={false}
          />

          {/* Secondary image */}
          {images.secondary && (
            <Image
              src={images.secondary}
              alt={`${title} alternate view`}
              fill
              sizes="(max-width:768px) 100vw, 520px"
              className={`absolute inset-0 object-contain transition-opacity duration-500 ease-out ${
                hovered ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
        </div>
      </Link>

      {/* CONTENT */}
      <div className="pt-6 pb-2 text-center px-3">
        {/* Title */}
        <h3 className="font-serif text-[18px] leading-snug text-[#1e2023]" itemProp="name">
          {title}
        </h3>

        {/* Rating */}
        {rating > 0 && (
          <div className="mt-2 text-[13px] text-[#1e2023]/80">
            {"★★★★★".slice(0, Math.round(rating))}
            <span className="ml-1 text-gray-400 text-xs">({reviewsCount})</span>
          </div>
        )}

        {/* Price */}
        <div
          className="mt-3 flex items-center justify-center gap-3"
          itemProp="offers"
          itemScope
          itemType="https://schema.org/Offer"
        >
          {originalPrice && (
            <span className="text-gray-400 line-through text-sm">
              {currency} {originalPrice.toLocaleString()}
            </span>
          )}

          <span className="text-[18px] font-medium text-[#1e2023]" itemProp="price">
            {currency} {price.toLocaleString()}
          </span>

          {discount && <span className="text-xs text-black/60">-{discount}%</span>}
        </div>

        {/* CTA */}
        <Link
          href={href}
          className="
            mt-6 block w-full
            border border-[#1e2023]
            py-3 text-[12px] tracking-[0.18em]
            transition-all duration-300
            hover:bg-black hover:text-white
          "
        >
          ADD TO CART
        </Link>
      </div>
    </article>
  );
}
