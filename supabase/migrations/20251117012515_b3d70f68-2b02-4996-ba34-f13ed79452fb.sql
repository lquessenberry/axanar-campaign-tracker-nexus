-- Update contributor_leaderboard view to multiply activity_score by 1000 for potential ARES XP
DROP VIEW IF EXISTS public.contributor_leaderboard CASCADE;

CREATE OR REPLACE VIEW public.contributor_leaderboard AS
SELECT 
  d.id AS donor_id,
  d.email,
  d.first_name,
  d.last_name,
  d.donor_name,
  d.full_name,
  d.avatar_url,
  d.auth_user_id IS NOT NULL AS is_account_linked,
  
  -- Total donated amount
  COALESCE(SUM(p.amount), 0) AS total_donated,
  
  -- Total number of contributions
  COUNT(p.id) AS total_contributions,
  
  -- Number of campaigns supported
  COUNT(DISTINCT p.campaign_id) AS campaigns_supported,
  
  -- First and last contribution dates
  MIN(p.created_at) AS first_contribution_date,
  MAX(p.created_at) AS last_contribution_date,
  
  -- Years of support (calculated from first contribution to now)
  CASE 
    WHEN MIN(p.created_at) IS NOT NULL 
    THEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, MIN(p.created_at)::DATE)) + 
         (EXTRACT(MONTH FROM AGE(CURRENT_DATE, MIN(p.created_at)::DATE)) / 12.0)
    ELSE 0
  END AS years_supporting,
  
  -- Profile completeness score (percentage)
  CASE 
    WHEN d.auth_user_id IS NOT NULL THEN
      (
        CASE WHEN d.avatar_url IS NOT NULL THEN 20 ELSE 0 END +
        CASE WHEN d.bio IS NOT NULL AND LENGTH(d.bio) > 0 THEN 20 ELSE 0 END +
        CASE WHEN d.full_name IS NOT NULL THEN 20 ELSE 0 END +
        CASE WHEN d.first_name IS NOT NULL THEN 20 ELSE 0 END +
        CASE WHEN d.last_name IS NOT NULL THEN 20 ELSE 0 END
      )
    ELSE 0
  END AS profile_completeness_score,
  
  -- Recruitment metrics (set to 0 for now)
  0 AS recruits_confirmed,
  0 AS recruitment_xp,
  
  -- Achievement count
  COALESCE(
    (SELECT COUNT(*) FROM public.user_achievements ua WHERE ua.user_id = d.auth_user_id),
    0
  ) AS achievement_count,
  
  -- Proposed ARES (for unlinked accounts)
  COALESCE(SUM(p.amount) * 100, 0) AS proposed_ares,
  
  -- Overall activity score - MULTIPLIED BY 1000 for potential ARES XP hedge
  (
    -- Base: donation amount in dollars (not cents)
    COALESCE(SUM(p.amount), 0) +
    
    -- Profile completeness bonus
    CASE 
      WHEN d.auth_user_id IS NOT NULL THEN
        (
          CASE WHEN d.avatar_url IS NOT NULL THEN 10 ELSE 0 END +
          CASE WHEN d.bio IS NOT NULL AND LENGTH(d.bio) > 0 THEN 10 ELSE 0 END +
          CASE WHEN d.full_name IS NOT NULL THEN 5 ELSE 0 END
        )
      ELSE 0
    END +
    
    -- Campaigns supported bonus (5 points per campaign)
    (COUNT(DISTINCT p.campaign_id) * 5) +
    
    -- Years of support bonus (10 points per year)
    (
      CASE 
        WHEN MIN(p.created_at) IS NOT NULL 
        THEN (EXTRACT(YEAR FROM AGE(CURRENT_DATE, MIN(p.created_at)::DATE)) * 10)
        ELSE 0
      END
    )
  ) * 1000 AS activity_score  -- Multiply by 1000 for potential ARES XP hedge

FROM public.donors d
LEFT JOIN public.pledges p ON d.id = p.donor_id
GROUP BY d.id, d.email, d.first_name, d.last_name, d.donor_name, d.full_name, d.avatar_url, d.auth_user_id, d.bio;