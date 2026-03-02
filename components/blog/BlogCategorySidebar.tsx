import Link from "next/link";
import type { BlogCategoryWithCount } from "@/lib/blog";

type Props = {
  categories: BlogCategoryWithCount[];
  activeSlug?: string;
};

export default function BlogCategorySidebar({ categories, activeSlug }: Props) {
  if (categories.length === 0) return null;

  return (
    <section className="border border-neutral-200 bg-white p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-900">Categories</h2>
      <ul className="mt-4 space-y-2">
        {categories.map((category) => {
          const active = activeSlug === category.slug;
          return (
            <li key={category.id}>
              <Link
                href={`/blog/category/${category.slug}`}
                className={`flex items-center justify-between text-sm transition-colors ${
                  active ? "text-neutral-900" : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <span>{category.name}</span>
                <span className="text-xs text-neutral-500">{category.post_count}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
