import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CAMPAIGN_IDS = {
  PRELUDE_KS: '80e3b1cb-9eb8-4f7e-bb39-765c7b498557',
  AXANAR_KS: '7abcf9b1-d9b8-440a-808c-3a7aa7c04383',
  AXANAR_IGG: 'be6e31c9-75d2-435a-9c89-9aa30187fd27'
};

const PRELUDE_REWARDS = [
  { name: 'Crewman', platform: 'Crewman', desc: 'Backers page, poster, donor site', amt: 10, backers: 30, physical: true, ship: false },
  { name: 'Crewman First Class', platform: 'Crewman First Class', desc: 'Prelude download', amt: 15, backers: 609, physical: false, ship: false },
  { name: 'Ensign', platform: 'Ensign', desc: 'Illustrated script', amt: 20, backers: 207, physical: false, ship: false },
  { name: 'Lieutenant Jr. Grade', platform: 'Lieutenant Jr. Grade', desc: 'Ares patch', amt: 25, backers: 350, physical: true, ship: true },
  { name: 'Lieutenant', platform: 'Lieutenant', desc: 'Soundtrack CD', amt: 35, backers: 76, physical: true, ship: true },
  { name: 'Second Lieutenant', platform: 'Second Lieutenant', desc: 'DVD or Blu-Ray +$10', amt: 50, backers: 411, physical: true, ship: true },
  { name: 'Lieutenant Commander', platform: 'Lieutenant Commander', desc: 'Ltd Ed Axanar poster', amt: 75, backers: 73, physical: true, ship: true },
  { name: 'Commander', platform: 'Commander', desc: 'Ares T-shirt', amt: 100, backers: 269, physical: true, ship: true },
  { name: 'Starfleet Tunic', platform: 'Starfleet Tunic', desc: 'Starfleet tunic', amt: 300, backers: 5, physical: true, ship: true },
  { name: 'Fleet Captain', platform: 'Fleet Captain', desc: 'All rewards + tunic', amt: 400, backers: 37, physical: true, ship: true }
];

const AXANAR_KS_REWARDS = [
  { name: 'Backers Page', platform: null, desc: 'Backers page', amt: 10, backers: 467, physical: false, ship: false },
  { name: 'Script in PDF', platform: null, desc: 'Script in PDF', amt: 15, backers: 56, physical: false, ship: false },
  { name: 'Illustrated Script', platform: null, desc: 'Illustrated script/PDF', amt: 20, backers: 96, physical: false, ship: false },
  { name: 'Download Axanar', platform: null, desc: 'Download Axanar', amt: 25, backers: 2565, physical: false, ship: false },
  { name: 'Prelude Premiere Program', platform: null, desc: 'Prelude premiere program', amt: 30, backers: 232, physical: true, ship: true },
  { name: 'Starfleet First Fleet Patch', platform: null, desc: 'Starfleet First Fleet Patch', amt: 35, backers: 811, physical: true, ship: true },
  { name: 'Ares Challenge Coin', platform: null, desc: 'Ares challenge coin', amt: 50, backers: 209, physical: true, ship: true },
  { name: 'Axanar DVD', platform: null, desc: 'Axanar DVD', amt: 65, backers: 631, physical: true, ship: true },
  { name: 'Axanar Blu-ray', platform: null, desc: 'Axanar Blu-ray', amt: 75, backers: 2052, physical: true, ship: true },
  { name: 'Signed Cast Photo', platform: null, desc: 'Signed ltd. ed. cast photo', amt: 100, backers: 475, physical: true, ship: true },
  { name: 'Black Ares T-shirt', platform: null, desc: 'Ltd. ed. black Ares T-shirt', amt: 125, backers: 384, physical: true, ship: true },
  { name: 'Signed Bound Script', platform: null, desc: 'Signed, bound script/Gerrold', amt: 200, backers: 77, physical: true, ship: true },
  { name: 'Casualty List', platform: null, desc: 'Name onscreen casualty list', amt: 250, backers: 50, physical: false, ship: false },
  { name: 'Combined Collector Pack', platform: null, desc: 'Combined $100 & $200 lvls.', amt: 350, backers: 100, physical: true, ship: true },
  { name: 'Ares Uniform Tunic', platform: null, desc: 'Ares uniform tunic', amt: 400, backers: 31, physical: true, ship: true },
  { name: 'Full Cast Signed Photo', platform: null, desc: 'Cast photo signed by all cast', amt: 500, backers: 12, physical: true, ship: true },
  { name: 'Set Visit', platform: null, desc: 'Set visit & cast/crew meal', amt: 2000, backers: 3, physical: false, ship: false },
  { name: 'Production Assistant', platform: null, desc: 'On set prod. asst.', amt: 2500, backers: 4, physical: false, ship: false },
  { name: 'Name Starfleet Ship', platform: null, desc: 'Name onscreen Starfleet ship', amt: 5000, backers: 5, physical: false, ship: false },
  { name: 'Featured Extra', platform: null, desc: 'Featured extra onscreen', amt: 5000, backers: 5, physical: false, ship: false },
  { name: 'Extra at Starfleet HQ', platform: null, desc: 'Extra at Starfleet HQ', amt: 5000, backers: 3, physical: false, ship: false },
  { name: 'Producer on Set', platform: null, desc: 'Work as producer on set', amt: 10000, backers: 4, physical: false, ship: false }
];

