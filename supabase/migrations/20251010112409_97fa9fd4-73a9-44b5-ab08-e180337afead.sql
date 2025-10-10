
-- Secure the public_leaderboard view by enabling security_invoker
-- This ensures the view respects RLS policies of underlying tables (donors, pledges)

ALTER VIEW public.public_leaderboard SET (security_invoker = true);

-- Add RLS policy to pledges table to ensure leaderboard data is properly restricted
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'pledges' 
      AND policyname = 'pledges_deny_anonymous'
  ) THEN
    CREATE POLICY "pledges_deny_anonymous"
    ON public.pledges FOR ALL TO anon
    USING (false);
  END IF;
END $$;

-- Ensure donors table has proper anonymous denial policy
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'donors' 
      AND policyname = 'donors_deny_anonymous'
  ) THEN
    CREATE POLICY "donors_deny_anonymous"
    ON public.donors FOR ALL TO anon
    USING (false);
  END IF;
END $$;
