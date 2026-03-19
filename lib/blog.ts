/**
 * Blog data layer — thin facade over lib/blog/services/.
 * Maintains backward-compatible exports for public pages.
 */
import { postsService } from "@/lib/blog/services";
import type { BlogPostListItem, BlogPostDetail, BlogCategory, BlogTag, BlogCategoryWithCount } from "@/lib/blog/services";

export type BlogPostRow = BlogPostDetail & {
  blog_categories: BlogCategory | null;
};
export type { BlogPostListItem, BlogCategory, BlogTag, BlogCategoryWithCount };

function unwrapOr<T>(result: { ok: true; data: T } | { ok: false; error: string }, fallback: T): T {
  return result.ok ? result.data : fallback;
}

export const PAGE_SIZE = 12;

export async function getBlogPosts(page = 1): Promise<{ posts: BlogPostListItem[]; total: number; totalPages: number }> {
  return unwrapOr(await postsService.getPublishedPosts({ page }), { posts: [], total: 0, totalPages: 0 });
}

export async function getRecentPosts(limit = 5): Promise<BlogPostListItem[]> {
  return unwrapOr(await postsService.getRecentPosts(limit), []);
}

export async function getPostBySlug(slug: string): Promise<BlogPostRow | null> {
  const result = await postsService.getPostBySlug(slug);
  if (!result.ok || !result.data) return null;
  const d = result.data;
  return { ...d, blog_categories: d.category };
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  return unwrapOr(await postsService.getCategories(), []);
}

export async function getBlogCategoriesWithCounts(): Promise<BlogCategoryWithCount[]> {
  return unwrapOr(await postsService.getCategoriesWithCounts(), []);
}

export async function getBlogTags(): Promise<BlogTag[]> {
  return unwrapOr(await postsService.getTags(), []);
}

export async function getRelatedPosts(postId: string, categoryId?: string, tagIds: string[] = [], limit = 4): Promise<BlogPostListItem[]> {
  return unwrapOr(await postsService.getRelatedPosts(postId, categoryId, tagIds, limit), []);
}

export async function getPopularPosts(limit = 4): Promise<BlogPostListItem[]> {
  return getRecentPosts(limit);
}

export async function getPostsByCategory(categorySlug: string, page = 1): Promise<{ posts: BlogPostListItem[]; total: number; totalPages: number; category: BlogCategory | null }> {
  const result = await postsService.getPublishedPosts({ page, categorySlug });
  if (!result.ok) return { posts: [], total: 0, totalPages: 0, category: null };
  const cats = await postsService.getCategories();
  const category = cats.ok ? cats.data.find((c) => c.slug === categorySlug) ?? null : null;
  return { ...result.data, category };
}

export async function getPostsByTag(tagSlug: string, page = 1): Promise<{ posts: BlogPostListItem[]; total: number; totalPages: number; tag: BlogTag | null }> {
  const result = await postsService.getPublishedPosts({ page, tagSlug });
  if (!result.ok) return { posts: [], total: 0, totalPages: 0, tag: null };
  const tags = await postsService.getTags();
  const tag = tags.ok ? tags.data.find((t) => t.slug === tagSlug) ?? null : null;
  return { ...result.data, tag };
}

export async function getAllBlogSlugs(): Promise<string[]> {
  return unwrapOr(await postsService.getAllPublishedSlugs(), []);
}

export async function getAllBlogCategorySlugs(): Promise<string[]> {
  const cats = await postsService.getCategories();
  return cats.ok ? cats.data.map((c) => c.slug) : [];
}

export async function getAllBlogTagSlugs(): Promise<string[]> {
  const tags = await postsService.getTags();
  return tags.ok ? tags.data.map((t) => t.slug) : [];
}

export async function getBlogSlugsWithUpdated(): Promise<{ slug: string; updated_at: string | null }[]> {
  return unwrapOr(await postsService.getSlugsWithUpdated(), []);
}
