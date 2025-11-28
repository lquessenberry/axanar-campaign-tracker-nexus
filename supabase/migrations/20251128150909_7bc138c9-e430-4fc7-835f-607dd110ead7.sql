
-- Add address for Jon Westbrook (jwstbrk@aol.com)
INSERT INTO addresses (
  donor_id,
  address1,
  city,
  state,
  postal_code,
  country,
  is_primary
)
VALUES (
  'bf23f0b8-a8f4-4608-a24c-6dd688f344b2',
  '897 Avery St',
  'South Windsor',
  'CT',
  '06074',
  'United States',
  true
)
ON CONFLICT DO NOTHING;
