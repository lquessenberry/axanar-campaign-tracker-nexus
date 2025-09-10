-- Reconcile pledges to the three canonical campaigns using source tables (email + amount + date proximity)

-- 0) Resolve campaign IDs
WITH campaign_ids AS (
  SELECT 'KICKSTARTER_AXANAR' AS key, id AS cid FROM campaigns 
    WHERE name = 'Star Trek: Axanar' AND (LOWER(provider) LIKE '%kickstarter%' OR provider = '1')
  UNION ALL
  SELECT 'KICKSTARTER_PRELUDE', id FROM campaigns 
    WHERE name = 'Star Trek: Prelude to Axanar' AND (LOWER(provider) LIKE '%kickstarter%' OR provider = '1')
  UNION ALL
  SELECT 'INDIEGOGO_AXANAR', id FROM campaigns 
    WHERE name = 'Axanar' AND (LOWER(provider) LIKE '%indiegogo%' OR provider = '2')
),
-- 1) Match Kickstarter Axanar
k_axanar_matches AS (
  SELECT DISTINCT ON (p.id)
    p.id AS pledge_id,
    (SELECT cid FROM campaign_ids WHERE key = 'KICKSTARTER_AXANAR') AS target_cid,
    ABS(COALESCE(p.created_at::date, CURRENT_DATE) - COALESCE(ks.pledge_date::date, CURRENT_DATE)) AS date_diff
  FROM legacy_src_kickstarter_axanar ks
  JOIN donors d ON LOWER(TRIM(d.email)) = LOWER(TRIM(ks.email))
  JOIN pledges p ON p.donor_id = d.id AND p.amount = ks.amount
  ORDER BY p.id, date_diff
),
-- 2) Match Kickstarter Prelude
k_prelude_matches AS (
  SELECT DISTINCT ON (p.id)
    p.id AS pledge_id,
    (SELECT cid FROM campaign_ids WHERE key = 'KICKSTARTER_PRELUDE') AS target_cid,
    ABS(COALESCE(p.created_at::date, CURRENT_DATE) - COALESCE(kp.pledge_date::date, CURRENT_DATE)) AS date_diff
  FROM legacy_src_kickstarter_prelude kp
  JOIN donors d ON LOWER(TRIM(d.email)) = LOWER(TRIM(kp.email))
  JOIN pledges p ON p.donor_id = d.id AND p.amount = kp.amount
  ORDER BY p.id, date_diff
),
-- 3) Match Indiegogo Axanar
ig_axanar_matches AS (
  SELECT DISTINCT ON (p.id)
    p.id AS pledge_id,
    (SELECT cid FROM campaign_ids WHERE key = 'INDIEGOGO_AXANAR') AS target_cid,
    ABS(COALESCE(p.created_at::date, CURRENT_DATE) - COALESCE(ig.pledge_date::date, CURRENT_DATE)) AS date_diff
  FROM legacy_src_indiegogo ig
  JOIN donors d ON LOWER(TRIM(d.email)) = LOWER(TRIM(ig.email))
  JOIN pledges p ON p.donor_id = d.id AND p.amount = ig.amount
  ORDER BY p.id, date_diff
),
-- Combine best mapping priority: exact source tables win. If multiple sources match (rare), choose smallest date diff.
combined_matches AS (
  SELECT * FROM k_axanar_matches
  UNION ALL
  SELECT * FROM k_prelude_matches
  UNION ALL
  SELECT * FROM ig_axanar_matches
),
ranked_matches AS (
  SELECT 
    pledge_id,
    target_cid,
    ROW_NUMBER() OVER (PARTITION BY pledge_id ORDER BY date_diff NULLS FIRST) AS rn
  FROM combined_matches
)
-- Apply final reassignment
UPDATE pledges p
SET campaign_id = rm.target_cid
FROM ranked_matches rm
WHERE p.id = rm.pledge_id AND rm.rn = 1;