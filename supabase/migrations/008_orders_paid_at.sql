-- Optional paid_at for audit (set when webhook marks order paid)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paid_at timestamptz;
