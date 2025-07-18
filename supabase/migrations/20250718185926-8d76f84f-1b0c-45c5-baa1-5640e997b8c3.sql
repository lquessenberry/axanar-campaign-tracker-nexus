-- Fix the email_change column data type issue in auth.users
-- This column should allow NULL values or have a proper default

-- First, let's check if we can safely update the auth.users table
-- We need to ensure email_change column can handle NULL values properly

-- Update any NULL email_change values to empty string to prevent scan errors
UPDATE auth.users 
SET email_change = '' 
WHERE email_change IS NULL;

-- Ensure the column has proper constraints to handle empty strings
-- Note: We're being careful with auth schema modifications