import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdminEnv } from "@/lib/admin/envCheck";
import { serverError } from "@/lib/security/logger";

export type AdminBlogPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  category_id: string | null;
  author_name: string | null;
  reading_time: number | null;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string | null;
  blog_categories: { id: string; slug: string; name: string } | null;
  tag_ids: string[];
};

export type BlogCategoryOption = {
  id: string;
  slug: string;
  name: string;
};

export type BlogTagOption = {
  id: string;
  slug: string;
  name: string;
};

export async function getAdminBlogPosts(page = 1): Promise<{
  posts: AdminBlogPostRow[];
  total: number;
  totalPages: number;
}> {
  try {
    assertAdminEnv();
    const supabase = createAdminClient();
    const pageSize = 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: posts, error, count } = await supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, content, cover_image, category_id, author_name, reading_time, status, published_at, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .range(from, to);

    if (error) {
      serverError("admin blogQueries getAdminBlogPosts", error);
      throw error;
    }

    const list = posts ?? [];
    const categoryIds = [...new Set(list.map((p) => p.category_id).filter(Boolean))] as string[];
    const { data: categories } =
      categoryIds.length > 0
        ? await supabase.from("blog_categories").select("id, slug, name").in("id", categoryIds)
        : { data: [] };
    const categoryMap = new Map((categories ?? []).map((c) => [c.id, c]));

    const postIds = list.map((p) => p.id);
    const { data: postTags } =
      postIds.length > 0
        ? await supabase.from("blog_post_tags").select("post_id, tag_id").in("post_id", postIds)
        : { data: [] };
    const tagsByPostId = new Map<string, string[]>();
    for (const pt of postTags ?? []) {
      const arr = tagsByPostId.get(pt.post_id) ?? [];
      arr.push(pt.tag_id);
      tagsByPostId.set(pt.post_id, arr);
    }

    const rows: AdminBlogPostRow[] = list.map((p) => ({
      ...p,
      blog_categories: p.category_id ? categoryMap.get(p.category_id) ?? null : null,
      tag_ids: tagsByPostId.get(p.id) ?? [],
    }));

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    return { posts: rows, total, totalPages };
  } catch (err) {
    serverError("admin blogQueries getAdminBlogPosts", err);
    throw err;
  }
}

export async function getAdminPostById(id: string): Promise<AdminBlogPostRow | null> {
  try {
    assertAdminEnv();
    const supabase = createAdminClient();
    const { data: post, error } = await supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, content, cover_image, category_id, author_name, reading_time, status, published_at, created_at, updated_at")
      .eq("id", id)
      .single();

    if (error || !post) return null;

    const category = post.category_id
      ? await supabase.from("blog_categories").select("id, slug, name").eq("id", post.category_id).single()
      : { data: null };
    const { data: pt } = await supabase.from("blog_post_tags").select("tag_id").eq("post_id", post.id);
    const tagIds = (pt ?? []).map((x) => x.tag_id);

    return {
      ...post,
      blog_categories: category.data,
      tag_ids: tagIds,
    };
  } catch (err) {
    serverError("admin blogQueries getAdminPostById", err);
    return null;
  }
}

export async function getBlogCategoriesForAdmin(): Promise<BlogCategoryOption[]> {
  try {
    assertAdminEnv();
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("blog_categories").select("id, slug, name").order("name");
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    serverError("admin blogQueries getBlogCategoriesForAdmin", err);
    return [];
  }
}

export async function getBlogTagsForAdmin(): Promise<BlogTagOption[]> {
  try {
    assertAdminEnv();
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("blog_tags").select("id, slug, name").order("name");
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    serverError("admin blogQueries getBlogTagsForAdmin", err);
    return [];
  }
}
