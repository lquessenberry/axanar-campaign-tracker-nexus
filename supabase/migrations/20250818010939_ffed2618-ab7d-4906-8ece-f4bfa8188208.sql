-- Create storage policies for axanar-assets bucket
CREATE POLICY "Public read access for axanar-assets" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'axanar-assets');

CREATE POLICY "Authenticated users can upload to axanar-assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'axanar-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own uploads in axanar-assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'axanar-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own uploads in axanar-assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'axanar-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Admin users can manage all files in axanar-assets
CREATE POLICY "Admins can manage all axanar-assets files" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'axanar-assets' AND (
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND (is_super_admin = true OR is_content_manager = true)
  )
));