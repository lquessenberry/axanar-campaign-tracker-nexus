-- Ensure the backgrounds bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('backgrounds', 'backgrounds', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create permissive policies for background images
CREATE POLICY "Anyone can view background images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'backgrounds');

CREATE POLICY "Users can upload their own background images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'backgrounds' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own background images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'backgrounds' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own background images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'backgrounds' AND auth.uid()::text = (storage.foldername(name))[1]);