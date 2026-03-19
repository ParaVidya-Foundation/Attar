-- Blog enhancements: scheduled status, post_metrics, auto-publish, reading_time computation

-- 1) Expand status CHECK to include 'scheduled'
ALTER TABLE public.blog_posts DROP CONSTRAINT IF EXISTS blog_posts_status_check;
ALTER TABLE public.blog_posts ADD CONSTRAINT blog_posts_status_check
  CHECK (status IN ('draft', 'published', 'scheduled'));

-- 2) Add slug index for fast lookup (slug is UNIQUE so already indexed, but explicit for clarity)
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);

-- 3) Post metrics table for view tracking
CREATE TABLE IF NOT EXISTS public.blog_post_metrics (
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  views integer NOT NULL DEFAULT 0,
  last_viewed_at timestamptz,
  CONSTRAINT blog_post_metrics_pkey PRIMARY KEY (post_id)
);

ALTER TABLE public.blog_post_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog_post_metrics_read_all" ON public.blog_post_metrics
  FOR SELECT USING (true);

CREATE POLICY "blog_post_metrics_admin_all" ON public.blog_post_metrics
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 4) Function to auto-publish scheduled posts (call via cron or edge function)
CREATE OR REPLACE FUNCTION public.publish_scheduled_blog_posts()
RETURNS integer AS $$
DECLARE
  published_count integer;
BEGIN
  WITH published AS (
    UPDATE public.blog_posts
    SET status = 'published', updated_at = now()
    WHERE status = 'scheduled'
      AND published_at IS NOT NULL
      AND published_at <= now()
    RETURNING id
  )
  SELECT count(*) INTO published_count FROM published;
  RETURN published_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5) Function to increment post view count (debounced at application level)
CREATE OR REPLACE FUNCTION public.increment_blog_post_views(p_post_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO public.blog_post_metrics (post_id, views, last_viewed_at)
  VALUES (p_post_id, 1, now())
  ON CONFLICT (post_id)
  DO UPDATE SET views = blog_post_metrics.views + 1, last_viewed_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6) Composite index for scheduled post auto-publish queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled ON public.blog_posts(status, published_at)
  WHERE status = 'scheduled';
