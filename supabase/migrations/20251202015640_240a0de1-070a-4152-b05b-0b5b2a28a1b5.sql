-- Add archive_url column to axanar_videos table
ALTER TABLE public.axanar_videos 
ADD COLUMN IF NOT EXISTS archive_url TEXT;