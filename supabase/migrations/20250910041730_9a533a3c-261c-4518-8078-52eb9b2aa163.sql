-- Fix swapped Axanar campaign data
-- Current situation: The two Kickstarter campaigns have their data completely swapped

-- Based on web scraping:
-- "Star Trek: Axanar" (main campaign) should have: $638,471 raised, 8,584 backers
-- "Star Trek: Prelude to Axanar" should have: $101,171 raised, 3,089 backers

-- Get the campaign IDs for the swap
WITH axanar_main AS (
  SELECT id FROM campaigns 
  WHERE name = 'Star Trek: Axanar' AND provider = '1'
  LIMIT 1
),
prelude AS (
  SELECT id FROM campaigns 
  WHERE name = 'Star Trek: Prelude to Axanar' AND provider = '1'
  LIMIT 1
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

-- Log this major data correction
INSERT INTO audit_trail (action, details, created_at)
VALUES (
  'CAMPAIGN_DATA_SWAP_CORRECTION',
  jsonb_build_object(
    'action', 'Swapped pledge assignments between Star Trek: Axanar and Star Trek: Prelude to Axanar campaigns',
    'reason', 'Campaigns had completely swapped financial data - correcting based on original Kickstarter sources',
    'correction_date', now()
  ),
  now()
);