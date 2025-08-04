-- Create storage bucket for 3D models and textures
INSERT INTO storage.buckets (id, name, public)
VALUES ('models', 'models', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for model uploads
CREATE POLICY "Allow public access to models" ON storage.objects
FOR SELECT USING (bucket_id = 'models');

CREATE POLICY "Allow authenticated users to upload models" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'models' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to update their models" ON storage.objects
FOR UPDATE USING (bucket_id = 'models' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to delete their models" ON storage.objects
FOR DELETE USING (bucket_id = 'models' AND auth.uid() IS NOT NULL);