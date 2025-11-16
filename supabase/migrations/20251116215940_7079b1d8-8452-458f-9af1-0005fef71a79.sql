
-- Fix Indiegogo Axanar Campaign Rewards
-- Update minimum amounts, physical flags, and shipping requirements

-- FOUNDATION DONOR PACKAGE
UPDATE rewards 
SET minimum_amount = 10.00,
    is_physical = false,
    requires_shipping = false,
    description = 'Digital perks including forum access and exclusive content',
    estimated_ship_date = '2015-09-01'
WHERE id = 'b45df119-6954-459d-ab4a-d40276d69f0d';

-- AXANAR SCRIPTS
UPDATE rewards 
SET minimum_amount = 15.00,
    is_physical = false,
    requires_shipping = false,
    description = 'Digital PDF script',
    estimated_ship_date = '2016-08-01'
WHERE id = 'f8dd91d3-d791-4e7a-a0ef-882bd6b6e733';

-- AXANAR ILLUSTRATED SCRIPTS
UPDATE rewards 
SET minimum_amount = 20.00,
    is_physical = false,
    requires_shipping = false,
    description = 'Illustrated script PDF with photos and behind-the-scenes content',
    estimated_ship_date = '2016-08-01'
WHERE id = '4b01b155-5636-4287-b9da-6fa0010ab426';

-- AXANAR DIGITAL DOWNLOAD
UPDATE rewards 
SET minimum_amount = 25.00,
    is_physical = false,
    requires_shipping = false,
    description = 'Digital download of Axanar',
    estimated_ship_date = '2016-08-01'
WHERE id = '4d6f6d5a-0367-4e3e-8814-c7f4a1d63659';

-- Digital Bits Special
UPDATE rewards 
SET minimum_amount = 30.00,
    is_physical = false,
    requires_shipping = false,
    description = 'Special digital package',
    estimated_ship_date = '2015-11-01'
WHERE id = 'f17578a4-bf15-47ef-bf02-4af500fd12f2';

-- FOURTH FLEET PATCH
UPDATE rewards 
SET minimum_amount = 35.00,
    is_physical = true,
    requires_shipping = true,
    description = 'Embroidered Fourth Fleet patch',
    estimated_ship_date = '2016-09-01'
WHERE id = '26b1a541-90ce-4b23-a21a-438be2331492';

-- SONYA & SAM SHIP PATCHES
UPDATE rewards 
SET minimum_amount = 50.00,
    is_physical = true,
    requires_shipping = true,
    description = 'Embroidered ship patches for Sonya and Sam',
    estimated_ship_date = '2016-09-01'
WHERE id = 'c666f62e-91e9-4853-8832-09d88a6ed5fa';

-- AXANAR T-SHIRT
UPDATE rewards 
SET minimum_amount = 50.00,
    is_physical = true,
    requires_shipping = true,
    description = 'Axanar T-shirt',
    estimated_ship_date = '2016-09-01'
WHERE id = '8f635df5-dc6b-4dfd-8578-a5ef68f71f01';

-- AXANAR SOUNDTRACK CD
UPDATE rewards 
SET minimum_amount = 60.00,
    is_physical = true,
    requires_shipping = true,
    description = 'Physical soundtrack CD',
    estimated_ship_date = '2016-09-01'
WHERE id = '98fd9989-4b91-4cf0-bdd0-b900b908f958';

-- AXANAR FIRST DAY CREW BADGE
UPDATE rewards 
SET minimum_amount = 75.00,
    is_physical = true,
    requires_shipping = true,
    description = 'First day production crew badge',
    estimated_ship_date = '2016-09-01'
WHERE id = '190d131f-3d45-4f6f-8eb4-d97e37203e1a';

-- AXANAR BLU-RAY
UPDATE rewards 
SET minimum_amount = 75.00,
    is_physical = true,
    requires_shipping = true,
    description = 'Blu-ray disc of Axanar',
    estimated_ship_date = '2016-09-01'
WHERE id = 'c3b34692-c67d-44e8-870c-8f0c0f393bd5';

-- Axanar Signed Crew Badge
UPDATE rewards 
SET minimum_amount = 100.00,
    is_physical = true,
    requires_shipping = true,
    description = 'Crew badge signed by cast',
    estimated_ship_date = '2016-09-01'
WHERE id = '0f3cc0c5-d0bc-4e66-b25d-1a5921acd91b';

-- CAST MEMBER SIGNED PHOTO
UPDATE rewards 
SET minimum_amount = 100.00,
    is_physical = true,
    requires_shipping = true,
    description = 'Signed photo from cast member',
    estimated_ship_date = '2016-09-01'
WHERE id = '21053490-7812-47d0-9f1a-fadcb7fb551b';

-- ULTIMATE PATCH COLLECTION
UPDATE rewards 
SET minimum_amount = 150.00,
    is_physical = true,
    requires_shipping = true,
    description = 'Complete collection of mission patches',
    estimated_ship_date = '2016-09-01'
WHERE id = '60bc8b89-8804-444a-8442-3034e9881798';

