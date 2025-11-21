-- =====================================================
-- DAYSTROM AMBASSADORIAL TITLES: THE CANONICAL 37
-- =====================================================
-- This migration creates the complete, immutable canon of 
-- ambassadorial titles mapped to every historical perk tier.

-- First, add new columns to ambassadorial_titles table
ALTER TABLE public.ambassadorial_titles 
ADD COLUMN IF NOT EXISTS exact_perk_name TEXT,
ADD COLUMN IF NOT EXISTS tier_level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS campaign_platform TEXT,
ADD COLUMN IF NOT EXISTS is_universal BOOLEAN DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ambassadorial_titles_perk 
ON public.ambassadorial_titles(exact_perk_name, campaign_id);

CREATE INDEX IF NOT EXISTS idx_ambassadorial_titles_amount 
ON public.ambassadorial_titles(minimum_pledge_amount, campaign_id);

-- =====================================================
-- UNIVERSAL FOUNDATION CONTRIBUTOR (Tier 0)
-- =====================================================
INSERT INTO public.ambassadorial_titles (
  slug, display_name, description, campaign_id, minimum_pledge_amount,
  exact_perk_name, tier_level, campaign_platform, is_universal,
  xp_multiplier, forum_xp_bonus, participation_xp_bonus,
  color, badge_style, icon, original_rank_name
) VALUES (
  'foundation-contributor',
  'Foundation Contributor',
  'Recognized supporter of the Axanar universe. Every contribution matters.',
  NULL, 1.00, 'Any $1+ contribution', 0, 'Universal', true,
  1.0, 25, 0,
  'text-cyan-400', 'border-cyan-400/30', '🌟', 'Foundation Contributor'
) ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  is_universal = EXCLUDED.is_universal;

-- Create corresponding forum badge
INSERT INTO public.forum_badges (slug, label, description, icon)
VALUES (
  'foundation-contributor',
  'FOUNDATION CONTRIBUTOR',
  'Recognized financial supporter of Axanar ($1+)',
  'star'
) ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- PRELUDE CAMPAIGN TITLES (Tiers 1-12)
-- =====================================================

-- Get Prelude campaign ID
DO $$
DECLARE
  v_prelude_id UUID;
