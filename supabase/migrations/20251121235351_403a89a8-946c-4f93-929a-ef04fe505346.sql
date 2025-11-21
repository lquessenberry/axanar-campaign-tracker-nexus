-- =====================================================
-- AXANAR KICKSTARTER TITLES (Tiers 13-28)
-- =====================================================

DO $$
DECLARE
  v_axanar_id UUID;
BEGIN
  SELECT id INTO v_axanar_id FROM public.campaigns WHERE name ILIKE '%kickstarter%' OR name ILIKE '%axanar%' ORDER BY created_at LIMIT 1;
  
  -- Tier 13: $35 - Fifth Fleet patch (early bird)
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'attache-fleet-insignia',
    'Attaché of Fleet Insignia',
    'Fifth Fleet patch early bird supporter',
    v_axanar_id, 35.00, 'Fifth Fleet patch', 13, 'Kickstarter', false,
    1.2, 150, 10,
    'text-amber-400', 'border-amber-400/30', '🛡️', 'Attaché of Fleet Insignia'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 14: $50 - Digital bundle + wallpaper
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'third-secretary-bundle',
    'Third Secretary of Bundle Accords',
    'Complete digital collection recipient',
    v_axanar_id, 50.00, 'Digital bundle + wallpaper', 14, 'Kickstarter', false,
    1.25, 175, 15,
    'text-amber-400', 'border-amber-400/30', '📦', 'Third Secretary of Bundle Accords'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 15: $75 - T-shirt
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'second-secretary-uniform-diplomacy',
    'Second Secretary of Uniform Diplomacy',
    'Axanar official apparel holder',
    v_axanar_id, 75.00, 'T-shirt', 15, 'Kickstarter', false,
    1.3, 200, 20,
    'text-amber-500', 'border-amber-500/30', '👕', 'Second Secretary of Uniform Diplomacy'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 16: $100 - Poster + digital perks
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'first-secretary-poster',
    'First Secretary of Poster Protocols',
    'Official poster and digital perks collection',
    v_axanar_id, 100.00, 'Poster + digital perks', 16, 'Kickstarter', false,
    1.35, 250, 25,
    'text-amber-500', 'border-amber-500/30', '🖼️', 'First Secretary of Poster Protocols'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 17: $150 - Axanar Blu-ray/DVD
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'consul-optical-disc',
    'Consul of Optical Disc Diplomacy',
    'Axanar physical media collection',
    v_axanar_id, 150.00, 'Axanar Blu-ray/DVD', 17, 'Kickstarter', false,
    1.4, 300, 30,
    'text-orange-400', 'border-orange-400/30', '💿', 'Consul of Optical Disc Diplomacy'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 18: $250 - Silver challenge coin
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'consul-general-metallic',
    'Consul General of Metallic Emblems',
    'Silver challenge coin bearer',
    v_axanar_id, 250.00, 'Silver challenge coin', 18, 'Kickstarter', false,
    1.5, 400, 40,
    'text-slate-300', 'border-slate-300/30', '🪙', 'Consul General of Metallic Emblems'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 19: $250 - Gold challenge coin (alternate)
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'consul-general-auric',
    'Consul General of Auric Legacy',
    'Gold challenge coin bearer',
    v_axanar_id, 250.00, 'Gold challenge coin', 19, 'Kickstarter', false,
    1.55, 425, 45,
    'text-yellow-400', 'border-yellow-400/30', '🏅', 'Consul General of Auric Legacy'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 20: $300 - Script signed by cast
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'deputy-chief-cast-signatures',
    'Deputy Chief of Mission – Cast Signatures',
    'Script signed by Hatch, Todd, Graham, Hertzler',
    v_axanar_id, 300.00, 'Script signed by cast', 20, 'Kickstarter', false,
    1.6, 450, 50,
    'text-orange-500', 'border-orange-500/30', '✍️', 'Deputy Chief of Mission – Cast Signatures'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 21: $500 - Producer credit
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'minister-credit-accords',
    'Minister-Counselor of Credit Accords',
    'Producer credit on Axanar',
    v_axanar_id, 500.00, 'Producer credit', 21, 'Kickstarter', false,
    1.75, 500, 75,
    'text-red-400', 'border-red-400/30', '🎬', 'Minister-Counselor of Credit Accords'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 22: $750 - Personal video thank-you
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'charge-video-envoys',
    'Chargé d''Affaires of Video Envoys',
    'Personal video message recipient',
    v_axanar_id, 750.00, 'Personal video thank-you', 22, 'Kickstarter', false,
    1.85, 600, 85,
    'text-red-400', 'border-red-400/30', '📹', 'Chargé d''Affaires of Video Envoys'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 23: $1,000 - Premiere / Captain's Summit invite
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'ambassador-event-diplomacy',
    'Ambassador-at-Large of Event Diplomacy',
    'Premiere and Captain''s Summit access',
    v_axanar_id, 1000.00, 'Premiere / Captain''s Summit invite', 23, 'Kickstarter', false,
    2.0, 750, 100,
    'text-red-500', 'border-red-500/30', '🎭', 'Ambassador-at-Large of Event Diplomacy'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 24: $2,500 - Walk-on speaking role
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'ambassador-cameo',
    'Ambassador of Cameo Protocols',
    'Walk-on speaking role in Axanar',
    v_axanar_id, 2500.00, 'Walk-on speaking role', 24, 'Kickstarter', false,
    2.5, 1000, 150,
    'text-rose-400', 'border-rose-400/30', '🎥', 'Ambassador of Cameo Protocols'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 25: $5,000 - Associate Producer credit
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'ambassador-extraordinary',
    'Ambassador Extraordinary',
    'Associate Producer credit with on-screen recognition',
    v_axanar_id, 5000.00, 'Associate Producer credit', 25, 'Kickstarter', false,
    3.0, 1250, 200,
    'text-rose-500', 'border-rose-500/30', '⭐', 'Ambassador Extraordinary'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 26: $10,000 - Full Producer credit
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'ambassador-plenipotentiary',
    'Ambassador Extraordinary and Plenipotentiary',
    'Full Producer credit + Captain''s chair replica',
    v_axanar_id, 10000.00, 'Full Producer credit', 26, 'Kickstarter', false,
    3.5, 1500, 250,
    'text-pink-400', 'border-pink-400/30', '👑', 'Ambassador Extraordinary and Plenipotentiary'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 27: $25,000 - Executive Producer
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'ambassador-executive-enclaves',
    'Ambassador Plenipotentiary of Executive Enclaves',
    'Executive Producer + set visit',
    v_axanar_id, 25000.00, 'Executive Producer', 27, 'Kickstarter', false,
    4.0, 1750, 300,
    'text-fuchsia-400', 'border-fuchsia-400/30', '💎', 'Ambassador Plenipotentiary of Executive Enclaves'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 28: $50,000+ - Naming rights
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'grand-ambassador-nomenclature',
    'Grand Ambassador of Nomenclature',
    'Ship or set-piece naming rights',
    v_axanar_id, 50000.00, 'Naming rights', 28, 'Kickstarter', false,
    5.0, 2000, 500,
    'text-fuchsia-500', 'border-fuchsia-500/30', '🌟', 'Grand Ambassador of Nomenclature'
  ) ON CONFLICT (slug) DO NOTHING;

