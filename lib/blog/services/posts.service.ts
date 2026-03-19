import { createStaticClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdminEnv } from "@/lib/admin/envCheck";
import { serverError } from "@/lib/security/logger";
import { cacheGet, cacheSet } from "@/lib/redis";
import { sanitizeBlogHtml, estimateReadingTime, slugify } from "./sanitize";
import type { ServiceResult, BlogPostListItem, BlogPostDetail, BlogCategory, BlogTag, BlogCategoryWithCount, BlogStatus } from "./types";
import { success, fail } from "./types";

const PAGE_SIZE = 12;

type DbPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  author_name: string | null;
  reading_time: number | null;
  published_at: string | null;
  category_id: string | null;
};

function getPublicClient() {
  try {
    return createStaticClient();
  } catch {
    return null;
  }
}

async function enrichWithTagsAndCategories(
  supabase: NonNullable<ReturnType<typeof getPublicClient>>,
  posts: DbPostRow[],
): Promise<BlogPostListItem[]> {
  if (posts.length === 0) return [];

  const categoryIds = [...new Set(posts.map((p) => p.category_id).filter(Boolean))] as string[];
  const postIds = posts.map((p) => p.id);

  const [categoriesRes, postTagsRes] = await Promise.all([
    categoryIds.length > 0
      ? supabase.from("blog_categories").select("id, slug, name, description").in("id", categoryIds)
      : Promise.resolve({ data: [] as BlogCategory[] }),
    postIds.length > 0
      ? supabase.from("blog_post_tags").select("post_id, tag_id").in("post_id", postIds)
      : Promise.resolve({ data: [] }),
  ]);

  const categoryMap = new Map((categoriesRes.data ?? []).map((c) => [c.id, c as BlogCategory]));

  const tagIds = [...new Set((postTagsRes.data ?? []).map((pt) => pt.tag_id))];
  const tagsRes = tagIds.length > 0
    ? await supabase.from("blog_tags").select("id, slug, name").in("id", tagIds)
    : { data: [] };
  const tagMap = new Map((tagsRes.data ?? []).map((t) => [t.id, t as BlogTag]));

  const tagsByPost = new Map<string, BlogTag[]>();
  for (const pt of postTagsRes.data ?? []) {
    const tag = tagMap.get(pt.tag_id);
    if (tag) {
      const arr = tagsByPost.get(pt.post_id) ?? [];
      arr.push(tag);
      tagsByPost.set(pt.post_id, arr);
    }
  }

  return posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    cover_image: p.cover_image,
    author_name: p.author_name,
    reading_time: p.reading_time,
    published_at: p.published_at,
    category: p.category_id ? categoryMap.get(p.category_id) ?? null : null,
    tags: tagsByPost.get(p.id) ?? [],
  }));
}

// ─── Public reads ────────────────────────────────────────

