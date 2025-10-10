-- Security Fix: Restrict public access to user and campaign data
-- This addresses multiple security findings by requiring authentication

-- 1. Restrict placeholder_profiles access (User Profile Data Exposed)
DROP POLICY IF EXISTS "Anyone can view placeholder profiles" ON placeholder_profiles;

CREATE POLICY "deny_anon_placeholder_profiles"
ON placeholder_profiles
FOR ALL
TO anon
USING (false);

-- 2. Restrict campaigns access (Campaign Financial Data Visible)
DROP POLICY IF EXISTS "All users can view campaigns" ON campaigns;

CREATE POLICY "deny_anon_campaigns"
ON campaigns
FOR ALL
TO anon
USING (false);

-- Ensure authenticated users can still view campaigns
CREATE POLICY "authenticated_view_campaigns"
ON campaigns
FOR SELECT
TO authenticated
USING (true);

-- 3. Restrict rewards access (Reward Tier Pricing Exposed)
DROP POLICY IF EXISTS "All users can view rewards" ON rewards;

CREATE POLICY "deny_anon_rewards"
ON rewards
FOR ALL
TO anon
USING (false);

-- Ensure authenticated users can still view rewards
CREATE POLICY "authenticated_view_rewards"
ON rewards
FOR SELECT
TO authenticated
USING (true);

-- 4. Restrict forum_threads access (Forum Posts Exposed)
DROP POLICY IF EXISTS "forum_threads_select_all" ON forum_threads;

CREATE POLICY "deny_anon_forum_threads"
ON forum_threads
FOR ALL
TO anon
USING (false);

CREATE POLICY "authenticated_view_forum_threads"
ON forum_threads
FOR SELECT
TO authenticated
USING (true);

-- 5. Restrict forum_user_ranks access (User Achievement Levels Exposed)
DROP POLICY IF EXISTS "forum_user_ranks_public_select" ON forum_user_ranks;

CREATE POLICY "deny_anon_forum_user_ranks"
ON forum_user_ranks
FOR ALL
TO anon
USING (false);

CREATE POLICY "authenticated_view_forum_user_ranks"
ON forum_user_ranks
FOR SELECT
TO authenticated
USING (true);

-- 6. Restrict forum_badges access (Gamification System Exposed)
DROP POLICY IF EXISTS "forum_badges_public_select" ON forum_badges;

CREATE POLICY "deny_anon_forum_badges"
ON forum_badges
FOR ALL
TO anon
USING (false);

CREATE POLICY "authenticated_view_forum_badges"
ON forum_badges
FOR SELECT
TO authenticated
USING (true);

-- 7. Restrict forum_ranks access (Gamification System Exposed)
DROP POLICY IF EXISTS "forum_ranks_public_select" ON forum_ranks;

CREATE POLICY "deny_anon_forum_ranks"
ON forum_ranks
FOR ALL
TO anon
USING (false);

CREATE POLICY "authenticated_view_forum_ranks"
ON forum_ranks
FOR SELECT
TO authenticated
USING (true);