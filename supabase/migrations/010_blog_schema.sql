-- Blog system: categories, tags, posts, post_tags
-- Independent of e-commerce; status = 'published' for public listing

CREATE TABLE IF NOT EXISTS public.blog_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT blog_categories_pkey PRIMARY KEY (id),
  CONSTRAINT blog_categories_slug_key UNIQUE (slug)
);

CREATE TABLE IF NOT EXISTS public.blog_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT blog_tags_pkey PRIMARY KEY (id),
  CONSTRAINT blog_tags_slug_key UNIQUE (slug)
);

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  title text NOT NULL,
  excerpt text,
  content text,
  cover_image text,
  category_id uuid REFERENCES public.blog_categories(id),
  author_name text,
  reading_time integer,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT blog_posts_pkey PRIMARY KEY (id),
  CONSTRAINT blog_posts_slug_key UNIQUE (slug)
);

CREATE TABLE IF NOT EXISTS public.blog_post_tags (
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  CONSTRAINT blog_post_tags_pkey PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published ON public.blog_posts(status, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts(category_id) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_post ON public.blog_post_tags(post_id);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog_posts_read_published" ON public.blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "blog_categories_read_all" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "blog_tags_read_all" ON public.blog_tags FOR SELECT USING (true);
CREATE POLICY "blog_post_tags_read_all" ON public.blog_post_tags FOR SELECT USING (true);
