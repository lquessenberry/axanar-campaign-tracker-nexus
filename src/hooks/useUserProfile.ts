
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserProfile = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      // Get profile from the profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      // If no profile exists, create one
      if (!profile) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{ id: user.id }])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating profile:', insertError);
          throw insertError;
        }

        return newProfile;
      }

      // If profile exists but has no data, check if donor record has data and sync it
      if (!profile.full_name && !profile.username && !profile.bio) {
        const { data: donor } = await supabase
          .from('donors')
          .select('full_name, username, bio, avatar_url')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (donor && (donor.full_name || donor.username || donor.bio || donor.avatar_url)) {
          console.log('Syncing donor data to profile:', donor);
          const { data: updatedProfile } = await supabase
            .from('profiles')
            .update({
              full_name: donor.full_name,
              username: donor.username,
              bio: donor.bio,
              avatar_url: donor.avatar_url
            })
            .eq('id', user.id)
            .select()
            .single();

          return updatedProfile || profile;
        }
      }

      return profile;
    },
    enabled: !!user,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (updates: { 
      username?: string; 
      full_name?: string; 
      bio?: string; 
      avatar_url?: string; 
      background_url?: string | null;
      show_avatar_publicly?: boolean;
      show_real_name_publicly?: boolean;
      show_background_publicly?: boolean;
    }) => {
      if (!user) {
        console.error('❌ No authenticated user');
        throw new Error('User not authenticated');
      }
      
      console.log('🔄 Starting profile update with:', updates);
      console.log('👤 Current user ID:', user.id);
      
      // Validate bio length if provided
      if (updates.bio && updates.bio.length > 5000) {
        console.error('❌ Bio too long:', updates.bio.length);
        throw new Error('Bio must be less than 5000 characters');
      }
      
      // Update profile table
      console.log('📡 Sending update to Supabase...');
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Profile update error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('✅ Profile updated successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('✅ Profile update mutation succeeded, invalidating cache');
      queryClient.invalidateQueries({ queryKey: ['user-profile', user?.id] });
      queryClient.setQueryData(['user-profile', user?.id], data);
    },
    onError: (error) => {
      console.error('❌ Profile update mutation failed:', error);
    },
  });
};