export async function getPublishedPosts(opts: {
  page?: number;
  search?: string;
  categorySlug?: string;
  tagSlug?: string;
} = {}): Promise<ServiceResult<{ posts: BlogPostListItem[]; total: number; totalPages: number }>> {
  try {
    const supabase = getPublicClient();
    if (!supabase) return success({ posts: [], total: 0, totalPages: 0 });

    const page = Math.max(1, opts.page ?? 1);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let postIds: string[] | null = null;

    if (opts.categorySlug) {
      const { data: cat } = await supabase
        .from("blog_categories")
        .select("id")
        .eq("slug", opts.categorySlug)
        .single();
      if (!cat) return success({ posts: [], total: 0, totalPages: 0 });

      let query = supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, cover_image, author_name, reading_time, published_at, category_id", { count: "exact" })
        .eq("status", "published")
        .eq("category_id", cat.id)
        .not("published_at", "is", null)
        .order("published_at", { ascending: false })
        .range(from, to);

      if (opts.search?.trim()) {
        query = query.ilike("title", `%${opts.search.trim()}%`);
      }

      const { data, count, error } = await query;
      if (error) return fail(error.message);

      const posts = await enrichWithTagsAndCategories(supabase, (data ?? []) as DbPostRow[]);
      return success({ posts, total: count ?? 0, totalPages: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)) });
    }

    if (opts.tagSlug) {
      const { data: tag } = await supabase.from("blog_tags").select("id").eq("slug", opts.tagSlug).single();
      if (!tag) return success({ posts: [], total: 0, totalPages: 0 });

      const { data: pt } = await supabase.from("blog_post_tags").select("post_id").eq("tag_id", tag.id);
      postIds = (pt ?? []).map((x) => x.post_id);
      if (postIds.length === 0) return success({ posts: [], total: 0, totalPages: 0 });
    }

    let query = supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, cover_image, author_name, reading_time, published_at, category_id", { count: "exact" })
      .eq("status", "published")
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .range(from, to);

    if (postIds) {
      query = query.in("id", postIds);
    }

    if (opts.search?.trim()) {
      query = query.ilike("title", `%${opts.search.trim()}%`);
    }

    const { data, count, error } = await query;
    if (error) return fail(error.message);

    const posts = await enrichWithTagsAndCategories(supabase, (data ?? []) as DbPostRow[]);
    return success({ posts, total: count ?? 0, totalPages: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)) });
  } catch (err) {
    serverError("posts.service getPublishedPosts", err);
    return fail("Failed to fetch posts");
  }
}

export async function getPostBySlug(slug: string): Promise<ServiceResult<BlogPostDetail | null>> {
  try {
    const supabase = getPublicClient();
    if (!supabase) return success(null);

    const { data: post, error } = await supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, content, cover_image, category_id, author_name, reading_time, status, published_at, created_at, updated_at")
      .eq("status", "published")
      .eq("slug", slug)
      .single();

    if (error || !post) return success(null);

    const [categoryRes, ptRes] = await Promise.all([
      post.category_id
        ? supabase.from("blog_categories").select("id, slug, name, description").eq("id", post.category_id).single()
        : Promise.resolve({ data: null }),
      supabase.from("blog_post_tags").select("tag_id").eq("post_id", post.id),
    ]);

    const tagIds = (ptRes.data ?? []).map((x) => x.tag_id);
    const tagsRes = tagIds.length > 0
      ? await supabase.from("blog_tags").select("id, slug, name").in("id", tagIds)
      : { data: [] };

    return success({
      ...post,
      status: post.status as BlogStatus,
      content: sanitizeBlogHtml(post.content),
      category: categoryRes.data as BlogCategory | null,
      tags: (tagsRes.data ?? []) as BlogTag[],
    });
  } catch (err) {
    serverError("posts.service getPostBySlug", err);
    return fail("Failed to fetch post");
  }
}

export async function getRecentPosts(limit = 5): Promise<ServiceResult<BlogPostListItem[]>> {
  try {
    const supabase = getPublicClient();
    if (!supabase) return success([]);

    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, cover_image, author_name, reading_time, published_at, category_id")
      .eq("status", "published")
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .limit(Math.max(1, limit));

    if (error) return fail(error.message);
    const posts = await enrichWithTagsAndCategories(supabase, (data ?? []) as DbPostRow[]);
    return success(posts);
  } catch (err) {
    serverError("posts.service getRecentPosts", err);
    return fail("Failed to fetch recent posts");
  }
}

