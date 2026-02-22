/**
 * Blog data layer — Server only. Uses Supabase; only published posts.
 * No e-commerce logic; independent from products/orders.
 */
import { createStaticClient } from "@/lib/supabase/server";

const PAGE_SIZE = 12;

export type BlogCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

export type BlogTag = {
  id: string;
  slug: string;
  name: string;
};

export type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  category_id: string | null;
  author_name: string | null;
  reading_time: number | null;
  published_at: string | null;
  updated_at: string | null;
  blog_categories: BlogCategory | null;
  tags: BlogTag[];
};

export type BlogPostListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  author_name: string | null;
  reading_time: number | null;
  published_at: string | null;
  category: BlogCategory | null;
  tags: BlogTag[];
};

async function getSupabase() {
  try {
    return createStaticClient();
  } catch {
    return null;
  }
}

export async function getBlogPosts(page = 1): Promise<{
  posts: BlogPostListItem[];
  total: number;
  totalPages: number;
}> {
  const supabase = await getSupabase();
  if (!supabase) return { posts: [], total: 0, totalPages: 0 };

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: posts, error, count } = await supabase
    .from("blog_posts")
    .select(
      "id, slug, title, excerpt, cover_image, author_name, reading_time, published_at, category_id",
      { count: "exact" }
    )
    .eq("status", "published")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) return { posts: [], total: 0, totalPages: 0 };

  const categoryIds = [...new Set((posts ?? []).map((p) => p.category_id).filter(Boolean))] as string[];
  const categories =
    categoryIds.length > 0
      ? await supabase.from("blog_categories").select("id, slug, name, description").in("id", categoryIds)
      : { data: [] as BlogCategory[] };
  const categoryMap = new Map((categories.data ?? []).map((c) => [c.id, c]));

  const postIds = (posts ?? []).map((p) => p.id);
  const { data: postTagsData } =
    postIds.length > 0
      ? await supabase.from("blog_post_tags").select("post_id, tag_id").in("post_id", postIds)
      : { data: [] };
  const tagIds = [...new Set((postTagsData ?? []).map((pt) => pt.tag_id))];
  const { data: tagsData } =
    tagIds.length > 0 ? await supabase.from("blog_tags").select("id, slug, name").in("id", tagIds) : { data: [] };
  const tagMap = new Map((tagsData ?? []).map((t) => [t.id, t]));
  const tagsByPostId = new Map<string, BlogTag[]>();
  for (const pt of postTagsData ?? []) {
    const tag = tagMap.get(pt.tag_id);
    if (tag) {
      const arr = tagsByPostId.get(pt.post_id) ?? [];
      arr.push(tag);
      tagsByPostId.set(pt.post_id, arr);
    }
  }

  const list: BlogPostListItem[] = (posts ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    cover_image: p.cover_image,
    author_name: p.author_name,
    reading_time: p.reading_time,
    published_at: p.published_at,
    category: p.category_id ? categoryMap.get(p.category_id) ?? null : null,
    tags: tagsByPostId.get(p.id) ?? [],
  }));

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return { posts: list, total: totalCount, totalPages };
}

export async function getPostBySlug(slug: string): Promise<BlogPostRow | null> {
  const supabase = await getSupabase();
  if (!supabase) return null;

  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, content, cover_image, category_id, author_name, reading_time, published_at, updated_at")
    .eq("status", "published")
    .eq("slug", slug)
    .single();

  if (error || !post) return null;

  const category = post.category_id
    ? await supabase.from("blog_categories").select("id, slug, name, description").eq("id", post.category_id).single()
    : { data: null };
  const { data: pt } = await supabase.from("blog_post_tags").select("tag_id").eq("post_id", post.id);
  const tagIds = (pt ?? []).map((x) => x.tag_id);
  const { data: tags } =
    tagIds.length > 0 ? await supabase.from("blog_tags").select("id, slug, name").in("id", tagIds) : { data: [] };

  return {
    ...post,
    blog_categories: category.data,
    tags: tags ?? [],
  };
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  const supabase = await getSupabase();
  if (!supabase) return [];
  const { data } = await supabase.from("blog_categories").select("id, slug, name, description").order("name");
  return data ?? [];
}

export async function getBlogTags(): Promise<BlogTag[]> {
  const supabase = await getSupabase();
  if (!supabase) return [];
  const { data } = await supabase.from("blog_tags").select("id, slug, name").order("name");
  return data ?? [];
}

