-- Add video_id column to forum_threads to link discussions to videos
ALTER TABLE public.forum_threads 
ADD COLUMN IF NOT EXISTS video_id TEXT;

-- Create index for faster video lookups
CREATE INDEX IF NOT EXISTS idx_forum_threads_video_id ON public.forum_threads(video_id);