-- Add category columns to axanar_videos table
ALTER TABLE public.axanar_videos 
ADD COLUMN IF NOT EXISTS content_type text,
ADD COLUMN IF NOT EXISTS subject_matter text,
ADD COLUMN IF NOT EXISTS source_channel text;

-- Add indexes for filtering
CREATE INDEX IF NOT EXISTS idx_axanar_videos_content_type ON public.axanar_videos(content_type);
CREATE INDEX IF NOT EXISTS idx_axanar_videos_subject_matter ON public.axanar_videos(subject_matter);
CREATE INDEX IF NOT EXISTS idx_axanar_videos_source_channel ON public.axanar_videos(source_channel);

-- Add comments for documentation
COMMENT ON COLUMN public.axanar_videos.content_type IS 'Type of content: Episode, Behind the Scenes, Interview, Q&A, Trailer, News, Documentary';
COMMENT ON COLUMN public.axanar_videos.subject_matter IS 'Subject: Production, Cast & Crew, Ship Design, Story & Lore, Fan Community, General';
COMMENT ON COLUMN public.axanar_videos.source_channel IS 'Source channel: Axanar Productions, Avalon Fan Films, etc.';