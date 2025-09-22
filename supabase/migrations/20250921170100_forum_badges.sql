-- Forum badges foundation (namespaced to avoid collisions)
-- Creates: forum_badges, forum_user_badges, RLS policies, and a backfill function
-- Safe to run multiple times due to IF NOT EXISTS and ON CONFLICT safeguards

begin;

-- Ensure uuid generation is available
create extension if not exists pgcrypto;

-- Utility: slugify helper
create or replace function forum_slugify(src text)
returns text
language sql
immutable
returns null on null input
as $$
  select
    regexp_replace(lower(trim(src)), '[^a-z0-9]+', '-', 'g')
$$;

-- Badges catalog
create table if not exists public.forum_badges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  description text,
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User <-> Badge awards
create table if not exists public.forum_user_badges (
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id uuid not null references public.forum_badges(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  source text default 'backfill',
  ref_table text,
  ref_id uuid,
  primary key (user_id, badge_id)
);

-- RLS
alter table public.forum_badges enable row level security;
alter table public.forum_user_badges enable row level security;

-- Public read of badge catalog
drop policy if exists forum_badges_public_select on public.forum_badges;
create policy forum_badges_public_select
on public.forum_badges
for select
using (true);

-- Service role manages catalog writes
drop policy if exists forum_badges_service_write on public.forum_badges;
create policy forum_badges_service_write
on public.forum_badges
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- Owners can read their own earned badges
drop policy if exists forum_user_badges_owner_select on public.forum_user_badges;
create policy forum_user_badges_owner_select
on public.forum_user_badges
for select
using (auth.uid() = user_id);

-- Service role manages awards
drop policy if exists forum_user_badges_service_write on public.forum_user_badges;
create policy forum_user_badges_service_write
on public.forum_user_badges
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- Ranks catalog (Pike-to-Kirk era officer progression)
create table if not exists public.forum_ranks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  min_points integer not null default 0,
  sort_order integer not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.forum_ranks enable row level security;

-- Public read of ranks
drop policy if exists forum_ranks_public_select on public.forum_ranks;
create policy forum_ranks_public_select
on public.forum_ranks
for select
using (true);

-- Service role manages rank catalog
drop policy if exists forum_ranks_service_write on public.forum_ranks;
create policy forum_ranks_service_write
on public.forum_ranks
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- Effective user rank (one per user)
create table if not exists public.forum_user_ranks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  rank_id uuid not null references public.forum_ranks(id) on delete restrict,
  set_by text default 'system',
  updated_at timestamptz not null default now()
);

alter table public.forum_user_ranks enable row level security;

-- Public can read ranks so profiles can display them
drop policy if exists forum_user_ranks_public_select on public.forum_user_ranks;
create policy forum_user_ranks_public_select
on public.forum_user_ranks
for select
using (true);

-- Service role manages writes
drop policy if exists forum_user_ranks_service_write on public.forum_user_ranks;
create policy forum_user_ranks_service_write
on public.forum_user_ranks
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- Helper: touch updated_at
create or replace function public.forum_touch_user_rank()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists forum_tg_touch_user_rank on public.forum_user_ranks;
create trigger forum_tg_touch_user_rank
before update on public.forum_user_ranks
for each row
execute procedure public.forum_touch_user_rank();

-- Seed canonical TOS-era officer ranks with thresholds
insert into public.forum_ranks (slug, name, min_points, sort_order, description)
values
  ('cadet','Cadet',0,10,'Entry rank for new members.'),
  ('able-seaman','Able Seaman',200,15,'Eligible to upvote posts.'),
  ('senior-chief-petty-officer','Senior Chief Petty Officer',3000,18,'Beta feature access.'),
  ('ensign','Ensign',5000,20,'Junior officer; gains basic forum privileges.'),
  ('lieutenant-junior-grade','Lieutenant Junior Grade',7000,30,'Developing officer with added capabilities.'),
  ('lieutenant','Lieutenant',9000,40,'Seasoned officer with greater responsibilities.'),
  ('lieutenant-commander','Lieutenant Commander',12000,50,'Senior officer; moderation eligibility begins.'),
  ('commander','Commander',15000,60,'Executive-level officer; leads initiatives.'),
  ('captain','Captain',20000,70,'Section lead; full moderation authority.'),
  ('fleet-captain','Fleet Captain',25000,80,'Coordinates multi-section efforts.'),
  ('commodore','Commodore',30000,90,'Senior leadership across forums.'),
  ('rear-admiral','Rear Admiral',40000,100,'Flag officer; strategic oversight.'),
  ('vice-admiral','Vice Admiral',50000,110,'High command; analytics access.'),
  ('admiral','Admiral',75000,120,'Top leadership; policy influence.'),
  ('fleet-admiral','Fleet Admiral',100000,130,'Highest honor; custom titles.')
