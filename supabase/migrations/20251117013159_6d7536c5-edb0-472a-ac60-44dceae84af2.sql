-- Fix type mismatch in contributor_leaderboard view - cast integer literals to bigint
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
  
  -- Recruitment metrics (cast to bigint to match function signature)
  0::bigint AS recruits_confirmed,
  0::bigint AS recruitment_xp,
  
  -- Achievement count (cast to bigint)
  COALESCE(
    (SELECT COUNT(*)::bigint FROM public.user_achievements ua WHERE ua.user_id = d.auth_user_id),
    0::bigint
  ) AS achievement_count,
  
  -- Proposed ARES (for unlinked accounts)
  COALESCE(SUM(p.amount) * 100, 0) AS proposed_ares,
  
  -- Potential ARES XP (hedge with anticipation gap)
  -- Base: donation_amount / 10 (converts dollars to base points aligned with ARES scale)
  -- Then add bonuses and multiply by 1000 for potential scale
  (
    -- Base: donation amount divided by 10
    COALESCE(SUM(p.amount) / 10, 0) +
    
    -- Profile completeness bonus
    CASE 
      WHEN d.auth_user_id IS NOT NULL THEN
        (
          CASE WHEN d.avatar_url IS NOT NULL THEN 2 ELSE 0 END +
          CASE WHEN d.bio IS NOT NULL AND LENGTH(d.bio) > 0 THEN 2 ELSE 0 END +
          CASE WHEN d.full_name IS NOT NULL THEN 1 ELSE 0 END
        )
      ELSE 0
    END +
    
    -- Campaigns supported bonus (1 point per campaign)
    (COUNT(DISTINCT p.campaign_id) * 1) +
    
    -- Years of support bonus (2 points per year)
    (
      CASE 
        WHEN MIN(p.created_at) IS NOT NULL 
        THEN (EXTRACT(YEAR FROM AGE(CURRENT_DATE, MIN(p.created_at)::DATE)) * 2)
        ELSE 0
      END
    )
  ) * 1000 AS activity_score  -- Multiply by 1000 for potential ARES XP scale

FROM public.donors d
LEFT JOIN public.pledges p ON d.id = p.donor_id
GROUP BY d.id, d.email, d.first_name, d.last_name, d.donor_name, d.full_name, d.avatar_url, d.auth_user_id, d.bio;