-- Create table for Axanar YouTube videos
CREATE TABLE IF NOT EXISTS public.axanar_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id text UNIQUE NOT NULL,
  video_url text NOT NULL,
  title text,
  playlist_title text,
  position integer,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.axanar_videos ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can view axanar videos"
ON public.axanar_videos
FOR SELECT
USING (true);

-- Allow service role full access for edge function
CREATE POLICY "Service role can manage videos"
ON public.axanar_videos
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');