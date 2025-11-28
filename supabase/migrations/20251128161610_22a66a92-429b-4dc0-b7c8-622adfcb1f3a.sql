
-- Reassign PayPal pledges to main campaigns so they can match against existing reward tiers
-- This migration consolidates PayPal-designated campaigns into their parent campaigns

-- Reassign "Star Trek: Axanar (PayPal)" pledges to "Axanar" (Indiegogo)
UPDATE pledges
SET campaign_id = 'be6e31c9-75d2-435a-9c89-9aa30187fd27'
WHERE campaign_id = '89b7b7e1-eb3c-46bc-a9b9-8c205acb8529';

-- Reassign "Star Trek: Prelude to Axanar (PayPal)" pledges to "Star Trek: Prelude to Axanar" (Kickstarter)
UPDATE pledges
SET campaign_id = '80e3b1cb-9eb8-4f7e-bb39-765c7b498557'
WHERE campaign_id = '26a7809d-f4ab-4531-af4a-9572c9355b59';

-- Optional: Mark PayPal campaigns as inactive since they're now consolidated
UPDATE campaigns
SET active = false
WHERE id IN ('89b7b7e1-eb3c-46bc-a9b9-8c205acb8529', '26a7809d-f4ab-4531-af4a-9572c9355b59');
