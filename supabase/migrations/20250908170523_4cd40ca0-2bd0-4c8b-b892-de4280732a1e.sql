-- Make some campaigns active so they appear in the navigation
UPDATE campaigns 
SET active = true 
WHERE id IN (
  SELECT id FROM campaigns 
  LIMIT 3
);