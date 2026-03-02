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

export type BlogCategoryWithCount = BlogCategory & {
  post_count: number;
};

type BlogPostListDbRow = {
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

async function getSupabase() {
  try {
    return createStaticClient();
  } catch {
    return null;
  }
}

function sanitizeBlogHtml(content: string | null): string | null {
  if (!content) return content;

  let safe = content;
  safe = safe.replace(/<\s*\/?\s*(script|style|iframe|object|embed|form|input|button|textarea|select|meta|link|base)\b[^>]*>/gi, "");
  safe = safe.replace(/\son\w+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "");
  safe = safe.replace(/\sstyle\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "");
  safe = safe.replace(/\s(srcdoc)\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "");
  safe = safe.replace(/\s(href|src|xlink:href)\s*=\s*("|\')\s*(javascript:|data:text\/html)/gi, ' $1=$2#');
  safe = safe.replace(/\s(href|src|xlink:href)\s*=\s*([^\s>"']+)/gi, (full, attr: string, value: string) => {
    const normalized = String(value).trim().toLowerCase();
    if (normalized.startsWith("javascript:") || normalized.startsWith("data:text/html")) return ` ${attr}="#"`;
    return full;
  });
  return safe;
}

async function mapPostsToListItems(supabase: NonNullable<Awaited<ReturnType<typeof getSupabase>>>, posts: BlogPostListDbRow[]) {
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

  return (posts ?? []).map((p) => ({
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
  })) as BlogPostListItem[];
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

  const list = await mapPostsToListItems(supabase, (posts ?? []) as BlogPostListDbRow[]);

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return { posts: list, total: totalCount, totalPages };
}

export async function getRecentPosts(limit = 5): Promise<BlogPostListItem[]> {
  const supabase = await getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, cover_image, author_name, reading_time, published_at, category_id")
    .eq("status", "published")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(Math.max(1, limit));
  if (error) return [];

  return mapPostsToListItems(supabase, (data ?? []) as BlogPostListDbRow[]);
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
    content: sanitizeBlogHtml(post.content),
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

export async function getBlogCategoriesWithCounts(): Promise<BlogCategoryWithCount[]> {
  const supabase = await getSupabase();
  if (!supabase) return [];

  const [{ data: categories }, { data: postRows }] = await Promise.all([
    supabase.from("blog_categories").select("id, slug, name, description").order("name"),
    supabase.from("blog_posts").select("category_id").eq("status", "published").not("published_at", "is", null),
  ]);

  const countByCategoryId = new Map<string, number>();
  for (const row of postRows ?? []) {
    if (!row.category_id) continue;
    countByCategoryId.set(row.category_id, (countByCategoryId.get(row.category_id) ?? 0) + 1);
  }

  return (categories ?? []).map((category) => ({
    ...category,
    post_count: countByCategoryId.get(category.id) ?? 0,
  }));
}

export async function getBlogTags(): Promise<BlogTag[]> {
  const supabase = await getSupabase();
  if (!supabase) return [];
  const { data } = await supabase.from("blog_tags").select("id, slug, name").order("name");
  return data ?? [];
}

export async function getRelatedPosts(
  postId: string,
  categoryId?: string,
  tagIds: string[] = [],
  limit = 4
): Promise<BlogPostListItem[]> {
  const supabase = await getSupabase();
  if (!supabase) return [];

  const safeLimit = Math.max(1, limit);
  const scoreByPostId = new Map<string, number>();
  const publishedAtByPostId = new Map<string, string>();

  if (categoryId) {
    const { data } = await supabase
      .from("blog_posts")
      .select("id, published_at")
      .eq("status", "published")
      .eq("category_id", categoryId)
      .not("published_at", "is", null)
      .neq("id", postId)
      .order("published_at", { ascending: false })
      .limit(24);
    for (const row of data ?? []) {
      scoreByPostId.set(row.id, (scoreByPostId.get(row.id) ?? 0) + 3);
      if (row.published_at) publishedAtByPostId.set(row.id, row.published_at);
    }
  }

  if (tagIds.length > 0) {
    const { data: tagRows } = await supabase
      .from("blog_post_tags")
      .select("post_id, tag_id")
      .in("tag_id", tagIds)
      .neq("post_id", postId);
    const tagWeightByPostId = new Map<string, number>();
    for (const row of tagRows ?? []) {
      tagWeightByPostId.set(row.post_id, (tagWeightByPostId.get(row.post_id) ?? 0) + 1);
    }

    const candidateIds = [...tagWeightByPostId.keys()];
    if (candidateIds.length > 0) {
      const { data: publishedRows } = await supabase
        .from("blog_posts")
        .select("id, published_at")
        .eq("status", "published")
        .not("published_at", "is", null)
        .in("id", candidateIds);
      for (const row of publishedRows ?? []) {
        scoreByPostId.set(row.id, (scoreByPostId.get(row.id) ?? 0) + (tagWeightByPostId.get(row.id) ?? 0));
        if (row.published_at) publishedAtByPostId.set(row.id, row.published_at);
      }
    }
  }

  const rankedIds = [...scoreByPostId.entries()]
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return (
        new Date(publishedAtByPostId.get(b[0]) ?? 0).getTime() - new Date(publishedAtByPostId.get(a[0]) ?? 0).getTime()
      );
    })
    .map(([id]) => id)
    .slice(0, safeLimit);

  if (rankedIds.length === 0) {
    const fallback = await getRecentPosts(safeLimit + 1);
    return fallback.filter((p) => p.id !== postId).slice(0, safeLimit);
  }

  const { data: rows, error } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, cover_image, author_name, reading_time, published_at, category_id")
    .eq("status", "published")
    .not("published_at", "is", null)
    .in("id", rankedIds);
  if (error) return [];

  const mapped = await mapPostsToListItems(supabase, (rows ?? []) as BlogPostListDbRow[]);
  const mappedById = new Map(mapped.map((p) => [p.id, p]));
  return rankedIds.map((id) => mappedById.get(id)).filter(Boolean).slice(0, safeLimit) as BlogPostListItem[];
}

export async function getPopularPosts(limit = 4): Promise<BlogPostListItem[]> {
  return getRecentPosts(limit);
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

export async function getAllBlogCategorySlugs(): Promise<string[]> {
  const supabase = await getSupabase();
  if (!supabase) return [];
  const { data } = await supabase.from("blog_categories").select("slug");
  return (data ?? []).map((r) => r.slug);
}

export async function getAllBlogTagSlugs(): Promise<string[]> {
  const supabase = await getSupabase();
  if (!supabase) return [];
  const { data } = await supabase.from("blog_tags").select("slug");
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
