-- Behavioral recommendation support: tracked product events.

CREATE TABLE IF NOT EXISTS public.user_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  product_id uuid NOT NULL,
  event_type text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_events_pkey PRIMARY KEY (id),
  CONSTRAINT user_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT user_events_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
  CONSTRAINT user_events_event_type_check CHECK (
    event_type IN ('view_product', 'add_to_cart', 'purchase')
  )
);

ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_events_select_own" ON public.user_events;
CREATE POLICY "user_events_select_own" ON public.user_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_events_product_event_created
  ON public.user_events(product_id, event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_events_user_created
  ON public.user_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_events_product_user
  ON public.user_events(product_id, user_id);
