-- =====================================================
-- SECURITY FIX: Remove Email Exposure from Forum Threads
-- =====================================================
-- Remove the author_email column which exposes user email addresses
-- to anyone who can query the forum_threads table

-- Drop the author_email column completely
ALTER TABLE public.forum_threads DROP COLUMN author_email;

-- Security Notes:
-- ✅ Removes PII (email addresses) from publicly accessible table
-- ✅ Prevents email harvesting attacks
-- ✅ No functional impact - column was not used in UI
-- ✅ User emails remain safely in auth.users (private schema)
-- ✅ author_user_id and author_username still available for display