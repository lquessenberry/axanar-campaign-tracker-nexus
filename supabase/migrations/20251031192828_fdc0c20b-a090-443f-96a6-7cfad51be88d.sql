-- Add privacy settings columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS show_avatar_publicly boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_real_name_publicly boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_background_publicly boolean DEFAULT true;

COMMENT ON COLUMN public.profiles.show_avatar_publicly IS 'Controls whether avatar is visible on public profile';
COMMENT ON COLUMN public.profiles.show_real_name_publicly IS 'Controls whether real name (full_name) is visible on public profile';
COMMENT ON COLUMN public.profiles.show_background_publicly IS 'Controls whether background image is visible on public profile';