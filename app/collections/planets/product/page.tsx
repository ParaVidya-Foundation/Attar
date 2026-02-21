import { notFound } from "next/navigation";
import ProductInfo from "@/components/product/Productinfo";
import ProductShowcase from "@/components/product/ProductShowcase";
import OtherInfo from "@/components/product/otherinfo";
import TrustBar from "@/components/Home/TrustBar";
import ProductSlider from "@/components/product/ProductSlider";
import { getProductsByCategory } from "@/lib/api/products";
import { COLLECTION_SLUGS } from "@/lib/constants/collections";
import { mapToCardProduct } from "@/lib/productMapper";

export const revalidate = 60;

export default async function PlanetsProductPage() {
  const products = await getProductsByCategory(COLLECTION_SLUGS.planets);
  const product = products[0];

  if (!product) {
    notFound();
  }

  const images =
    product.images?.length > 0
      ? product.images.map((img) => ({ src: img.url, alt: product.name }))
      : [{ src: `/products/${product.slug}.webp`, alt: product.name }];
  const viewProduct = {
    id: product.id,
    slug: product.slug,
    title: product.name,
    brand: "Anand Ras",
    price: `₹${(product.price / 100).toLocaleString("en-IN")}`,
    priceValue: product.price,
    currency: "INR",
    description: product.short_description ?? product.description ?? "",
    longDescription: product.description ?? undefined,
    images,
    sizes: (product.variants ?? []).map((v) => ({ id: v.id, label: `${v.size_ml}ml`, priceValue: v.price })),
    inStock: (product.variants ?? []).some((v) => v.stock > 0),
  };

  const relatedProducts = products.slice(1).map(mapToCardProduct);

  return (
    <main className="w-full min-h-screen bg-white" itemScope itemType="https://schema.org/Product">
      <div className="flex w-full flex-col lg:flex-row">
        <ProductShowcase product={viewProduct} />
        <ProductInfo product={viewProduct} />
      </div>

      <OtherInfo
        items={[
          {
            title: "Reminds Us Of",
            text: product.short_description ?? "Fresh citrus opening with soft floral warmth and woody depth.",
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

      <TrustBar />
      <ProductSlider title="You may also like" products={relatedProducts} />
    </main>
  );
}
