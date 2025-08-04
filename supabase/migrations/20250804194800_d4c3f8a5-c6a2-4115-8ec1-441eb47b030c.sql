-- Create storage bucket for 3D models
INSERT INTO storage.buckets (id, name, public) 
VALUES ('models', 'models', true);

-- Create policies for 3D model uploads
CREATE POLICY "3D models are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'models');

CREATE POLICY "Users can upload 3D models" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'models' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own 3D models" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'models' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own 3D models" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'models' AND auth.uid() IS NOT NULL);