export async function getRelatedPosts(
  postId: string,
  categoryId?: string,
  tagIds: string[] = [],
  limit = 4,
): Promise<ServiceResult<BlogPostListItem[]>> {
  try {
    const supabase = getPublicClient();
    if (!supabase) return success([]);

    const scores = new Map<string, number>();

    if (categoryId) {
      const { data } = await supabase
        .from("blog_posts")
        .select("id")
        .eq("status", "published")
        .eq("category_id", categoryId)
        .not("published_at", "is", null)
        .neq("id", postId)
        .order("published_at", { ascending: false })
        .limit(24);

      for (const row of data ?? []) {
        scores.set(row.id, (scores.get(row.id) ?? 0) + 3);
      }
    }

    if (tagIds.length > 0) {
      const { data: tagRows } = await supabase
        .from("blog_post_tags")
        .select("post_id")
        .in("tag_id", tagIds)
        .neq("post_id", postId);

      for (const row of tagRows ?? []) {
        scores.set(row.post_id, (scores.get(row.post_id) ?? 0) + 1);
      }
    }

    const rankedIds = [...scores.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id)
      .slice(0, limit);

    if (rankedIds.length === 0) {
      const recent = await getRecentPosts(limit + 1);
      if (!recent.ok) return recent;
      return success(recent.data.filter((p) => p.id !== postId).slice(0, limit));
    }

    const { data: rows } = await supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, cover_image, author_name, reading_time, published_at, category_id")
      .eq("status", "published")
      .not("published_at", "is", null)
      .in("id", rankedIds);

    const posts = await enrichWithTagsAndCategories(supabase, (rows ?? []) as DbPostRow[]);
    const postsById = new Map(posts.map((p) => [p.id, p]));
    return success(rankedIds.map((id) => postsById.get(id)).filter(Boolean) as BlogPostListItem[]);
  } catch (err) {
    serverError("posts.service getRelatedPosts", err);
    return fail("Failed to fetch related posts");
  }
}

export async function getCategories(): Promise<ServiceResult<BlogCategory[]>> {
  try {
    const supabase = getPublicClient();
    if (!supabase) return success([]);
    const { data } = await supabase.from("blog_categories").select("id, slug, name, description").order("name");
    return success((data ?? []) as BlogCategory[]);
  } catch (err) {
    serverError("posts.service getCategories", err);
    return fail("Failed to fetch categories");
  }
}

export async function getCategoriesWithCounts(): Promise<ServiceResult<BlogCategoryWithCount[]>> {
  try {
    const supabase = getPublicClient();
    if (!supabase) return success([]);

    const [{ data: categories }, { data: postRows }] = await Promise.all([
      supabase.from("blog_categories").select("id, slug, name, description").order("name"),
      supabase.from("blog_posts").select("category_id").eq("status", "published").not("published_at", "is", null),
    ]);

    const counts = new Map<string, number>();
    for (const row of postRows ?? []) {
      if (row.category_id) counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1);
    }

    return success((categories ?? []).map((c) => ({ ...c, post_count: counts.get(c.id) ?? 0 })) as BlogCategoryWithCount[]);
  } catch (err) {
    serverError("posts.service getCategoriesWithCounts", err);
    return fail("Failed to fetch categories");
  }
}

export async function getTags(): Promise<ServiceResult<BlogTag[]>> {
  try {
    const supabase = getPublicClient();
    if (!supabase) return success([]);
    const { data } = await supabase.from("blog_tags").select("id, slug, name").order("name");
    return success((data ?? []) as BlogTag[]);
  } catch (err) {
    serverError("posts.service getTags", err);
    return fail("Failed to fetch tags");
  }
}

export async function getAllPublishedSlugs(): Promise<ServiceResult<string[]>> {
  try {
    const supabase = getPublicClient();
    if (!supabase) return success([]);
    const { data } = await supabase.from("blog_posts").select("slug").eq("status", "published").not("published_at", "is", null);
    return success((data ?? []).map((r) => r.slug));
  } catch (err) {
    serverError("posts.service getAllPublishedSlugs", err);
    return fail("Failed to fetch slugs");
  }
}

export async function getSlugsWithUpdated(): Promise<ServiceResult<{ slug: string; updated_at: string | null }[]>> {
  try {
    const supabase = getPublicClient();
    if (!supabase) return success([]);
    const { data } = await supabase
      .from("blog_posts")
      .select("slug, updated_at")
      .eq("status", "published")
      .not("published_at", "is", null);
    return success(data ?? []);
  } catch (err) {
    serverError("posts.service getSlugsWithUpdated", err);
    return fail("Failed to fetch slugs");
  }
}

// ─── Admin writes ────────────────────────────────────────

export type CreatePostInput = {
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  cover_image?: string;
  category_id?: string | null;
  author_name?: string;
  reading_time?: number | null;
  status: BlogStatus;
  published_at?: string | null;
  tag_ids?: string[];
};

