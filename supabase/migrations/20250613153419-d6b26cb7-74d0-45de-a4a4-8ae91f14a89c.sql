
-- Add goal_amount column to campaigns table and populate with historical data
ALTER TABLE campaigns ADD COLUMN goal_amount NUMERIC;

-- Update campaigns with their actual historical goals
-- Prelude to Axanar (Kickstarter) - March 2014 - Goal: $10,000
UPDATE campaigns 
SET goal_amount = 10000 
WHERE legacy_id = 1 AND provider = '1' AND name LIKE '%Prelude%';

-- Star Trek: Axanar (Kickstarter) - 2014 - Goal: $100,000  
UPDATE campaigns 
SET goal_amount = 100000 
WHERE legacy_id = 3 AND provider = '1' AND name LIKE '%Star Trek: Axanar%';

-- Axanar (Indiegogo) - 2015 - Goal: $330,000 (first episode target)
UPDATE campaigns 
SET goal_amount = 330000 
WHERE legacy_id = 2 AND provider = '2' AND name LIKE '%Axanar%';
