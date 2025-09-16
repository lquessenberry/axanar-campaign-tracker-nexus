-- Seed/Upsert display overrides for Prelude to Axanar from local CSV aggregate
-- Ensures cross-environment reproducibility of the verified totals
INSERT INTO public.campaign_display_overrides AS o (
  campaign_id,
  display_amount,
  display_backers,
  display_goal,
  source_note
) VALUES (
  '80e3b1cb-9eb8-4f7e-bb39-765c7b498557'::uuid,
  101771.30,
  2127,
  100000.00,
  'Local CSV aggregate: Kickstarter (status=collected) + PayPal for Prelude'
)
ON CONFLICT (campaign_id) DO UPDATE SET
  display_amount = EXCLUDED.display_amount,
  display_backers = EXCLUDED.display_backers,
  display_goal = EXCLUDED.display_goal,
  source_note = EXCLUDED.source_note,
  updated_at = now();
