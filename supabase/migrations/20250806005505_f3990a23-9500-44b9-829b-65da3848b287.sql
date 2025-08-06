-- Add missing fields to donors table for import compatibility
ALTER TABLE public.donors 
ADD COLUMN IF NOT EXISTS email_status TEXT,
ADD COLUMN IF NOT EXISTS email_permission_status TEXT,
ADD COLUMN IF NOT EXISTS email_lists TEXT,
ADD COLUMN IF NOT EXISTS source_name TEXT;