import Link from "next/link";
import { getBlogCategoriesForAdmin, getBlogTagsForAdmin } from "@/lib/admin/blogQueries";
import { BlogPostForm } from "@/components/admin/BlogPostForm";

export default async function NewBlogPostPage() {
  const [categories, tags] = await Promise.all([
    getBlogCategoriesForAdmin(),
    getBlogTagsForAdmin(),
  ]);

  return (
    <div>
      <Link href="/admin/blog" className="text-sm text-neutral-500 hover:text-neutral-700">
        ← Blog
      </Link>
      <h2 className="mt-4 text-lg font-semibold text-neutral-900">New post</h2>
      <div className="mt-6">
        <BlogPostForm categories={categories} tags={tags} />
      </div>
    </div>
  );
}