export async function createPost(input: CreatePostInput): Promise<ServiceResult<{ id: string }>> {
  try {
    assertAdminEnv();
    const supabase = createAdminClient();

    const postSlug = input.slug?.trim() || slugify(input.title);
    const now = new Date().toISOString();
    const readingTime = input.reading_time ?? estimateReadingTime(input.content ?? null);

    let publishedAt = input.published_at ?? null;
    if (input.status === "published" && !publishedAt) publishedAt = now;
    if (input.status === "draft") publishedAt = null;

    const { data: inserted, error } = await supabase
      .from("blog_posts")
      .insert({
        slug: postSlug,
        title: input.title.trim(),
        excerpt: input.excerpt?.trim() || null,
        content: input.content?.trim() || null,
        cover_image: input.cover_image?.trim() || null,
        category_id: input.category_id || null,
        author_name: input.author_name?.trim() || null,
        reading_time: readingTime,
        status: input.status,
        published_at: publishedAt,
        updated_at: now,
      })
      .select("id")
      .single();

    if (error || !inserted) {
      serverError("posts.service createPost", error);
      return fail(error?.message ?? "Insert failed");
    }

    if (input.tag_ids?.length) {
      await supabase.from("blog_post_tags").insert(
        input.tag_ids.map((tag_id) => ({ post_id: inserted.id, tag_id })),
      );
    }

    return success({ id: inserted.id });
  } catch (err) {
    serverError("posts.service createPost", err);
    return fail(err instanceof Error ? err.message : "Failed to create post");
  }
}

export async function updatePost(id: string, input: CreatePostInput): Promise<ServiceResult> {
  try {
    assertAdminEnv();
    const supabase = createAdminClient();

    const postSlug = input.slug?.trim() || slugify(input.title);
    const now = new Date().toISOString();
    const readingTime = input.reading_time ?? estimateReadingTime(input.content ?? null);

    const { data: existing } = await supabase.from("blog_posts").select("published_at").eq("id", id).single();

    let publishedAt = input.published_at ?? null;
    if (input.status === "published") {
      publishedAt = existing?.published_at ?? now;
    }
    if (input.status === "draft") {
      publishedAt = null;
    }

    const { error } = await supabase
      .from("blog_posts")
      .update({
        slug: postSlug,
        title: input.title.trim(),
        excerpt: input.excerpt?.trim() || null,
        content: input.content?.trim() || null,
        cover_image: input.cover_image?.trim() || null,
        category_id: input.category_id || null,
        author_name: input.author_name?.trim() || null,
        reading_time: readingTime,
        status: input.status,
        published_at: publishedAt,
        updated_at: now,
      })
      .eq("id", id);

    if (error) {
      serverError("posts.service updatePost", error);
      return fail(error.message);
    }

    await supabase.from("blog_post_tags").delete().eq("post_id", id);
    if (input.tag_ids?.length) {
      await supabase.from("blog_post_tags").insert(input.tag_ids.map((tag_id) => ({ post_id: id, tag_id })));
    }

    return success(undefined);
  } catch (err) {
    serverError("posts.service updatePost", err);
    return fail(err instanceof Error ? err.message : "Failed to update post");
  }
}

export async function deletePost(id: string): Promise<ServiceResult> {
  try {
    assertAdminEnv();
    const supabase = createAdminClient();
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) return fail(error.message);
    return success(undefined);
  } catch (err) {
    serverError("posts.service deletePost", err);
    return fail(err instanceof Error ? err.message : "Failed to delete post");
  }
}

// ─── View tracking ───────────────────────────────────────

export async function incrementPostViews(postId: string): Promise<ServiceResult> {
  try {
    assertAdminEnv();
    const supabase = createAdminClient();
    await supabase.rpc("increment_blog_post_views", { p_post_id: postId });
    return success(undefined);
  } catch (err) {
    serverError("posts.service incrementPostViews", err);
    return fail("Failed to track view");
  }
}

export { PAGE_SIZE };
