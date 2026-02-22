import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminPostById } from "@/lib/admin/blogQueries";
import { getBlogCategoriesForAdmin, getBlogTagsForAdmin } from "@/lib/admin/blogQueries";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { DeleteBlogPostButton } from "./DeleteBlogPostButton";

type Props = { params: Promise<{ id: string }> };

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params;
  const [post, categories, tags] = await Promise.all([
    getAdminPostById(id),
    getBlogCategoriesForAdmin(),
    getBlogTagsForAdmin(),
  ]);

  if (!post) notFound();

  const initialData = {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    content: post.content ?? "",
    cover_image: post.cover_image ?? "",
    category_id: post.category_id ?? null,
    author_name: post.author_name ?? "",
    reading_time: post.reading_time ?? null,
    status: post.status as "draft" | "published",
    tag_ids: post.tag_ids ?? [],
  };

  return (
    <div>
      <Link href="/admin/blog" className="text-sm text-neutral-500 hover:text-neutral-700">
        ← Blog
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Edit: {post.title || "(Untitled)"}</h2>
        <DeleteBlogPostButton postId={id} postTitle={post.title} />
      </div>
      <div className="mt-6">
        <BlogPostForm
          categories={categories}
          tags={tags}
          initialData={initialData}
          postId={id}
        />
      </div>
    </div>
  );
}
