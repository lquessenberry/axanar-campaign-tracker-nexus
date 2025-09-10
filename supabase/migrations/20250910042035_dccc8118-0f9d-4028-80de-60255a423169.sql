-- Investigate and fix cross-contamination between campaigns
-- Based on the analysis:
-- - Axanar (Indiegogo) and Prelude have similar avg amounts (~$73), suggesting mixed data
-- - Star Trek: Axanar has much lower avg (~$47), suggesting it got the smaller pledges

-- Let's look at the source data to understand the original campaign assignments
-- First, check if we have legacy_pledges with original campaign assignments
WITH pledge_source_analysis AS (
  SELECT 
    c.name as campaign_name,
    c.provider,
    p.amount,
    p.legacy_id,
    p.created_at,
    -- Look for patterns in amounts that might indicate source
    CASE 
      WHEN p.amount >= 1000 THEN 'high_value'
      WHEN p.amount >= 100 THEN 'medium_value' 
      WHEN p.amount >= 25 THEN 'low_value'
      ELSE 'micro_value'
    END as amount_category
  FROM pledges p
  JOIN campaigns c ON p.campaign_id = c.id
  WHERE c.name ILIKE '%axanar%'
),
campaign_amount_distribution AS (
  SELECT 
    campaign_name,
    provider,
    amount_category,
    COUNT(*) as pledge_count,
    SUM(amount) as category_total
  FROM pledge_source_analysis
  GROUP BY campaign_name, provider, amount_category
  ORDER BY campaign_name, amount_category
)
SELECT * FROM campaign_amount_distribution;