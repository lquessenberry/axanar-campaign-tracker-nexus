import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useBackgroundUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadBackground = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    
    try {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return null;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image under 5MB.",
          variant: "destructive",
        });
        return null;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to upload a background image.",
          variant: "destructive",
        });
        return null;
      }

      // Create file name with user ID and timestamp
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_background_${Date.now()}.${fileExt}`;
      const filePath = `backgrounds/${fileName}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      toast({
        title: "Background updated",
        description: "Your profile background has been updated successfully.",
      });

      return data.publicUrl;
    } catch (error) {
      console.error('Background upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload background image. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const removeBackground = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Get current profile to find the background URL
      const { data: profile } = await supabase
        .from('profiles')
        .select('background_url')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.background_url) {
        // Extract file path from URL
        const urlParts = profile.background_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `backgrounds/${fileName}`;

        // Delete file from storage
        await supabase.storage
          .from('avatars')
          .remove([filePath]);
      }

      toast({
        title: "Background removed",
        description: "Your profile background has been removed.",
      });

      return true;
    } catch (error) {
      console.error('Background removal error:', error);
      toast({
        title: "Removal failed",
        description: "Failed to remove background image. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    uploadBackground,
    removeBackground,
    isUploading
  };
};