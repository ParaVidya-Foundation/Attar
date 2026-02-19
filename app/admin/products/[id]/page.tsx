import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductById } from "@/lib/admin/productQueries";
import { getCategories } from "@/lib/admin/queries";
import { updateProduct } from "@/lib/admin/actions";
import { ProductForm } from "@/components/admin/ProductForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProductById(id), getCategories()]);

  if (!product) notFound();

  const initialData = {
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    category_id: product.category_id ?? null,
    price: product.price,
    original_price: product.original_price ?? null,
    stock: product.stock ?? 0,
    is_active: product.is_active ?? true,
    image_url: product.image_url ?? "",
  };

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-neutral-500 hover:text-neutral-700">
        ← Products
      </Link>
      <h2 className="mt-4 text-lg font-semibold text-neutral-900">Edit Product</h2>
      <div className="mt-6">
        <ProductForm categories={categories} initialData={initialData} action={(d) => updateProduct(id, d)} />
      </div>
    </div>
  );
}
