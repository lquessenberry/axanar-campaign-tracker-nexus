
-- Retroactive assignment: Link Olaf's $90 pledge to Axanar Kickstarter campaign
UPDATE pledges
SET 
  campaign_id = '7abcf9b1-d9b8-440a-808c-3a7aa7c04383',
  source = 'retroactive_assignment'
WHERE id = 'b6a87cd4-9df3-4386-81ad-b6a417d66c61';

-- Update Olaf's donor record with proper name
UPDATE donors
SET 
  full_name = 'Olaf Kievit',
  updated_at = now()
WHERE id = '97218699-775a-4723-8129-e5333452f738';

-- Verify updates
SELECT 
  d.email,
  d.full_name,
  p.amount,
  c.name as campaign_name,
  p.source,
  p.created_at as pledge_date
FROM donors d
LEFT JOIN pledges p ON p.donor_id = d.id
LEFT JOIN campaigns c ON p.campaign_id = c.id
WHERE d.id = '97218699-775a-4723-8129-e5333452f738';
