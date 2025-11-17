
-- Backfill historical dates from staging tables for remaining pledges
-- Updates pledges that still have 2025 import dates by matching to staging table data

-- Update from staging_indiegogo
WITH staging_dates AS (
  SELECT 
    d.id as donor_id,
    s.pledge_date,
    s.amount
  FROM staging_indiegogo s
  JOIN donors d ON LOWER(d.email) = LOWER(s.email)
  WHERE s.pledge_date IS NOT NULL
)
UPDATE pledges p
SET 
  created_at = sd.pledge_date,
  updated_at = sd.pledge_date
FROM staging_dates sd
WHERE p.donor_id = sd.donor_id
  AND p.amount = sd.amount
  AND EXTRACT(YEAR FROM p.created_at) >= 2025
  AND p.source = 'staging_indiegogo';

-- Update from staging_prelude_kickstarter  
WITH staging_dates AS (
  SELECT 
    d.id as donor_id,
    s.pledge_date,
    s.amount
  FROM staging_prelude_kickstarter s
  JOIN donors d ON LOWER(d.email) = LOWER(s.email)
  WHERE s.pledge_date IS NOT NULL
)
UPDATE pledges p
SET 
  created_at = sd.pledge_date,
  updated_at = sd.pledge_date
FROM staging_dates sd
WHERE p.donor_id = sd.donor_id
  AND p.amount = sd.amount
  AND EXTRACT(YEAR FROM p.created_at) >= 2025
  AND p.source = 'staging_prelude';

-- Update from staging_prelude_paypal
WITH staging_dates AS (
  SELECT 
    d.id as donor_id,
    s.pledge_date,
    s.amount
  FROM staging_prelude_paypal s
  JOIN donors d ON LOWER(d.email) = LOWER(s.email)
  WHERE s.pledge_date IS NOT NULL
)
UPDATE pledges p
SET 
  created_at = sd.pledge_date,
  updated_at = sd.pledge_date
FROM staging_dates sd
WHERE p.donor_id = sd.donor_id
  AND p.amount = sd.amount
  AND EXTRACT(YEAR FROM p.created_at) >= 2025
  AND p.source = 'staging_prelude_paypal';

-- Update from staging_axanar_kickstarter
WITH staging_dates AS (
  SELECT 
    d.id as donor_id,
    s.pledge_date,
    s.amount
  FROM staging_axanar_kickstarter s
  JOIN donors d ON LOWER(d.email) = LOWER(s.email)
  WHERE s.pledge_date IS NOT NULL
)
UPDATE pledges p
SET 
  created_at = sd.pledge_date,
  updated_at = sd.pledge_date
FROM staging_dates sd
WHERE p.donor_id = sd.donor_id
  AND p.amount = sd.amount
  AND EXTRACT(YEAR FROM p.created_at) >= 2025
  AND p.source IS NULL;

-- For remaining staging_axanar_paypal pledges without historical dates in staging,
-- use earliest known date from that campaign (2014-03-01 based on Kickstarter campaign)
UPDATE pledges p
SET 
  created_at = '2014-03-01 00:00:00'::timestamp,
  updated_at = '2014-03-01 00:00:00'::timestamp
WHERE EXTRACT(YEAR FROM p.created_at) >= 2025
  AND p.source = 'staging_axanar_paypal'
  AND p.amount > 0;
