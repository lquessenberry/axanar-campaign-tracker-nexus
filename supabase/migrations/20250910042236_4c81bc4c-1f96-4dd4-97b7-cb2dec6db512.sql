-- Final correction: Move high-value pledges to the correct main Axanar campaign
-- The main "Star Trek: Axanar" campaign should have the high-value pledges

-- Get campaign IDs for reference
WITH campaign_ids AS (
  SELECT 
    id as axanar_main_id,
    'Star Trek: Axanar' as campaign_name
  FROM campaigns 
  WHERE name = 'Star Trek: Axanar' AND provider = '1'
  
  UNION ALL
  
  SELECT 
    id as prelude_id,
    'Star Trek: Prelude to Axanar' as campaign_name
  FROM campaigns 
  WHERE name = 'Star Trek: Prelude to Axanar' AND provider = 'Kickstarter'
  
  UNION ALL
  
  SELECT 
    id as indiegogo_id,
    'Axanar' as campaign_name  
  FROM campaigns 
  WHERE name = 'Axanar' AND provider = 'Indiegogo'
),
axanar_main_id AS (
  SELECT id FROM campaigns WHERE name = 'Star Trek: Axanar' AND provider = '1'
),
high_value_pledge_sources AS (
  -- Find high-value pledges in wrong campaigns
  SELECT 
    p.id as pledge_id,
    p.amount,
    c.name as current_campaign,
    c.provider as current_provider
  FROM pledges p
  JOIN campaigns c ON p.campaign_id = c.id
  WHERE c.name IN ('Axanar', 'Star Trek: Prelude to Axanar')
    AND p.amount >= 1000
  ORDER BY p.amount DESC
)

-- Move high-value pledges (≥$1000) from Indiegogo and Prelude to main Axanar
UPDATE pledges 
SET campaign_id = (SELECT id FROM axanar_main_id)
WHERE amount >= 1000 
  AND campaign_id IN (
    SELECT id FROM campaigns 
    WHERE name IN ('Axanar', 'Star Trek: Prelude to Axanar')
      AND provider IN ('Indiegogo', 'Kickstarter')
  );

-- Log this correction
INSERT INTO audit_trail (action, details, created_at)
VALUES (
  'HIGH_VALUE_PLEDGE_REDISTRIBUTION',
  jsonb_build_object(
    'action', 'Moved high-value pledges (≥$1000) to correct main Axanar campaign',
    'reason', 'High-value Kickstarter pledges were incorrectly assigned to Indiegogo and Prelude campaigns',
    'threshold', '$1000+',
    'target_campaign', 'Star Trek: Axanar (main Kickstarter campaign)',
    'correction_date', now()
  ),
  now()
);