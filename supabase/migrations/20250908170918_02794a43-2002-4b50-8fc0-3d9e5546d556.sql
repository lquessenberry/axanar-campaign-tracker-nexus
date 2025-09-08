-- Update the Axanar Kickstarter campaign with historically accurate end date
-- The actual Axanar Kickstarter ran from September 24, 2014 to October 24, 2014 (30 days)
UPDATE campaigns 
SET end_date = '2014-10-24'
WHERE id = '7abcf9b1-d9b8-440a-808c-3a7aa7c04383' 
AND name = 'Star Trek: Axanar (Kickstarter)';