on conflict (slug) do nothing;

-- Seed a curated set of retroactive badges derived from legacy rewards/perks
-- Slugs are derived via forum_slugify for consistency
insert into public.forum_badges (slug, label, description, icon)
values
  ('axanar-illustrated-scripts','AXANAR ILLUSTRATED SCRIPTS','Retroactive badge from legacy Axanar campaigns.','script'),
  ('axanar-blu-ray','AXANAR BLU-RAY','Retroactive badge from legacy Axanar campaigns.','disc'),
  ('axanar-deluxe-blu-ray-set','AXANAR DELUXE BLU-RAY SET','Retroactive badge from legacy Axanar campaigns.','disc'),
  ('fourth-fleet-patch','FOURTH FLEET PATCH','Retroactive badge from legacy Axanar campaigns.','patch'),
  ('ultimate-patch-collection','ULTIMATE PATCH COLLECTION','Retroactive badge from legacy Axanar campaigns.','patch'),
  ('sonya-sam-ship-patches','SONYA & SAM SHIP PATCHES','Retroactive badge from legacy Axanar campaigns.','patch'),
  ('axanar-soundtrack-cd','AXANAR SOUNDTRACK CD','Retroactive badge from legacy Axanar campaigns.','music'),
  ('digital-bits-special','Digital Bits Special','Retroactive badge from legacy Axanar campaigns.','star'),
  ('axanar-t-shirt','AXANAR T-SHIRT','Retroactive badge from legacy Axanar campaigns.','tshirt'),
  ('bound-signed-script','BOUND SIGNED SCRIPT','Retroactive badge from legacy Axanar campaigns.','pen'),
  ('axanar-scripts','AXANAR SCRIPTS','Retroactive badge from legacy Axanar campaigns.','script'),
  ('cast-signed-photo','CAST SIGNED PHOTO','Retroactive badge from legacy Axanar campaigns.','camera'),
  ('first-day-production-clapper','First Day Production Clapper','Retroactive badge from legacy Axanar campaigns.','clapperboard'),
  ('uss-ares-tunic','USS ARES TUNIC','Retroactive badge from legacy Axanar campaigns.','shirt'),
  ('be-a-production-assistant','BE A PRODUCTION ASSISTANT','Retroactive badge from legacy Axanar campaigns.','wrench'),
  ('voicemail-greeting','VOICEMAIL GREETING','Retroactive badge from legacy Axanar campaigns.','phone'),
  ('be-an-extra-in-axanar','BE AN EXTRA IN AXANAR','Retroactive badge from legacy Axanar campaigns.','user'),
  ('be-an-associate-producer','BE AN ASSOCIATE PRODUCER','Retroactive badge from legacy Axanar campaigns.','briefcase'),
  ('starfleet-cadet-jumpsuit','STARFLEET CADET JUMPSUIT','Retroactive badge from legacy Axanar campaigns.','shield'),
  ('the-ultimate-collectors-pack','The Ultimate Collectors Pack','Retroactive badge from legacy Axanar campaigns.','award'),
  ('axanar-digital-download','AXANAR DIGITAL DOWNLOAD','Retroactive badge from legacy Axanar campaigns.','download'),
  ('axanar-first-day-crew-badge','AXANAR FIRST DAY CREW BADGE','Retroactive badge from legacy Axanar campaigns.','id-card'),
  ('axanar-signed-crew-badge','Axanar Signed Crew Badge','Retroactive badge from legacy Axanar campaigns.','id-card'),
  ('secret-perk-1','Secret Perk #1','Retroactive badge from legacy Axanar campaigns.','gift'),
  ('secret-perk-2','Secret Perk #2','Retroactive badge from legacy Axanar campaigns.','gift'),
  ('secret-perk-3','Secret Perk #3','Retroactive badge from legacy Axanar campaigns.','gift')
