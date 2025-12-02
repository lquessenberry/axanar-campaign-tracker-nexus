-- First, update Prelude to Axanar Kickstarter rewards with proper minimum_amounts extracted from descriptions
UPDATE rewards
SET minimum_amount = CAST(
  REPLACE(REPLACE(SUBSTRING(description FROM '\$([0-9,]+(?:\.[0-9]+)?)'), ',', ''), '$', '') AS NUMERIC
)
WHERE campaign_id = '80e3b1cb-9eb8-4f7e-bb39-765c7b498557'
  AND description LIKE '$%'
  AND minimum_amount = 0;

-- Create "Secret Perk" rewards for Star Trek: Axanar Kickstarter for each tier we see in import files
INSERT INTO rewards (campaign_id, name, description, minimum_amount, is_physical, requires_shipping)
SELECT 
  '7abcf9b1-d9b8-440a-808c-3a7aa7c04383' as campaign_id,
  'Axanar Kickstarter $' || tier || ' Tier' as name,
  'Original Axanar Kickstarter tier at $' || tier as description,
  tier as minimum_amount,
  true as is_physical,
  true as requires_shipping
FROM (VALUES 
  (10), (20), (25), (30), (35), (50), (65), (75), (100), (125), (150), (200), (250), (350), (400), (500), (1000), (5000)
) AS tiers(tier)
ON CONFLICT DO NOTHING;

-- Now create pledges for donors from "Axanar #1" files who have no pledge records
INSERT INTO pledges (donor_id, campaign_id, amount, reward_id, created_at, status)
SELECT 
  d.id as donor_id,
  '7abcf9b1-d9b8-440a-808c-3a7aa7c04383' as campaign_id,
  CASE 
    WHEN d.source LIKE '%$10 %' OR d.source LIKE '%$10.%' THEN 10
    WHEN d.source LIKE '%$20 %' OR d.source LIKE '%$20.%' THEN 20
    WHEN d.source LIKE '%$25 %' OR d.source LIKE '%$25.%' THEN 25
    WHEN d.source LIKE '%$30 %' OR d.source LIKE '%$30.%' THEN 30
    WHEN d.source LIKE '%$35 %' OR d.source LIKE '%$35.%' THEN 35
    WHEN d.source LIKE '%$50 %' OR d.source LIKE '%$50.%' THEN 50
    WHEN d.source LIKE '%$65 %' OR d.source LIKE '%$65.%' THEN 65
    WHEN d.source LIKE '%$75 %' OR d.source LIKE '%$75.%' THEN 75
    WHEN d.source LIKE '%$100 %' OR d.source LIKE '%$100.%' THEN 100
    WHEN d.source LIKE '%$125 %' OR d.source LIKE '%$125.%' THEN 125
    WHEN d.source LIKE '%$150 %' OR d.source LIKE '%$150.%' THEN 150
    WHEN d.source LIKE '%$200 %' OR d.source LIKE '%$200.%' THEN 200
    WHEN d.source LIKE '%$250 %' OR d.source LIKE '%$250.%' THEN 250
    WHEN d.source LIKE '%$350 %' OR d.source LIKE '%$350.%' THEN 350
    WHEN d.source LIKE '%$400 %' OR d.source LIKE '%$400.%' THEN 400
    WHEN d.source LIKE '%$500 %' OR d.source LIKE '%$500.%' THEN 500
    WHEN d.source LIKE '%$1000 %' OR d.source LIKE '%$1000.%' THEN 1000
    WHEN d.source LIKE '%$5000 %' OR d.source LIKE '%$5000.%' THEN 5000
    ELSE 0
  END as amount,
  (SELECT r.id FROM rewards r 
   WHERE r.campaign_id = '7abcf9b1-d9b8-440a-808c-3a7aa7c04383'
   AND r.minimum_amount = CASE 
    WHEN d.source LIKE '%$10 %' OR d.source LIKE '%$10.%' THEN 10
    WHEN d.source LIKE '%$20 %' OR d.source LIKE '%$20.%' THEN 20
    WHEN d.source LIKE '%$25 %' OR d.source LIKE '%$25.%' THEN 25
    WHEN d.source LIKE '%$30 %' OR d.source LIKE '%$30.%' THEN 30
    WHEN d.source LIKE '%$35 %' OR d.source LIKE '%$35.%' THEN 35
    WHEN d.source LIKE '%$50 %' OR d.source LIKE '%$50.%' THEN 50
    WHEN d.source LIKE '%$65 %' OR d.source LIKE '%$65.%' THEN 65
    WHEN d.source LIKE '%$75 %' OR d.source LIKE '%$75.%' THEN 75
    WHEN d.source LIKE '%$100 %' OR d.source LIKE '%$100.%' THEN 100
    WHEN d.source LIKE '%$125 %' OR d.source LIKE '%$125.%' THEN 125
    WHEN d.source LIKE '%$150 %' OR d.source LIKE '%$150.%' THEN 150
    WHEN d.source LIKE '%$200 %' OR d.source LIKE '%$200.%' THEN 200
    WHEN d.source LIKE '%$250 %' OR d.source LIKE '%$250.%' THEN 250
    WHEN d.source LIKE '%$350 %' OR d.source LIKE '%$350.%' THEN 350
    WHEN d.source LIKE '%$400 %' OR d.source LIKE '%$400.%' THEN 400
    WHEN d.source LIKE '%$500 %' OR d.source LIKE '%$500.%' THEN 500
    WHEN d.source LIKE '%$1000 %' OR d.source LIKE '%$1000.%' THEN 1000
    WHEN d.source LIKE '%$5000 %' OR d.source LIKE '%$5000.%' THEN 5000
    ELSE 0
  END
   LIMIT 1) as reward_id,
  COALESCE(d.created_at, d.imported_at, now()) as created_at,
  'completed' as status
FROM donors d
LEFT JOIN pledges p ON p.donor_id = d.id
WHERE p.id IS NULL
  AND d.source LIKE 'Axanar #1 -%'
  AND d.source NOT LIKE '%No Reward%';