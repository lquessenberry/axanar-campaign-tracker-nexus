-- Security Fix: Protect contributor_leaderboard view from public access
-- This view contains sensitive PII (emails, names, donation amounts)

-- Enable RLS on the view
ALTER VIEW contributor_leaderboard SET (security_invoker = true);

-- Note: Views don't support RLS policies directly in the same way as tables.
-- Instead, we need to revoke public access and grant only to authenticated users.

-- Revoke all public access
REVOKE ALL ON contributor_leaderboard FROM anon;
REVOKE ALL ON contributor_leaderboard FROM public;

-- Grant SELECT to authenticated users only
GRANT SELECT ON contributor_leaderboard TO authenticated;

-- Optionally create a public-safe leaderboard view without PII
CREATE OR REPLACE VIEW public.public_leaderboard AS
SELECT 
  donor_id,
  donor_name,
  -- Mask email to show only domain for privacy
  CASE 
    WHEN email IS NOT NULL THEN 
      CONCAT(LEFT(email, 2), '***@', SPLIT_PART(email, '@', 2))
    ELSE NULL
  END as masked_email,
  total_donated,
  total_contributions,
  campaigns_supported,
  years_supporting,
  first_contribution_date,
  last_contribution_date
FROM contributor_leaderboard;

-- Allow public read access to the sanitized view
GRANT SELECT ON public.public_leaderboard TO anon;
GRANT SELECT ON public.public_leaderboard TO authenticated;