on conflict (slug) do nothing;

-- Curated Prelude to Axanar reward titles as distinct badges (ensures iconography)
insert into public.forum_badges (slug, label, description, icon)
values
  ('crewman-first-class','Crewman First Class','Prelude to Axanar supporter tier.','rank'),
  ('second-lieutenant','Second Lieutenant','Prelude to Axanar supporter tier.','rank'),
  ('lieutenant-jr-grade','Lieutenant Jr. Grade','Prelude to Axanar supporter tier.','rank'),
  ('commander','Commander','Prelude to Axanar supporter tier.','rank'),
  ('ensign','Ensign','Prelude to Axanar supporter tier.','rank'),
  ('lieutenant','Lieutenant','Prelude to Axanar supporter tier.','rank'),
  ('lieutenant-commander','Lieutenant Commander','Prelude to Axanar supporter tier.','rank'),
  ('fleet-captain','Fleet Captain','Prelude to Axanar supporter tier.','rank'),
  ('crewman','Crewman','Prelude to Axanar supporter tier.','rank'),
  ('starfleet-tunic','Starfleet Tunic','Prelude to Axanar uniform reward.','uniform')
on conflict (slug) do nothing;

-- Dynamically seed additional badges from existing data sources
-- 1) Rewards table (filter numeric-only and nullish markers)
insert into public.forum_badges (slug, label, description, icon)
select distinct forum_slugify(r.name) as slug,
       r.name as label,
       'Retroactive badge from legacy Axanar campaigns.' as description,
       'gift' as icon
from public.rewards r
where r.name is not null and btrim(r.name) <> '' and r.name <> '\\N' and r.name !~ '^[0-9]+$'
on conflict (slug) do nothing;

-- 2) Prelude to Axanar Kickstarter staging
insert into public.forum_badges (slug, label, description, icon)
select distinct forum_slugify(spk.reward_name) as slug,
       spk.reward_name as label,
       'Prelude to Axanar reward badge.' as description,
       'award' as icon
from public.staging_prelude_kickstarter spk
where spk.reward_name is not null and btrim(spk.reward_name) <> '' and spk.reward_name <> '\\N' and spk.reward_name !~ '^[0-9]+$'
on conflict (slug) do nothing;

-- 3) Axanar Kickstarter staging (if present)
insert into public.forum_badges (slug, label, description, icon)
select distinct forum_slugify(sak.reward_name) as slug,
       sak.reward_name as label,
       'Axanar Kickstarter reward badge.' as description,
       'award' as icon
from public.staging_axanar_kickstarter sak
where sak.reward_name is not null and btrim(sak.reward_name) <> '' and sak.reward_name <> '\\N' and sak.reward_name !~ '^[0-9]+$'
on conflict (slug) do nothing;

-- 4) Prelude PayPal staging (if present)
insert into public.forum_badges (slug, label, description, icon)
select distinct forum_slugify(spp.reward_name) as slug,
       spp.reward_name as label,
       'Prelude (PayPal) reward badge.' as description,
       'award' as icon
from public.staging_prelude_paypal spp
where spp.reward_name is not null and btrim(spp.reward_name) <> '' and spp.reward_name <> '\\N' and spp.reward_name !~ '^[0-9]+$'
on conflict (slug) do nothing;


