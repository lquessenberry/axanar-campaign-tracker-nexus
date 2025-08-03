-- Add background_url column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN background_url TEXT;