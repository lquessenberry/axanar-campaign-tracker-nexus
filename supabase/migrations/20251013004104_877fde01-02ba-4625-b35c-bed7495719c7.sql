-- Drop the old 4-parameter version
DROP FUNCTION IF EXISTS public.initiate_account_recovery(text, text, text, text);

-- The 2-parameter version already exists and is correct