-- STARFLEET CADET JUMPSUIT
UPDATE rewards 
SET minimum_amount = 150.00,
    is_physical = true,
    requires_shipping = true,
    description = 'Starfleet Cadet jumpsuit costume',
    estimated_ship_date = '2016-12-01'
WHERE id = 'e0aaddbf-03c1-4829-b79e-4e88899cabfa';

-- CAST SIGNED PHOTO
UPDATE rewards 
SET minimum_amount = 150.00,
    is_physical = true,
    requires_shipping = true,
    description = 'Photo signed by multiple cast members',
    estimated_ship_date = '2016-09-01'
WHERE id = '86295efe-d284-411b-8be1-3a3d4ca5683a';

-- USS ARES DEDICATION PLAQUE
UPDATE rewards 
SET minimum_amount = 150.00,
    is_physical = true,
    requires_shipping = true,
    description = 'USS Ares dedication plaque',
    estimated_ship_date = '2016-12-01'
WHERE id = '1a03c92f-10d9-40be-865c-e909b98d12d8';

-- USS ARES TUNIC
UPDATE rewards 
SET minimum_amount = 200.00,
    is_physical = true,
    requires_shipping = true,
    description = 'USS Ares uniform tunic',
    estimated_ship_date = '2016-12-01'
WHERE id = '32cbd77d-ef1c-42d8-b25b-6bd5becf4d11';

-- AXANAR DELUXE BLU-RAY SET
UPDATE rewards 
SET minimum_amount = 200.00,
    is_physical = true,
    requires_shipping = true,
    description = 'Deluxe Blu-ray set with extras',
    estimated_ship_date = '2016-12-01'
WHERE id = '404401e8-2134-4d11-903e-4cd8746031c8';

-- BOUND SIGNED SCRIPT
UPDATE rewards 
SET minimum_amount = 200.00,
    is_physical = true,
    requires_shipping = true,
    description = 'Bound and signed script book',
    estimated_ship_date = '2016-12-01'
WHERE id = 'c0cbf129-7651-4dc7-abef-7b955c14a04b';

-- First Day Production Clapper
UPDATE rewards 
SET minimum_amount = 300.00,
    is_physical = true,
    requires_shipping = true,
    description = 'First day of production clapper board',
    estimated_ship_date = '2017-01-01'
WHERE id = 'cc3019c7-4ef4-4382-96c0-9fd42dfc731c';

-- SET VISIT & MEAL W/ CAST, CREW
UPDATE rewards 
SET minimum_amount = 500.00,
    is_physical = false,
    requires_shipping = false,
    description = 'Visit the set and have a meal with cast and crew'
WHERE id = 'b4413281-5aff-4715-bc60-26a504c247b5';

-- The Ultimate Collectors Pack
UPDATE rewards 
SET minimum_amount = 500.00,
    is_physical = true,
    requires_shipping = true,
    description = 'Ultimate collectors package with multiple items',
    estimated_ship_date = '2017-03-01'
WHERE id = 'd207259a-d22f-4d19-b25a-4afe0403a603';

-- Lunch with Kharn and Garth!
UPDATE rewards 
SET minimum_amount = 1000.00,
    is_physical = false,
    requires_shipping = false,
    description = 'Have lunch with actors Kate Vernon (Kharn) and J.G. Hertzler (Garth)'
WHERE id = 'ac9eca0c-5d43-42fb-85c0-1a121dd45d36';

-- BE A PRODUCTION ASSISTANT
UPDATE rewards 
SET minimum_amount = 2000.00,
    is_physical = false,
    requires_shipping = false,
    description = 'Work as a production assistant on set for a week'
WHERE id = 'a6041f1a-ed36-4397-b929-3f3f3d34cbf5';

-- BE AN EXTRA IN AXANAR
UPDATE rewards 
SET minimum_amount = 5000.00,
    is_physical = false,
    requires_shipping = false,
    description = 'Be a featured extra in Axanar with IMDB credit'
WHERE id = '87b18952-5da0-4a63-a42b-9deba5c1632e';

-- BE AN ASSOCIATE PRODUCER
UPDATE rewards 
SET minimum_amount = 10000.00,
    is_physical = false,
    requires_shipping = false,
    description = 'Associate Producer credit'
WHERE id = 'e3b3a19b-37e0-4399-9198-eeee2c0a6e72';

-- Secret perks
UPDATE rewards 
SET minimum_amount = 100.00,
    is_physical = false,
    requires_shipping = false,
    description = 'Surprise perk'
WHERE id = '3d568360-5989-44f8-83cd-5e9de9416c3a';

UPDATE rewards 
SET minimum_amount = 100.00,
    is_physical = false,
    requires_shipping = false,
    description = 'Surprise perk'
WHERE id = '35ee7a96-4e0d-4728-8c02-40d030a387e6';

UPDATE rewards 
SET minimum_amount = 100.00,
    is_physical = false,
    requires_shipping = false,
    description = 'Surprise perk'
WHERE id = 'd1df290f-9193-43f6-95b0-9a035baf410b';
