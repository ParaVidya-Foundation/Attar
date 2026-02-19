import Link from "next/link";
import { getCategories } from "@/lib/admin/queries";
import { createProduct } from "@/lib/admin/actions";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-neutral-500 hover:text-neutral-700">
        ← Products
      </Link>
      <h2 className="mt-4 text-lg font-semibold text-neutral-900">New Product</h2>
      <div className="mt-6">
        <ProductForm categories={categories} action={createProduct} />
      </div>
    </div>
  );
}
