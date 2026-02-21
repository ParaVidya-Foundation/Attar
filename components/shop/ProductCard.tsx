"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useCart } from "@/components/cart/CartProvider";

export type Product = {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  images: {
    primary: string;
    secondary?: string;
  };
  href?: string;
  isSale?: boolean;
  slug?: string;
};

export default function ProductCard({ product }: { product: Product }) {
  const { id, title, price, originalPrice, currency = "₹", images, slug } = product;

  const href = product.href ?? `/product/${slug ?? id}`;
  const [hovered, setHovered] = useState(false);

  const { add } = useCart(); // cart context

  // Performance: memoized discount
  const discount = useMemo(() => {
    if (!originalPrice || originalPrice <= price) return null;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  }, [price, originalPrice]);

  const handleAddToCart = () => {
    add({
      id,
      name: title,
      price,
      imageUrl: images.primary,
      qty: 1,
    });
  };

  return (
    <article className="group w-full mx-auto" itemScope itemType="https://schema.org/Product">
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
        {discount && (
          <span className="absolute left-4 top-4 z-20 bg-black text-white text-[11px] px-3 py-1 tracking-wide">
            SALE
          </span>
        )}

        {/* Image Container */}
        <div className="relative w-full aspect-square flex items-center justify-center p-10">
          <Image
            src={images.primary || "/placeholder.png"}
            alt={title}
            fill
            sizes="(max-width:768px) 100vw, 520px"
            className={`object-contain transition-opacity duration-500 ease-out ${
              hovered && images.secondary ? "opacity-0" : "opacity-100"
            }`}
            priority={false}
          />

          {images.secondary && (
            <Image
              src={images.secondary}
              alt={`${title} alternate`}
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
      <div className="pt-6 pb-3 text-center px-3">
        {/* Title */}
        <h3 className="font-serif text-base sm:text-[18px] leading-snug text-[#1e2023] line-clamp-2" itemProp="name">
          {title}
        </h3>

        {/* Price (stored in paise; display in rupees for INR) */}
        <div
          className="mt-3 flex items-center justify-center gap-3"
          itemProp="offers"
          itemScope
          itemType="https://schema.org/Offer"
        >
          {originalPrice && originalPrice > price && (
            <span className="text-gray-400 line-through text-sm">
              {currency} {(originalPrice / 100).toLocaleString("en-IN")}
            </span>
          )}

          <span className="text-[18px] font-medium text-[#1e2023]" itemProp="price">
            {currency} {(price / 100).toLocaleString("en-IN")}
          </span>

          {discount && <span className="text-xs text-black/60">-{discount}%</span>}

          <meta itemProp="priceCurrency" content="INR" />
          <link itemProp="availability" href="https://schema.org/InStock" />
        </div>

        {/* CTA Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-2">
          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            className="
              w-full
              border border-[#1e2023]
              py-2.5 sm:py-3 text-[10px] sm:text-[11px] tracking-[0.18em]
              transition-all duration-300
              hover:bg-black hover:text-white
              active:scale-[0.98]
            "
            aria-label={`Add ${title} to cart`}
          >
            ADD TO CART
          </button>

          {/* Buy Now */}
          <Link
            href={`${href}?buyNow=true`}
            className="
              w-full
              border border-[#1e2023]
              py-2.5 sm:py-3 text-[10px] sm:text-[11px] tracking-[0.18em]
              transition-all duration-300
              hover:bg-black hover:text-white
              active:scale-[0.98]
            "
            aria-label={`Buy ${title} now`}
          >
            BUY NOW
          </Link>
        </div>
      </div>
    </article>
  );
}
