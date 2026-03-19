import ProductCard from "@/components/shop/ProductCard";
import { mapToCardProduct } from "@/lib/productMapper";
import { getRecommendedProducts, type OrderSuccessData } from "@/lib/orders/service";

type Props = {
  order: Pick<OrderSuccessData, "categoryIds" | "purchasedProductIds">;
};

export default async function RecommendedProductsSection({ order }: Props) {
  const products = await getRecommendedProducts({
    categoryIds: order.categoryIds,
    purchasedProductIds: order.purchasedProductIds,
    limit: 6,
  });

  if (!products?.length) return null;

  return (
    <section className="mt-14 border border-neutral-900/10 p-6 sm:p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.24em] text-neutral-500">RECOMMENDED</p>
          <h2 className="mt-2 font-heading text-2xl text-neutral-900">Complete your ritual</h2>
        </div>
        <div className="h-px flex-1 bg-[#d4b07a] hidden sm:block" />
      </div>

      {/* Mobile: horizontal scroll. Desktop: grid. */}
      <div className="mt-6 flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible">
        {products.slice(0, 6).map((product) => (
          <div
            key={product.id}
            className="min-w-[220px] w-[220px] md:min-w-0 md:w-auto"
          >
            <ProductCard product={mapToCardProduct(product)} />
          </div>
        ))}
      </div>
    </section>
  );
}