-- Backfill function to award badges based on historical pledges and secret perks
create or replace function public.forum_backfill_badges_from_rewards()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Award for rewards (pledges joined to rewards)
  insert into public.forum_user_badges (user_id, badge_id, source, ref_table, ref_id)
  select distinct au.id as user_id,
                  fb.id as badge_id,
                  'backfill_rewards' as source,
                  'rewards' as ref_table,
                  r.id as ref_id
  from public.donors d
  join auth.users au on au.id = d.auth_user_id
  join public.pledges p on p.donor_id = d.id
  join public.rewards r on r.id = p.reward_id
  join public.forum_badges fb on fb.slug = forum_slugify(r.name)
  where d.auth_user_id is not null
  on conflict do nothing;

  -- Award for secret perks staging (email-based)
  insert into public.forum_user_badges (user_id, badge_id, source, ref_table)
  select distinct au.id as user_id,
                  fb.id as badge_id,
                  'backfill_secret_perks' as source,
                  'staging_secret_perks' as ref_table
  from public.staging_secret_perks s
  join public.donors d on lower(d.email) = lower(s.email)
  join auth.users au on au.id = d.auth_user_id
  join public.forum_badges fb on fb.slug = forum_slugify(s.perk_label)
  on conflict do nothing;

  -- Award for Prelude to Axanar Kickstarter reward names (email-match)
  insert into public.forum_user_badges (user_id, badge_id, source, ref_table)
  select distinct au.id as user_id,
                  fb.id as badge_id,
                  'backfill_prelude_kickstarter' as source,
                  'staging_prelude_kickstarter' as ref_table
  from public.staging_prelude_kickstarter spk
  join public.donors d on lower(d.email) = lower(spk.email)
  join auth.users au on au.id = d.auth_user_id
  join public.forum_badges fb on fb.slug = forum_slugify(spk.reward_name)
  where spk.reward_name is not null and btrim(spk.reward_name) <> '' and spk.reward_name <> '\\N' and spk.reward_name !~ '^[0-9]+$'
  on conflict do nothing;

  -- Award for Axanar Kickstarter staging (email-match)
  insert into public.forum_user_badges (user_id, badge_id, source, ref_table)
  select distinct au.id as user_id,
                  fb.id as badge_id,
                  'backfill_axanar_kickstarter' as source,
                  'staging_axanar_kickstarter' as ref_table
  from public.staging_axanar_kickstarter sak
  join public.donors d on lower(d.email) = lower(sak.email)
  join auth.users au on au.id = d.auth_user_id
  join public.forum_badges fb on fb.slug = forum_slugify(sak.reward_name)
  where sak.reward_name is not null and btrim(sak.reward_name) <> '' and sak.reward_name <> '\\N' and sak.reward_name !~ '^[0-9]+$'
  on conflict do nothing;

  -- Award for Prelude PayPal staging (email-match)
  insert into public.forum_user_badges (user_id, badge_id, source, ref_table)
  select distinct au.id as user_id,
                  fb.id as badge_id,
                  'backfill_prelude_paypal' as source,
                  'staging_prelude_paypal' as ref_table
  from public.staging_prelude_paypal spp
  join public.donors d on lower(d.email) = lower(spp.email)
  join auth.users au on au.id = d.auth_user_id
  join public.forum_badges fb on fb.slug = forum_slugify(spp.reward_name)
  where spp.reward_name is not null and btrim(spp.reward_name) <> '' and spp.reward_name <> '\\N' and spp.reward_name !~ '^[0-9]+$'
  on conflict do nothing;

  -- Award for Axanar PayPal staging (email-match)
  insert into public.forum_user_badges (user_id, badge_id, source, ref_table)
  select distinct au.id as user_id,
                  fb.id as badge_id,
                  'backfill_axanar_paypal' as source,
                  'staging_axanar_paypal' as ref_table
  from public.staging_axanar_paypal sap
  join public.donors d on lower(d.email) = lower(sap.email)
  join auth.users au on au.id = d.auth_user_id
  join public.forum_badges fb on fb.slug = forum_slugify(sap.reward_name)
  where sap.reward_name is not null and btrim(sap.reward_name) <> '' and sap.reward_name <> '\\N' and sap.reward_name !~ '^[0-9]+$'
  on conflict do nothing;

end;
$$;

-- Sync admin users to Fleet Admiral forum rank
create or replace function public.forum_sync_admin_ranks()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  fleet_admiral_id uuid;
begin
  select id into fleet_admiral_id from public.forum_ranks where slug = 'fleet-admiral';
  if fleet_admiral_id is null then
    raise exception 'fleet-admiral rank missing in forum_ranks';
  end if;

  insert into public.forum_user_ranks (user_id, rank_id, set_by)
  select au.user_id, fleet_admiral_id, 'admin_sync'
  from public.admin_users au
  on conflict (user_id) do update set rank_id = excluded.rank_id, set_by = excluded.set_by, updated_at = now();
end;
$$;

commit;
