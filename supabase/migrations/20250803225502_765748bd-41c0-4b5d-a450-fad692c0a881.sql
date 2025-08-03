-- Create storage policies for background images in the backgrounds/ folder

-- Allow users to upload their own background images
CREATE POLICY "Users can upload their own background images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (storage.foldername(name))[2] = 'backgrounds'
);

-- Allow users to view their own background images
CREATE POLICY "Users can view their own background images" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (storage.foldername(name))[2] = 'backgrounds'
);

-- Allow users to update their own background images
CREATE POLICY "Users can update their own background images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (storage.foldername(name))[2] = 'backgrounds'
);

-- Allow users to delete their own background images
CREATE POLICY "Users can delete their own background images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (storage.foldername(name))[2] = 'backgrounds'
);