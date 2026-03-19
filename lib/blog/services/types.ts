export type ServiceResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function success<T>(data: T): ServiceResult<T> {
  return { ok: true, data };
}

export function fail(error: string): ServiceResult<never> {
  return { ok: false, error };
}

export type BlogStatus = "draft" | "published" | "scheduled";

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

export type BlogPostDetail = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  category_id: string | null;
  author_name: string | null;
  reading_time: number | null;
  status: BlogStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string | null;
  category: BlogCategory | null;
  tags: BlogTag[];
};

export type BlogCategoryWithCount = BlogCategory & {
  post_count: number;
};
