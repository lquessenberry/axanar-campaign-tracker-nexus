-- Fix pledge dates by copying source_contribution_date from donors table
-- This migration addresses the issue where 96.6% of pledges have null created_at values

-- First, let's update pledges with null created_at using the donor's source_contribution_date
UPDATE pledges 
SET created_at = d.source_contribution_date,
    updated_at = now()
FROM donors d 
WHERE pledges.donor_id = d.id 
  AND pledges.created_at IS NULL 
  AND d.source_contribution_date IS NOT NULL
  AND d.source_contribution_date > '1970-01-01'::date; -- Avoid epoch dates

-- For pledges that still don't have dates, use a reasonable fallback based on campaign dates
UPDATE pledges 
SET created_at = COALESCE(
    c.start_date::timestamp with time zone,
    c.created_at,
    '2014-01-01 00:00:00+00'::timestamp with time zone -- Reasonable fallback for historical data
  ),
  updated_at = now()
FROM campaigns c
WHERE pledges.campaign_id = c.id 
  AND pledges.created_at IS NULL;

-- Update any remaining null created_at with the donor's created_at as a last resort
UPDATE pledges 
SET created_at = COALESCE(d.created_at, '2014-01-01 00:00:00+00'::timestamp with time zone),
    updated_at = now()
FROM donors d 
WHERE pledges.donor_id = d.id 
  AND pledges.created_at IS NULL;

-- Add a constraint to prevent future null created_at values (optional safeguard)
ALTER TABLE pledges ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE pledges ALTER COLUMN created_at SET DEFAULT now();

-- Create an index on created_at for better query performance
CREATE INDEX IF NOT EXISTS idx_pledges_created_at ON pledges(created_at);

-- Update statistics to reflect the changes
ANALYZE pledges;