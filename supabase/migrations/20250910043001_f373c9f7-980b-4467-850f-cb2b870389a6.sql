-- 1) Create a safety backup of pledges before corrections
CREATE TABLE IF NOT EXISTS public.pledges_backup_rollback_20250910 AS
SELECT * FROM public.pledges;

-- 2) Deterministic reassignment using legacy mapping
-- Map legacy_campaigns -> current campaigns by exact name + platform
WITH legacy_to_current AS (
  SELECT 
    lc.id::bigint AS legacy_campaign_id,
    lc.name AS legacy_name,
    lc.platform,
    c.id AS current_campaign_id
  FROM legacy_campaigns lc
  JOIN campaigns c
    ON LOWER(TRIM(c.name)) = LOWER(TRIM(lc.name))
    AND (
      (LOWER(TRIM(lc.platform)) LIKE '%kickstarter%' AND (LOWER(TRIM(c.provider)) LIKE '%kickstarter%' OR c.provider = '1'))
      OR
      (LOWER(TRIM(lc.platform)) LIKE '%indiegogo%' AND (LOWER(TRIM(c.provider)) LIKE '%indiegogo%' OR c.provider = '2'))
      OR lc.platform IS NULL
    )
),
-- Build rows to update from pledges.legacy_id -> legacy_pledges.id -> legacy_campaigns.id -> campaigns.id
reassignment AS (
  SELECT 
    p.id AS pledge_id,
    p.campaign_id AS current_campaign_id,
    ltc.current_campaign_id AS correct_campaign_id
  FROM pledges p
  JOIN legacy_pledges lp ON p.legacy_id = lp.id
  JOIN legacy_to_current ltc ON lp.campaign_id = ltc.legacy_campaign_id
  WHERE p.campaign_id IS DISTINCT FROM ltc.current_campaign_id
)
-- Apply reassignment
UPDATE pledges p
SET campaign_id = r.correct_campaign_id
FROM reassignment r
WHERE p.id = r.pledge_id;

-- 3) Ensure providers are consistent for the three canonical campaigns
UPDATE campaigns
SET provider = 'Kickstarter'
WHERE name IN ('Star Trek: Axanar', 'Star Trek: Prelude to Axanar');

UPDATE campaigns
SET provider = 'Indiegogo'
WHERE name = 'Axanar';

-- 4) Optional: set campaigns active for public visibility if intended (no-op if already set)
UPDATE campaigns SET active = true WHERE name IN ('Star Trek: Axanar', 'Star Trek: Prelude to Axanar', 'Axanar');

-- 5) Log rollback + deterministic fix
INSERT INTO audit_trail (action, details, created_at)
VALUES (
  'ROLLBACK_AND_DETERMINISTIC_REASSIGN',
  jsonb_build_object(
    'note', 'Restored accurate campaign assignments using legacy mapping (legacy_pledges -> legacy_campaigns -> campaigns). Backup saved to pledges_backup_rollback_20250910.',
    'timestamp', now()
  ),
  now()
);
