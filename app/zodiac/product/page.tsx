"use client";

import ProductInfo from "@/components/product/Productinfo";
import ProductShowcase from "@/components/product/ProductShowcase";
import OtherInfo from "@/components/product/otherinfo";
import ZodiacCollection from "@/components/product/ZodiacCollection";

const product = {
  id: "lily-attar",
  title: "Lily Eau de Toilette",
  brand: "Sugandha Manjiri",

  price: "₹2,499",
  priceValue: 2499,
  currency: "INR",

  description: "A luminous floral composition built around white lily, soft citrus and warm musk.",

  longDescription:
    "Lily Eau de Toilette is crafted to evoke quiet elegance. Fresh opening notes transition into a delicate floral heart, resting on a smooth woody base. Alcohol-free, skin-safe and designed for long-lasting subtle presence.",

  images: [
    {
      src: "/demo1.webp",
      alt: "Lily Eau de Toilette front view",
    },
    {
      src: "/demo2.webp",
      alt: "Lily Eau de Toilette side angle",
    },
    {
      src: "/demo1.webp",
      alt: "Lily Eau de Toilette close up",
    },
  ],

  sizes: [
    { id: "30ml", label: "30 ml" },
    { id: "50ml", label: "50 ml" },
    { id: "100ml", label: "100 ml" },
  ],

  notes: {
    top: ["Bergamot", "Green Citrus"],
    heart: ["White Lily", "Jasmine"],
    base: ["Sandalwood", "White Musk"],
  },

  rating: {
    value: 4.7,
    count: 132,
  },

  inStock: true,
};

export default function ZodiacProductPage() {
  return (
    <main className="w-full min-h-screen bg-white" itemScope itemType="https://schema.org/Product">
      {/* Structured Data for SEO */}
      <meta itemProp="name" content={product.title} />
      <meta itemProp="description" content={product.description} />
      <meta itemProp="brand" content={product.brand} />
      <meta itemProp="sku" content={product.id} />

      <div className="flex w-full flex-col lg:flex-row">
        {/* LEFT — Image Gallery */}
        <ProductShowcase product={product} />

        {/* RIGHT — Product Info */}
        <ProductInfo product={product} />
      </div>
      <OtherInfo
        items={[
          {
            title: "Reminds Us Of",
            text: "Fresh citrus opening with soft floral warmth and woody depth.",
          },
          {
            title: "Dermatologist Approved",
            text: "Skin-safe formula crafted for daily wear and long-lasting comfort.",
          },
        ]}
      />
      <ZodiacCollection />
    </main>
  );
}