END $$;

-- Create forum badges for Axanar Kickstarter titles
INSERT INTO public.forum_badges (slug, label, description, icon)
VALUES 
  ('attache-fleet-insignia', 'FLEET INSIGNIA ATTACHÉ', 'Axanar KS $35+ supporter', 'shield'),
  ('third-secretary-bundle', 'BUNDLE SECRETARY', 'Axanar KS $50+ supporter', 'package'),
  ('second-secretary-uniform-diplomacy', 'UNIFORM DIPLOMAT', 'Axanar KS $75+ supporter', 'shirt'),
  ('first-secretary-poster', 'POSTER SECRETARY', 'Axanar KS $100+ supporter', 'image'),
  ('consul-optical-disc', 'CONSUL OF DISCS', 'Axanar KS $150+ supporter', 'disc'),
  ('consul-general-metallic', 'CONSUL GENERAL (SILVER)', 'Axanar KS $250+ supporter', 'circle'),
  ('consul-general-auric', 'CONSUL GENERAL (GOLD)', 'Axanar KS $250+ supporter (gold)', 'circle'),
  ('deputy-chief-cast-signatures', 'DEPUTY CHIEF', 'Axanar KS $300+ supporter', 'pen-tool'),
  ('minister-credit-accords', 'MINISTER-COUNSELOR', 'Axanar KS $500+ supporter', 'film'),
  ('charge-video-envoys', 'CHARGÉ D''AFFAIRES', 'Axanar KS $750+ supporter', 'video'),
  ('ambassador-event-diplomacy', 'AMBASSADOR-AT-LARGE', 'Axanar KS $1,000+ supporter', 'ticket'),
  ('ambassador-cameo', 'AMBASSADOR (CAMEO)', 'Axanar KS $2,500+ supporter', 'camera'),
  ('ambassador-extraordinary', 'AMBASSADOR EXTRAORDINARY', 'Axanar KS $5,000+ supporter', 'star'),
  ('ambassador-plenipotentiary', 'AMBASSADOR PLENIPOTENTIARY', 'Axanar KS $10,000+ supporter', 'crown'),
  ('ambassador-executive-enclaves', 'EXECUTIVE AMBASSADOR', 'Axanar KS $25,000+ supporter', 'gem'),
  ('grand-ambassador-nomenclature', 'GRAND AMBASSADOR', 'Axanar KS $50,000+ supporter', 'sparkles')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- INDIEGOGO RECOVERY TITLES (Tiers 29-37)
