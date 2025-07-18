-- Fix the confirmation_token column issue in auth.users table
-- The error suggests NULL values can't be converted to string type
-- We need to update NULL confirmation_token values to empty strings

UPDATE auth.users 
SET confirmation_token = '' 
WHERE confirmation_token IS NULL;