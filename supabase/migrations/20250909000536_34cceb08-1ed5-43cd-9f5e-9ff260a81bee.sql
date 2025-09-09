-- Update all Axanar campaigns with historically accurate dates based on research

-- Update Prelude to Axanar campaign
UPDATE campaigns 
SET 
  name = 'Star Trek: Prelude to Axanar',
  start_date = '2014-03-01',
  end_date = '2014-03-31'
WHERE id = '80e3b1cb-9eb8-4f7e-bb39-765c7b498557';

-- Update Star Trek: Axanar Kickstarter campaign  
UPDATE campaigns 
SET 
  name = 'Star Trek: Axanar',
  start_date = '2014-07-25',
  end_date = '2014-08-24'
WHERE id = '7abcf9b1-d9b8-440a-808c-3a7aa7c04383';

-- Update Axanar Indiegogo campaign
UPDATE campaigns 
SET 
  name = 'Axanar (Indiegogo)',
  start_date = '2015-07-09',
  end_date = '2016-01-09'
WHERE name LIKE '%Indiegogo%' OR provider = '2';