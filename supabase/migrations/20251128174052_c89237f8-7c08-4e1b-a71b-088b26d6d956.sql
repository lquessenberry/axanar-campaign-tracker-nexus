-- Backup existing rewards before canonical rewards replacement
-- Date: 2025-11-28
-- Purpose: Preserve 86 existing reward records and 17,174 pledge-reward linkages

-- Step 1: Create rewards backup table
CREATE TABLE IF NOT EXISTS public.rewards_backup_20251128 AS 
SELECT * FROM public.rewards 
WHERE campaign_id IN (
  'be6e31c9-75d2-435a-9c89-9aa30187fd27', -- Axanar Indiegogo
  '48c84c30-ad7e-43f3-9a07-c75eb427c819', -- Original Axanar Kickstarter
  '17238b6e-a399-4773-abcc-68acc1264dba'  -- Prelude to Axanar Kickstarter
);

-- Step 2: Create pledge-reward linkage backup table
CREATE TABLE IF NOT EXISTS public.pledge_reward_links_backup_20251128 AS
SELECT 
  p.id as pledge_id, 
  p.reward_id, 
  p.campaign_id, 
  p.amount, 
  p.donor_id,
  p.created_at,
  p.updated_at
FROM public.pledges p
WHERE p.reward_id IS NOT NULL
  AND p.campaign_id IN (
    'be6e31c9-75d2-435a-9c89-9aa30187fd27',
    '48c84c30-ad7e-43f3-9a07-c75eb427c819',
    '17238b6e-a399-4773-abcc-68acc1264dba'
  );

-- Step 3: Enable RLS on backup tables
ALTER TABLE public.rewards_backup_20251128 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pledge_reward_links_backup_20251128 ENABLE ROW LEVEL SECURITY;

-- Step 4: Add admin-only policies
CREATE POLICY "admin_only_rewards_backup" 
  ON public.rewards_backup_20251128 
  FOR ALL 
  USING (check_current_user_is_admin())
  WITH CHECK (check_current_user_is_admin());

CREATE POLICY "admin_only_pledge_links_backup" 
  ON public.pledge_reward_links_backup_20251128 
  FOR ALL 
  USING (check_current_user_is_admin())
  WITH CHECK (check_current_user_is_admin());

-- Step 5: Add comments for documentation
COMMENT ON TABLE public.rewards_backup_20251128 IS 
  'Backup of rewards table created 2025-11-28 before canonical rewards replacement. Contains 86 records from Prelude KS, Axanar KS, and Axanar IGG campaigns.';

COMMENT ON TABLE public.pledge_reward_links_backup_20251128 IS 
  'Backup of pledge-reward linkages created 2025-11-28 before canonical rewards replacement. Contains 17,174 linkages preserving which pledges were associated with which rewards.';