-- =====================================================

DO $$
DECLARE
  v_indiegogo_id UUID;
BEGIN
  SELECT id INTO v_indiegogo_id FROM public.campaigns WHERE name ILIKE '%indiegogo%' ORDER BY created_at DESC LIMIT 1;
  
  -- Tier 29: $25 - Recovery patch set
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'attache-recovery-emblems',
    'Attaché of Recovery Emblems',
    'Recovery patch collection supporter',
    v_indiegogo_id, 25.00, 'Recovery patch set', 29, 'Indiegogo', false,
    1.15, 125, 10,
    'text-emerald-400', 'border-emerald-400/30', '🎖️', 'Attaché of Recovery Emblems'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 30: $50 - Signed crew badge
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'third-secretary-badge',
    'Third Secretary of Badge Accords',
    'Signed crew badge holder',
    v_indiegogo_id, 50.00, 'Signed crew badge', 30, 'Indiegogo', false,
    1.25, 175, 15,
    'text-emerald-400', 'border-emerald-400/30', '🏅', 'Third Secretary of Badge Accords'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 31: $75 - Recovery T-shirt
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'second-secretary-rally',
    'Second Secretary of Rally Uniforms',
    'Exclusive recovery apparel recipient',
    v_indiegogo_id, 75.00, 'Recovery T-shirt', 31, 'Indiegogo', false,
    1.3, 200, 20,
    'text-emerald-500', 'border-emerald-500/30', '👕', 'Second Secretary of Rally Uniforms'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 32: $100 - Digital art book
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'first-secretary-artistic',
    'First Secretary of Artistic Archives',
    '200+ page art book collection',
    v_indiegogo_id, 100.00, 'Digital art book', 32, 'Indiegogo', false,
    1.35, 250, 25,
    'text-teal-400', 'border-teal-400/30', '📚', 'First Secretary of Artistic Archives'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 33: $150 - Ultimate patch collection
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'consul-patch-pantheons',
    'Consul of Patch Pantheons',
    'Ultimate 4x patch set collector',
    v_indiegogo_id, 150.00, 'Ultimate patch collection', 33, 'Indiegogo', false,
    1.4, 300, 30,
    'text-teal-500', 'border-teal-500/30', '🛡️', 'Consul of Patch Pantheons'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 34: $250 - Gold recovery challenge coin
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'consul-general-resilience',
    'Consul General of Auric Resilience',
    'Gold recovery challenge coin bearer',
    v_indiegogo_id, 250.00, 'Gold recovery challenge coin', 34, 'Indiegogo', false,
    1.5, 400, 40,
    'text-yellow-500', 'border-yellow-500/30', '🏅', 'Consul General of Auric Resilience'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 35: $500 - Signed recovery script
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'deputy-chief-resilience-scripts',
    'Deputy Chief of Mission – Resilience Scripts',
    'Recovery-edition signed script holder',
    v_indiegogo_id, 500.00, 'Signed recovery script', 35, 'Indiegogo', false,
    1.75, 500, 50,
    'text-cyan-400', 'border-cyan-400/30', '📜', 'Deputy Chief of Mission – Resilience Scripts'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 36: $750 - Recovery thank-you video
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'minister-resilience-envoys',
    'Minister-Counselor of Resilience Envoys',
    'Recovery-edition personal video message',
    v_indiegogo_id, 750.00, 'Recovery thank-you video', 36, 'Indiegogo', false,
    1.85, 600, 75,
    'text-cyan-500', 'border-cyan-500/30', '📹', 'Minister-Counselor of Resilience Envoys'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Tier 37: $1,000+ - Virtual Captain's Summit
  INSERT INTO public.ambassadorial_titles (
    slug, display_name, description, campaign_id, minimum_pledge_amount,
    exact_perk_name, tier_level, campaign_platform, is_universal,
    xp_multiplier, forum_xp_bonus, participation_xp_bonus,
    color, badge_style, icon, original_rank_name
  ) VALUES (
    'ambassador-indiegogo-legacy',
    'Ambassador of Indiegogo Legacy',
    'Virtual Captain''s Summit + behind-the-scenes access',
    v_indiegogo_id, 1000.00, 'Virtual Captain''s Summit', 37, 'Indiegogo', false,
    2.0, 750, 100,
    'text-sky-400', 'border-sky-400/30', '🎪', 'Ambassador of Indiegogo Legacy'
  ) ON CONFLICT (slug) DO NOTHING;

