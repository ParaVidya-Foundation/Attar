import { Suspense } from "react";
import Link from "next/link";
import { getProducts, getCategories } from "@/lib/admin/queries";
import { ProductTable } from "@/components/admin/ProductTable";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  searchParams: Promise<{ search?: string; page?: string }>;
};

export default async function AdminProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search ?? "";
  const page = parseInt(params.page ?? "1", 10);

  const [{ data: products, total }, categories] = await Promise.all([
    getProducts(page, search || undefined),
    getCategories(),
  ]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form method="get" action="/admin/products" className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="search" className="mb-1 block text-xs text-neutral-500">
              Search by name
            </label>
            <input
              id="search"
              name="search"
              type="text"
              defaultValue={search}
              placeholder="Product name"
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
          >
            Search
          </button>
        </form>
        <Link
          href="/admin/products/new"
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
        >
          New Product
        </Link>
      </div>

      <Suspense fallback={<ProductsTableSkeleton />}>
        <ProductTable products={products} categories={categories} />
      </Suspense>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          {page > 1 && (
            <Link
              href={`/admin/products?page=${page - 1}&search=${encodeURIComponent(search)}`}
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
            >
              Previous
            </Link>
          )}
          <span className="px-3 py-1.5 text-sm text-neutral-600">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/products?page=${page + 1}&search=${encodeURIComponent(search)}`}
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function ProductsTableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}