export async function getPostsByCategory(
  categorySlug: string,
  page = 1
): Promise<{ posts: BlogPostListItem[]; total: number; totalPages: number; category: BlogCategory | null }> {
  const supabase = await getSupabase();
  if (!supabase) return { posts: [], total: 0, totalPages: 0, category: null };

  const { data: cat } = await supabase
    .from("blog_categories")
    .select("id, slug, name, description")
    .eq("slug", categorySlug)
    .single();
  if (!cat) return { posts: [], total: 0, totalPages: 0, category: null };

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data: posts, error, count } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, cover_image, author_name, reading_time, published_at, category_id", {
      count: "exact",
    })
    .eq("status", "published")
    .eq("category_id", cat.id)
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) return { posts: [], total: 0, totalPages: 0, category: cat };
  const totalCount = count ?? 0;

  const postIds = (posts ?? []).map((p) => p.id);
  const { data: postTagsData } =
    postIds.length > 0
      ? await supabase.from("blog_post_tags").select("post_id, tag_id").in("post_id", postIds)
      : { data: [] };
  const tagIds = [...new Set((postTagsData ?? []).map((pt) => pt.tag_id))];
  const { data: tagsData } =
    tagIds.length > 0 ? await supabase.from("blog_tags").select("id, slug, name").in("id", tagIds) : { data: [] };
  const tagMap = new Map((tagsData ?? []).map((t) => [t.id, t]));
  const tagsByPostId = new Map<string, BlogTag[]>();
  for (const pt of postTagsData ?? []) {
    const tag = tagMap.get(pt.tag_id);
    if (tag) {
      const arr = tagsByPostId.get(pt.post_id) ?? [];
      arr.push(tag);
      tagsByPostId.set(pt.post_id, arr);
    }
  }

  const list: BlogPostListItem[] = (posts ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    cover_image: p.cover_image,
    author_name: p.author_name,
    reading_time: p.reading_time,
    published_at: p.published_at,
    category: cat,
    tags: tagsByPostId.get(p.id) ?? [],
  }));

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return { posts: list, total: totalCount, totalPages, category: cat };
}

export async function getPostsByTag(
  tagSlug: string,
  page = 1
): Promise<{ posts: BlogPostListItem[]; total: number; totalPages: number; tag: BlogTag | null }> {
  const supabase = await getSupabase();
  if (!supabase) return { posts: [], total: 0, totalPages: 0, tag: null };

  const { data: tag } = await supabase.from("blog_tags").select("id, slug, name").eq("slug", tagSlug).single();
  if (!tag) return { posts: [], total: 0, totalPages: 0, tag: null };

  const { data: pt } = await supabase.from("blog_post_tags").select("post_id").eq("tag_id", tag.id);
  const postIds = (pt ?? []).map((x) => x.post_id);
  if (postIds.length === 0) return { posts: [], total: 0, totalPages: 0, tag };

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data: posts, error, count } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, cover_image, author_name, reading_time, published_at, category_id", {
      count: "exact",
    })
    .eq("status", "published")
    .in("id", postIds)
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) return { posts: [], total: 0, totalPages: 0, tag };
  const totalCount = count ?? 0;

  const categoryIds = [...new Set((posts ?? []).map((p) => p.category_id).filter(Boolean))] as string[];
  const { data: categories } =
    categoryIds.length > 0
      ? await supabase.from("blog_categories").select("id, slug, name, description").in("id", categoryIds)
      : { data: [] };
  const categoryMap = new Map((categories ?? []).map((c) => [c.id, c]));

  const fetchedPostIds = (posts ?? []).map((p) => p.id);
  const { data: postTagsData } = await supabase
    .from("blog_post_tags")
    .select("post_id, tag_id")
    .in("post_id", fetchedPostIds);
  const allTagIds = [...new Set((postTagsData ?? []).map((x) => x.tag_id))];
  const { data: tagsData } =
    allTagIds.length > 0 ? await supabase.from("blog_tags").select("id, slug, name").in("id", allTagIds) : { data: [] };
  const tagMap = new Map((tagsData ?? []).map((t) => [t.id, t]));
  const tagsByPostId = new Map<string, BlogTag[]>();
  for (const p of postTagsData ?? []) {
    const t = tagMap.get(p.tag_id);
    if (t) {
      const arr = tagsByPostId.get(p.post_id) ?? [];
      arr.push(t);
      tagsByPostId.set(p.post_id, arr);
    }
  }

  const list: BlogPostListItem[] = (posts ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    cover_image: p.cover_image,
    author_name: p.author_name,
    reading_time: p.reading_time,
    published_at: p.published_at,
    category: p.category_id ? categoryMap.get(p.category_id) ?? null : null,
    tags: tagsByPostId.get(p.id) ?? [],
  }));

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return { posts: list, total: totalCount, totalPages, tag };
}

export async function getAllBlogSlugs(): Promise<string[]> {
  const supabase = await getSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("status", "published")
    .not("published_at", "is", null);
  return (data ?? []).map((r) => r.slug);
}

/** For sitemap: slug + updated_at (lastModified). */
export async function getBlogSlugsWithUpdated(): Promise<{ slug: string; updated_at: string | null }[]> {
  const supabase = await getSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("status", "published")
    .not("published_at", "is", null);
  return data ?? [];
}

export { PAGE_SIZE };
