
-- Create missing Axanar reward tiers based on import file XLS list structure
-- These tiers were identified from donor import files but are missing from the rewards table

-- Campaign ID for Axanar (Indiegogo): be6e31c9-75d2-435a-9c89-9aa30187fd27

-- Missing $65 tier (212 donors from "Axanar #1 - $65 List.xls")
INSERT INTO rewards (campaign_id, name, minimum_amount, description, is_physical, requires_shipping)
VALUES (
  'be6e31c9-75d2-435a-9c89-9aa30187fd27',
  'Secret Perk #65',
  65.00,
  'Historical reward tier from Axanar Indiegogo campaign',
  true,
  true
);

-- Missing $125 tier (154 donors from "Axanar #1 - $125 List.xls")
INSERT INTO rewards (campaign_id, name, minimum_amount, description, is_physical, requires_shipping)
VALUES (
  'be6e31c9-75d2-435a-9c89-9aa30187fd27',
  'Secret Perk #125',
  125.00,
  'Historical reward tier from Axanar Indiegogo campaign',
  true,
  true
);

-- Missing $250 tier (13 donors from "Axanar #1 - $250 List.xls")
INSERT INTO rewards (campaign_id, name, minimum_amount, description, is_physical, requires_shipping)
VALUES (
  'be6e31c9-75d2-435a-9c89-9aa30187fd27',
  'Secret Perk #250',
  250.00,
  'Historical reward tier from Axanar Indiegogo campaign',
  true,
  true
);

-- Missing $350 tier (36 donors from "Axanar #1 - $350 List.xls")
INSERT INTO rewards (campaign_id, name, minimum_amount, description, is_physical, requires_shipping)
VALUES (
  'be6e31c9-75d2-435a-9c89-9aa30187fd27',
  'Secret Perk #350',
  350.00,
  'Historical reward tier from Axanar Indiegogo campaign',
  true,
  true
);

-- Missing $400 tier (14 donors from "Axanar #1 - $400 List.xls")
INSERT INTO rewards (campaign_id, name, minimum_amount, description, is_physical, requires_shipping)
VALUES (
  'be6e31c9-75d2-435a-9c89-9aa30187fd27',
  'Secret Perk #400',
  400.00,
  'Historical reward tier from Axanar Indiegogo campaign',
  true,
  true
);
