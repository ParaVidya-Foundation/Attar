import Link from "next/link";
import { getAdminBlogPosts } from "@/lib/admin/blogQueries";

type Props = { searchParams: Promise<{ page?: string }> };

export const revalidate = 60;

export default async function AdminBlogPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(String(pageParam), 10) || 1);
  const { posts, total, totalPages } = await getAdminBlogPosts(page);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-semibold text-neutral-900">Blog posts</h1>
        <Link
          href="/admin/blog/new"
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
        >
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-neutral-500">No posts yet. Create one to get started.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
            <table className="min-w-full divide-y divide-neutral-200 text-left text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-neutral-700">Title</th>
                  <th className="px-4 py-3 font-medium text-neutral-700">Status</th>
                  <th className="px-4 py-3 font-medium text-neutral-700">Updated</th>
                  <th className="px-4 py-3 font-medium text-neutral-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {posts.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/blog/${p.id}`} className="font-medium text-neutral-900 hover:underline">
                        {p.title || "(Untitled)"}
                      </Link>
                      <span className="ml-2 text-neutral-400">/{p.slug}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.status === "published"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {p.updated_at
                        ? new Date(p.updated_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/blog/${p.id}`}
                        className="text-neutral-600 hover:text-neutral-900"
                      >
                        Edit
                      </Link>
                      {p.status === "published" && (
                        <>
                          <span className="mx-2 text-neutral-300">|</span>
                          <a
                            href={`/blog/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neutral-600 hover:text-neutral-900"
                          >
                            View
                          </a>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={page === 2 ? "/admin/blog" : `/admin/blog?page=${page - 1}`}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
                >
                  Previous
                </Link>
              )}
              <span className="px-3 py-1.5 text-sm text-neutral-600">
                Page {page} of {totalPages} ({total} posts)
              </span>
              {page < totalPages && (
                <Link
                  href={`/admin/blog?page=${page + 1}`}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
