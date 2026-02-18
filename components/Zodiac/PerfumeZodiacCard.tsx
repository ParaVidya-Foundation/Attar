"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

export type Zodiac = {
  id: number;
  name: string;
  price: number;
  images: [string, string]; // [default, hover]
};

export type PerfumeZodiacCardProps = {
  item: Zodiac;
  priority?: boolean;
  onAddToCart?: (id: number) => void;
  onToggleWishlist?: (id: number, wishlisted: boolean) => void;
};

const formatCurrency = (n: number, currency: string = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(n);

export const PerfumeZodiacCard = React.memo(function PerfumeZodiacCard({
  item,
  priority,
  onAddToCart,
  onToggleWishlist,
}: PerfumeZodiacCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const formattedPrice = useMemo(() => formatCurrency(item.price), [item.price]);

  return (
    <Link href="/store/perfume/Product" className="group relative block" prefetch={true}>
      <article
        className="
          relative flex flex-col items-center justify-start
          rounded-none
          border border-white/20
          bg-white/10
          backdrop-blur-md
          shadow-[0_2px_12px_rgba(0,0,0,0.05)]
          transition-all
          hover:bg-white/20 hover:backdrop-blur-lg
          p-6
        "
      >
        {/* gradient glass overlay */}
        <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-white/30 via-white/10 to-transparent rounded-none" />

        {/* wishlist heart */}
        <button
          aria-label={`${wishlisted ? "Remove" : "Add"} ${item.name} to wishlist`}
          className="absolute right-3 top-3 z-20"
          onClick={(e) => {
            e.preventDefault();
            const next = !wishlisted;
            setWishlisted(next);
            onToggleWishlist?.(item.id, next);
          }}
        >
          <Heart
            className="h-4 w-4 text-gray-500"
            strokeWidth={1.5}
            fill={wishlisted ? "#f43f5e" : "transparent"}
          />
        </button>

        {/* product image */}
        <div className="relative w-full max-w-[280px] aspect-4/3 z-10">
          <Image
            src={item.images[0] || item.images[1] || "/Service/Perfume/1.png"}
            alt={`${item.name} bottle`}
            fill
            quality={90}
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 40vw, 280px"
            className="object-contain transition-opacity duration-300 ease-out group-hover:opacity-0 will-change-transform"
            style={{
              backfaceVisibility: "hidden",
              transform: "translateZ(0)",
            }}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmNWY1ZjUiLz48L3N2Zz4="
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (item.images[1] && target.src !== item.images[1]) {
                target.src = item.images[1];
              } else if (target.src !== "/Service/Perfume/1.png") {
                target.src = "/Service/Perfume/1.png";
              }
            }}
          />
          {item.images[1] && (
            <Image
              src={item.images[1]}
              alt={`${item.name} alternate view`}
              fill
              quality={90}
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 40vw, 280px"
              className="object-contain opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 will-change-transform"
              style={{
                backfaceVisibility: "hidden",
                transform: "translateZ(0)",
              }}
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmNWY1ZjUiLz48L3N2Zz4="
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (item.images[0] && target.src !== item.images[0]) {
                  target.src = item.images[0];
                }
              }}
            />
          )}
        </div>

        {/* name */}
        <h2 className="mt-4 text-center text-[13px] font-semibold tracking-[-0.01em] text-black">
          {item.name}
        </h2>

        {/* actions row */}
        <div className="mt-4 grid w-full max-w-[280px] grid-cols-2 gap-3 z-10">
          <button
            type="button"
            aria-label={`${item.name} price`}
            className="h-10 border border-gray-300 text-[13px] font-medium bg-white/60 backdrop-blur-sm"
            disabled
          >
            {formattedPrice}
          </button>
          <button
            type="button"
            aria-label={`Add ${item.name} to cart`}
            className="h-10 border border-gray-300 text-[13px] font-medium bg-white/60 backdrop-blur-sm hover:bg-white/80 active:bg-white"
            onClick={(e) => {
              e.preventDefault();
              onAddToCart?.(item.id);
            }}
          >
            Add to cart
          </button>
        </div>
      </article>
    </Link>
  );
});
