-- Drop the incorrect storage policies
DROP POLICY IF EXISTS "Users can upload their own background images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own background images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own background images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own background images" ON storage.objects;

-- Create correct storage policies for background images
-- The file path structure is: backgrounds/{user_id}_background_{timestamp}.{ext}

-- Allow users to upload their own background images
CREATE POLICY "Users can upload background images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'backgrounds'
  AND starts_with((storage.filename(name)), auth.uid()::text || '_background_')
);

-- Allow users to view their own background images
CREATE POLICY "Users can view background images" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'backgrounds'
  AND starts_with((storage.filename(name)), auth.uid()::text || '_background_')
);

-- Allow users to update their own background images
CREATE POLICY "Users can update background images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'backgrounds'
  AND starts_with((storage.filename(name)), auth.uid()::text || '_background_')
);

-- Allow users to delete their own background images
CREATE POLICY "Users can delete background images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'backgrounds'
  AND starts_with((storage.filename(name)), auth.uid()::text || '_background_')
);