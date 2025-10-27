import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useAvatarUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) {
      toast.error('You must be logged in to upload an avatar');
      return null;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return null;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size must be less than 5MB');
      return null;
    }

    setIsUploading(true);
    console.log('🔄 Starting avatar upload for user:', user.id);

    try {
      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      console.log('📤 Uploading avatar to path:', fileName);

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('❌ Avatar upload error:', uploadError);
        toast.error(`Failed to upload image: ${uploadError.message}`);
        return null;
      }

      console.log('✅ Avatar uploaded successfully:', uploadData.path);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path);

      console.log('✅ Avatar public URL:', publicUrl);
      toast.success('Profile photo uploaded successfully!');
      return publicUrl;

    } catch (error: any) {
      console.error('❌ Error uploading avatar:', error);
      toast.error(`Failed to upload profile photo: ${error?.message || 'Unknown error'}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadAvatar,
    isUploading
  };
};