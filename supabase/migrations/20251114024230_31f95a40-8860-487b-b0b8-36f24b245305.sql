-- Fix broken Kickstarter URLs
UPDATE campaigns 
SET web_url = 'https://www.kickstarter.com/projects/194429923/star-trek-prelude-to-axanar'
WHERE name = 'Star Trek: Prelude to Axanar' 
  AND provider = 'Kickstarter';

UPDATE campaigns 
SET web_url = 'https://www.kickstarter.com/projects/194429923/star-trek-axanar'
WHERE name = 'Star Trek: Axanar' 
  AND provider = 'Kickstarter';