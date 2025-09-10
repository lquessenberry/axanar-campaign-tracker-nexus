-- Continue corrections: Fix provider field and investigate pledge assignments

-- 1. Fix the missing provider for "Star Trek: Axanar" (should be Kickstarter = '1')
UPDATE campaigns 
SET provider = '1' 
WHERE name = 'Star Trek: Axanar' 
  AND (provider IS NULL OR provider = '');

-- 2. Check for pledges that may be incorrectly assigned based on source data
-- Look for pledges that might belong to different campaigns based on amount patterns

-- Get summary of current pledge distribution by campaign
SELECT 
  c.name,
  c.provider,
  COUNT(p.id) as pledge_count,
  SUM(p.amount) as total_amount,
  MIN(p.amount) as min_amount,
  MAX(p.amount) as max_amount,
  AVG(p.amount) as avg_amount
FROM campaigns c
LEFT JOIN pledges p ON c.id = p.campaign_id
WHERE c.name ILIKE '%axanar%'
GROUP BY c.id, c.name, c.provider
ORDER BY c.name;