BEGIN
  SELECT id INTO v_prelude_id FROM public.campaigns WHERE name ILIKE '%prelude%' LIMIT 1;
  
  -- Tier 1: $1 - Digital thank-you
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'attache-gratitude',
    'Attaché of Gratitude',
    'Digital thank-you recipient from Prelude to Axanar',
    v_prelude_id, 1.00, 'Digital thank-you', 1, 'Prelude', false,
    1.0, 50, 0,
    'text-blue-300', 'border-blue-300/30', '🎖️', 'Attaché of Gratitude'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 2: $5 - Social media shout-out
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'third-secretary-accord',
    'Third Secretary of Public Accord',
    'Social media recognition from Prelude campaign',
    v_prelude_id, 5.00, 'Social media shout-out', 2, 'Prelude', false,
    1.05, 75, 0,
    'text-blue-300', 'border-blue-300/30', '📢', 'Third Secretary of Public Accord'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 3: $10 - Wallpaper pack
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'second-secretary-iconography',
    'Second Secretary of Iconography',
    'Digital wallpaper collection recipient',
    v_prelude_id, 10.00, 'Wallpaper pack', 3, 'Prelude', false,
    1.1, 100, 0,
    'text-blue-400', 'border-blue-400/30', '🖼️', 'Second Secretary of Iconography'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 4: $25 - PDF script
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'first-secretary-archives',
    'First Secretary of Narrative Archives',
    'Holder of the Prelude script',
    v_prelude_id, 25.00, 'PDF script', 4, 'Prelude', false,
    1.15, 125, 0,
    'text-blue-400', 'border-blue-400/30', '📜', 'First Secretary of Narrative Archives'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 5: $35 - Axanar patch
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'attache-fifth-fleet',
    'Attaché of the Fifth Fleet',
    'Bearer of the official Axanar patch',
    v_prelude_id, 35.00, 'Axanar patch', 5, 'Prelude', false,
    1.2, 150, 10,
    'text-blue-500', 'border-blue-500/30', '⭐', 'Attaché of the Fifth Fleet'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 6: $50 - T-shirt
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'third-secretary-uniforms',
    'Third Secretary of Uniform Accords',
    'Official Prelude apparel recipient',
    v_prelude_id, 50.00, 'T-shirt', 6, 'Prelude', false,
    1.25, 175, 15,
    'text-blue-500', 'border-blue-500/30', '👕', 'Third Secretary of Uniform Accords'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 7: $75 - Early teaser access
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'deputy-chief-teaser',
    'Deputy Chief of Mission – Teaser Protocols',
    'Early access to exclusive footage',
    v_prelude_id, 75.00, 'Early teaser access', 7, 'Prelude', false,
    1.3, 200, 20,
    'text-indigo-400', 'border-indigo-400/30', '🎬', 'Deputy Chief of Mission – Teaser Protocols'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 8: $100 - Signed digital poster
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'first-secretary-seals',
    'First Secretary of Holographic Seals',
    'Signed commemorative poster holder',
    v_prelude_id, 100.00, 'Signed digital poster', 8, 'Prelude', false,
    1.35, 250, 25,
    'text-indigo-400', 'border-indigo-400/30', '🖋️', 'First Secretary of Holographic Seals'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 9: $150 - Prelude Blu-ray/DVD
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'consul-archival-media',
    'Consul of Archival Media',
    'Prelude physical media collection',
    v_prelude_id, 150.00, 'Prelude Blu-ray/DVD', 9, 'Prelude', false,
    1.4, 300, 30,
    'text-indigo-500', 'border-indigo-500/30', '💿', 'Consul of Archival Media'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 10: $250 - Personal video from Alec Peters
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'charge-personal-envoys',
    'Chargé d''Affaires of Personal Envoys',
    'Personal video message recipient',
    v_prelude_id, 250.00, 'Personal video from Alec Peters', 10, 'Prelude', false,
    1.5, 400, 40,
    'text-purple-400', 'border-purple-400/30', '📹', 'Chargé d''Affaires of Personal Envoys'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 11: $500 - Producer credit
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'minister-production',
    'Minister-Counselor of Production',
    'Producer credit on Prelude to Axanar',
    v_prelude_id, 500.00, 'Producer credit', 11, 'Prelude', false,
    1.75, 500, 50,
    'text-purple-500', 'border-purple-500/30', '🎭', 'Minister-Counselor of Production'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 12: $1,000 - Virtual screening invite
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'ambassador-premiere',
    'Ambassador-at-Large of Premiere Protocols',
    'Virtual screening access and premiere invitation',
    v_prelude_id, 1000.00, 'Virtual screening invite', 12, 'Prelude', false,
    2.0, 750, 75,
    'text-purple-600', 'border-purple-600/30', '🎪', 'Ambassador-at-Large of Premiere Protocols'
  ) ON CONFLICT (slug) DO NOTHING;

END $$;

-- Create forum badges for all Prelude titles
INSERT INTO public.forum_badges (slug, label, description, icon)
VALUES 
  ('attache-gratitude', 'ATTACHÉ OF GRATITUDE', 'Prelude $1+ supporter', 'award'),
  ('third-secretary-accord', 'THIRD SECRETARY', 'Prelude $5+ supporter', 'megaphone'),
  ('second-secretary-iconography', 'SECOND SECRETARY', 'Prelude $10+ supporter', 'image'),
  ('first-secretary-archives', 'FIRST SECRETARY', 'Prelude $25+ supporter', 'scroll'),
  ('attache-fifth-fleet', 'FIFTH FLEET ATTACHÉ', 'Prelude $35+ supporter', 'star'),
  ('third-secretary-uniforms', 'UNIFORM SECRETARY', 'Prelude $50+ supporter', 'shirt'),
  ('deputy-chief-teaser', 'DEPUTY CHIEF', 'Prelude $75+ supporter', 'film'),
  ('first-secretary-seals', 'SEAL SECRETARY', 'Prelude $100+ supporter', 'pen-tool'),
  ('consul-archival-media', 'CONSUL OF ARCHIVES', 'Prelude $150+ supporter', 'disc'),
  ('charge-personal-envoys', 'CHARGÉ D''AFFAIRES', 'Prelude $250+ supporter', 'video'),
  ('minister-production', 'MINISTER-COUNSELOR', 'Prelude $500+ supporter', 'clapperboard'),
  ('ambassador-premiere', 'AMBASSADOR-AT-LARGE', 'Prelude $1,000+ supporter', 'trophy')
ON CONFLICT (slug) DO NOTHING;