END $$;

-- Create forum badges for Indiegogo titles
INSERT INTO public.forum_badges (slug, label, description, icon)
VALUES 
  ('attache-recovery-emblems', 'RECOVERY ATTACHÉ', 'Indiegogo $25+ supporter', 'award'),
  ('third-secretary-badge', 'BADGE SECRETARY', 'Indiegogo $50+ supporter', 'badge'),
  ('second-secretary-rally', 'RALLY SECRETARY', 'Indiegogo $75+ supporter', 'shirt'),
  ('first-secretary-artistic', 'ARTISTIC SECRETARY', 'Indiegogo $100+ supporter', 'book'),
  ('consul-patch-pantheons', 'CONSUL OF PATCHES', 'Indiegogo $150+ supporter', 'shield'),
  ('consul-general-resilience', 'CONSUL OF RESILIENCE', 'Indiegogo $250+ supporter', 'circle'),
  ('deputy-chief-resilience-scripts', 'DEPUTY CHIEF', 'Indiegogo $500+ supporter', 'scroll'),
  ('minister-resilience-envoys', 'MINISTER OF RESILIENCE', 'Indiegogo $750+ supporter', 'video'),
  ('ambassador-indiegogo-legacy', 'AMBASSADOR OF LEGACY', 'Indiegogo $1,000+ supporter', 'trophy')
ON CONFLICT (slug) DO NOTHING;