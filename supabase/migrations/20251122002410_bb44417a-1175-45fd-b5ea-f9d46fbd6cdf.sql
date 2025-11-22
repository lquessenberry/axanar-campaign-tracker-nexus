-- Create special Ares Challenge Envoy ambassadorial title
INSERT INTO ambassadorial_titles (
  slug,
  display_name,
  description,
  minimum_pledge_amount,
  tier_level,
  is_universal,
  icon,
  color,
  badge_style,
  xp_multiplier,
  forum_xp_bonus,
  participation_xp_bonus,
  special_permissions
) VALUES (
  'ares-challenge-envoy',
  'Ares Challenge Envoy',
  'Elite recognition for completing special Ares challenges and missions! Your dedication to the cause has earned you this prestigious diplomatic designation.',
  0.00,
  50,
  true,
  '/images/badges/ares-challenge-envoy.png',
  'text-amber-400',
  'border-amber-400/30',
  2.5,
  1000,
  150,
  '["challenge_master", "special_events"]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  tier_level = EXCLUDED.tier_level,
  xp_multiplier = EXCLUDED.xp_multiplier,
  forum_xp_bonus = EXCLUDED.forum_xp_bonus,
  participation_xp_bonus = EXCLUDED.participation_xp_bonus;