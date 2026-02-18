"use client";

import ProductInfo from "@/components/product/Productinfo";
import ProductShowcase from "@/components/product/ProductShowcase";
import OtherInfo from "@/components/product/otherinfo";
import TrustBar from "@/components/Home/TrustBar";
import ProductSlider from "@/components/product/ProductSlider";

/* --------------------------------------------------
   MAIN PRODUCT (Primary product page data)
   API ready structure
-------------------------------------------------- */
const product = {
  id: "lily-attar",
  slug: "lily",
  title: "Lily Eau de Toilette",
  brand: "Kamal Vallabh",

  price: "₹2,499",
  priceValue: 2499,
  currency: "INR",

  description: "A luminous floral composition built around white lily, soft citrus and warm musk.",

  longDescription:
    "Lily Eau de Toilette is crafted to evoke quiet elegance. Fresh opening notes transition into a delicate floral heart, resting on a smooth woody base. Alcohol-free, skin-safe and designed for long-lasting subtle presence.",

  images: [
    { src: "/demo1.webp", alt: "Lily Eau de Toilette front view" },
    { src: "/demo2.webp", alt: "Lily Eau de Toilette side view" },
    { src: "/demo1.webp", alt: "Lily Eau de Toilette close up" },
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

/* --------------------------------------------------
   SLIDER DATA (You May Also Like)
   Same structure expected by ProductSlider
   Replace later with API
-------------------------------------------------- */
const productsData = [
  {
    id: "sun",
    title: "Surya Attar",
    price: 1890,
    originalPrice: 2490,
    currency: "₹",
    rating: 5,
    reviewsCount: 32,
    images: {
      primary: "/products/sun-1.webp",
      secondary: "/products/sun-2.webp",
    },
    href: "/product/surya",
    isSale: true,
  },
  {
    id: "moon",
    title: "Chandra Attar",
    price: 1590,
    currency: "₹",
    rating: 4.8,
    reviewsCount: 18,
    images: {
      primary: "/products/moon-1.webp",
      secondary: "/products/moon-2.webp",
    },
    href: "/product/chandra",
  },
  {
    id: "venus",
    title: "Shukra Attar",
    price: 2190,
    currency: "₹",
    rating: 5,
    reviewsCount: 41,
    images: {
      primary: "/products/venus-1.webp",
      secondary: "/products/venus-2.webp",
    },
    href: "/product/shukra",
  },
  {
    id: "saturn",
    title: "Shani Attar",
    price: 1990,
    currency: "₹",
    rating: 4.7,
    reviewsCount: 26,
    images: {
      primary: "/products/saturn-1.webp",
      secondary: "/products/saturn-2.webp",
    },
    href: "/product/shani",
  },
];

/* --------------------------------------------------
   PAGE
-------------------------------------------------- */
export default function PlanetsProductPage() {
  return (
    <main className="w-full min-h-screen bg-white" itemScope itemType="https://schema.org/Product">
      {/* Top Section */}
      <div className="flex w-full flex-col lg:flex-row">
        <ProductShowcase product={product} />
        <ProductInfo product={product} />
      </div>

      {/* Additional Info */}
      <OtherInfo
        items={[
          {
            title: "Reminds Us Of",
            text: "Fresh citrus opening with soft floral warmth and woody depth.",
          },
          {
            title: "Skin Safe Formula",
            text: "Alcohol-free composition crafted for daily wear and long-lasting comfort.",
          },
          {
            title: "Longevity",
            text: "Balanced projection with a calm, elegant trail that lasts all day.",
          },
        ]}
      />

      {/* Trust Section */}
      <TrustBar />

      {/* Related Products */}
      <ProductSlider title="You may also like" products={productsData} />
    </main>
  );
}
