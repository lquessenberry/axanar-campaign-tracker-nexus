-- Update campaign_totals view to honor campaign_display_overrides for goal, amount, and backers
-- This mirrors the change applied directly in Supabase so migrations stay in sync with code.
CREATE OR REPLACE VIEW public.campaign_totals AS
SELECT 
  c.id AS campaign_id,
  c.name AS campaign_name,
  c.provider,
  c.start_date,
  c.end_date,
  c.active,
  COALESCE(cdo.display_goal, c.goal_amount) AS goal_amount,
  COALESCE(cdo.display_amount, COALESCE(pledge_totals.total_amount, 0::numeric)) AS total_amount,
  COALESCE(cdo.display_backers::bigint, COALESCE(pledge_totals.backers_count, 0::bigint)) AS backers_count,
  COALESCE(pledge_totals.total_pledges, 0::bigint) AS total_pledges
FROM public.campaigns c
LEFT JOIN (
  SELECT 
    p.campaign_id,
    SUM(p.amount) AS total_amount,
    COUNT(DISTINCT p.donor_id) AS backers_count,
    COUNT(*) AS total_pledges
  FROM public.pledges p
  WHERE p.campaign_id IS NOT NULL
  GROUP BY p.campaign_id
) pledge_totals ON c.id = pledge_totals.campaign_id
LEFT JOIN public.campaign_display_overrides cdo ON c.id = cdo.campaign_id;
