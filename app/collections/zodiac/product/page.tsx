import { notFound } from "next/navigation";
import ProductInfo from "@/components/product/Productinfo";
import ProductShowcase from "@/components/product/ProductShowcase";
import OtherInfo from "@/components/product/otherinfo";
import ZodiacCollection from "@/components/product/ZodiacCollection";
import { getProductsByCategorySlug } from "@/lib/fetchers";

export const revalidate = 3600;

export default async function ZodiacProductPage() {
  const products = await getProductsByCategorySlug("zodiac");
  const product = products[0];

  if (!product) {
    notFound();
  }

  const viewProduct = {
    id: product.id,
    slug: product.slug,
    title: product.name,
    brand: "Kamal Vallabh",
    price: `₹${product.price.toLocaleString("en-IN")}`,
    priceValue: product.price,
    currency: "INR",
    description: product.short_description ?? product.description ?? "",
    longDescription: product.description ?? undefined,
    images: [{ src: `/products/${product.slug}.webp`, alt: product.name }],
    inStock: true,
  };

  return (
    <main className="w-full min-h-screen bg-white" itemScope itemType="https://schema.org/Product">
      <meta itemProp="name" content={product.name} />
      <meta itemProp="description" content={product.short_description ?? product.description ?? ""} />
      <meta itemProp="brand" content="Kamal Vallabh" />
      <meta itemProp="sku" content={product.id} />

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
            title: "Dermatologist Approved",
            text: "Skin-safe formula crafted for daily wear and long-lasting comfort.",
          },
        ]}
      />
      <ZodiacCollection />
    </main>
  );
}
