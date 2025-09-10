-- Fix swapped Axanar campaign data
-- Current situation: The two Kickstarter campaigns have their data completely swapped

-- First, let's identify the campaigns clearly
-- Based on web scraping:
-- "Star Trek: Axanar" (main campaign) should have: $638,471 raised, 8,584 backers
-- "Star Trek: Prelude to Axanar" should have: $101,171 raised, 3,089 backers

-- Get the current incorrect totals and swap them
WITH campaign_data AS (
  SELECT 
    c.id,
    c.name,
    ct.total_amount,
    ct.backers_count,
    ct.goal_amount
  FROM campaigns c
  LEFT JOIN campaign_totals ct ON c.id = ct.campaign_id
  WHERE c.name IN ('Star Trek: Axanar', 'Star Trek: Prelude to Axanar')
    AND c.provider = '1' -- Kickstarter campaigns
),
axanar_main AS (
  SELECT * FROM campaign_data WHERE name = 'Star Trek: Axanar'
),
prelude AS (
  SELECT * FROM campaign_data WHERE name = 'Star Trek: Prelude to Axanar'
)

-- Update pledges to swap campaign assignments
UPDATE pledges 
SET campaign_id = CASE 
  WHEN campaign_id = (SELECT id FROM axanar_main) 
  THEN (SELECT id FROM prelude)
  WHEN campaign_id = (SELECT id FROM prelude) 
  THEN (SELECT id FROM axanar_main)
  ELSE campaign_id
END
WHERE campaign_id IN (
  (SELECT id FROM axanar_main),
  (SELECT id FROM prelude)
);

-- Refresh the materialized view if it exists, or let triggers handle the update
-- The campaign_totals view should automatically reflect the correct totals now

-- Log this major data correction
INSERT INTO audit_trail (action, details, created_at)
VALUES (
  'CAMPAIGN_DATA_SWAP_CORRECTION',
  jsonb_build_object(
    'action', 'Swapped pledge assignments between Star Trek: Axanar and Star Trek: Prelude to Axanar campaigns',
    'reason', 'Campaigns had completely swapped financial data - correcting based on original Kickstarter sources',
    'affected_campaigns', ARRAY[
      'Star Trek: Axanar (main campaign)',
      'Star Trek: Prelude to Axanar'
    ],
    'correction_date', now()
  ),
  now()
);