const AXANAR_IGG_REWARDS = [
  { name: 'Foundation Donor Package', platform: 'Foundation Donor Package', desc: 'Backers pg, donors store', amt: 10, backers: 398, physical: false, ship: false },
  { name: 'Axanar Scripts', platform: 'Axanar Scripts', desc: 'Prelude & Axa scripts', amt: 15, backers: 44, physical: false, ship: false },
  { name: 'Axanar Illustrated Scripts', platform: 'Axanar Illustrated Scripts', desc: 'Axanar illustrated script', amt: 20, backers: 114, physical: false, ship: false },
  { name: 'Axanar Digital Download', platform: 'Axanar Digital Download', desc: 'Axanar download', amt: 25, backers: 2198, physical: false, ship: false },
  { name: 'Digital Bits Special', platform: 'Digital Bits Special', desc: 'Digital Bits Special', amt: 30, backers: 29, physical: false, ship: false },
  { name: 'Fourth Fleet Patch', platform: 'Fourth Fleet Patch', desc: 'Fourth Fleet patch', amt: 35, backers: 414, physical: true, ship: true },
  { name: 'Sonja & Sam Patches', platform: 'Sonja & Sam Patches', desc: 'Ajax/Hercules patches', amt: 50, backers: 354, physical: true, ship: true },
  { name: 'Axanar Soundtrack CD', platform: 'Axanar Soundtrack CD', desc: 'Axanar soundtrack', amt: 60, backers: 249, physical: true, ship: true },
  { name: 'Axanar First Day Crew Badge', platform: 'Axanar First Day Crew Badge', desc: '1st Day patch, signed', amt: 75, backers: 50, physical: true, ship: true },
  { name: 'Axanar Blu-ray', platform: 'Axanar Blu-ray', desc: 'Axanar Blu-ray', amt: 75, backers: 1030, physical: true, ship: true },
  { name: 'Axanar Signed Crew Badge', platform: 'Axanar Signed Crew Badge', desc: 'Signed crew badge', amt: 75, backers: 109, physical: true, ship: true },
  { name: 'Cast Member Signed Photo', platform: 'Cast Member Signed Photo', desc: 'Cast signed photo', amt: 100, backers: 80, physical: true, ship: true },
  { name: 'Ultimate Patch Collection', platform: 'Ultimate Patch Collection', desc: 'Ultimate patch collection', amt: 100, backers: 363, physical: true, ship: true },
  { name: 'Axanar T-Shirt', platform: 'Axanar T-Shirt', desc: 'Axanar T-shirt', amt: 125, backers: 146, physical: true, ship: true },
  { name: 'Axanar Deluxe Blu-ray Set', platform: 'Axanar Deluxe Blu-ray Set', desc: 'Axanar deluxe Blu-ray', amt: 150, backers: 875, physical: true, ship: true },
  { name: 'Bound, Signed Script', platform: 'Bound, Signed Script', desc: 'Bound, signed script', amt: 200, backers: 44, physical: true, ship: true },
  { name: 'Voicemail Greeting', platform: 'Voicemail Greeting', desc: 'Actor voicemail greeting', amt: 350, backers: 4, physical: false, ship: false },
  { name: 'Starfleet Cadet Jumpsuit', platform: 'Starfleet Cadet Jumpsuit', desc: 'Starfleet cadet jumpsuit', amt: 400, backers: 2, physical: true, ship: true },
  { name: 'Cast Signed Photo', platform: 'Cast Signed Photo', desc: 'All cast signed photo', amt: 500, backers: 12, physical: true, ship: true },
  { name: 'Lunch with Kharn and Garth!', platform: 'Lunch with Kharn and Garth!', desc: 'Lunch, Kharn & Garth', amt: 500, backers: 10, physical: false, ship: false },
  { name: 'USS Ares Tunic', platform: 'USS Ares Tunic', desc: 'Ares tunic', amt: 600, backers: 8, physical: true, ship: true },
  { name: 'First Day Production Clapper', platform: 'First Day Production Clapper', desc: '1st Day clapper', amt: 1000, backers: 5, physical: true, ship: true },
  { name: 'USS Ares Dedication Plaque', platform: 'USS Ares Dedication Plaque', desc: 'Ares dedication plaque', amt: 1500, backers: 2, physical: true, ship: true },
  { name: 'Set Visit', platform: 'Set Visit', desc: 'Set visit, meal w/cast', amt: 2000, backers: 4, physical: false, ship: false },
  { name: 'Be a Production Assistant', platform: 'Be a Production Assistant', desc: 'Prod. Asst. for 1 week', amt: 2500, backers: 6, physical: false, ship: false },
  { name: 'The Ultimate Collectors Pack', platform: 'The Ultimate Collectors Pack', desc: 'Ultimate collectors pack', amt: 4000, backers: 1, physical: true, ship: true },
  { name: 'Be an Extra in Axanar', platform: 'Be an Extra in Axanar', desc: 'Extra in Axanar', amt: 5000, backers: 3, physical: false, ship: false },
  { name: 'Associate Producer Upgrade', platform: 'Associate Producer Upgrade', desc: 'Assoc Producer upgrade', amt: 5000, backers: 1, physical: false, ship: false },
  { name: 'Be an Associate Producer', platform: 'Be an Associate Producer', desc: 'Associate Producer', amt: 10000, backers: 3, physical: false, ship: false }
];

async function main() {
  console.log('🚀 Creating canonical campaign rewards...\n');

  // Add columns
  const { error: alterError } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE rewards ADD COLUMN IF NOT EXISTS platform_perk_name TEXT;
      ALTER TABLE rewards ADD COLUMN IF NOT EXISTS expected_backers INTEGER;
    `
  });

  // Clear existing pledges reward links
  console.log('Clearing pledge reward links...');
  await supabase.from('pledges').update({ reward_id: null }).in('campaign_id', Object.values(CAMPAIGN_IDS));

  // Delete old rewards
  console.log('Deleting old reward records...');
  await supabase.from('rewards').delete().in('campaign_id', Object.values(CAMPAIGN_IDS));

  // Insert Prelude rewards
  console.log(`\n📦 Inserting ${PRELUDE_REWARDS.length} Prelude to Axanar rewards...`);
  for (const r of PRELUDE_REWARDS) {
    const { error } = await supabase.from('rewards').insert({
      campaign_id: CAMPAIGN_IDS.PRELUDE_KS,
      name: r.name,
      platform_perk_name: r.platform,
      description: r.desc,
      minimum_amount: r.amt,
      expected_backers: r.backers,
      is_physical: r.physical,
      requires_shipping: r.ship
    });
    if (error) console.error(`Error: ${r.name}`, error.message);
  }

  // Insert Axanar KS rewards
  console.log(`\n📦 Inserting ${AXANAR_KS_REWARDS.length} Axanar Kickstarter rewards...`);
  for (const r of AXANAR_KS_REWARDS) {
    const { error } = await supabase.from('rewards').insert({
      campaign_id: CAMPAIGN_IDS.AXANAR_KS,
      name: r.name,
      platform_perk_name: r.platform,
      description: r.desc,
      minimum_amount: r.amt,
      expected_backers: r.backers,
      is_physical: r.physical,
      requires_shipping: r.ship
    });
    if (error) console.error(`Error: ${r.name}`, error.message);
  }

  // Insert Axanar IGG rewards
  console.log(`\n📦 Inserting ${AXANAR_IGG_REWARDS.length} Axanar Indiegogo rewards...`);
  for (const r of AXANAR_IGG_REWARDS) {
    const { error } = await supabase.from('rewards').insert({
      campaign_id: CAMPAIGN_IDS.AXANAR_IGG,
      name: r.name,
      platform_perk_name: r.platform,
      description: r.desc,
      minimum_amount: r.amt,
      expected_backers: r.backers,
      is_physical: r.physical,
      requires_shipping: r.ship
    });
    if (error) console.error(`Error: ${r.name}`, error.message);
  }

  console.log('\n✅ Canonical rewards database created!');
}

main();
