
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
    mutationFn: async (updates: { username?: string; full_name?: string; bio?: string; avatar_url?: string; background_url?: string | null }) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Updating profile with:', updates);
      
      // Update profile table
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }

      console.log('Profile updated successfully:', data);

      // Also update donor table if a donor record exists (keep in sync)
      const donorUpdates: any = {};
      if (updates.username !== undefined) donorUpdates.username = updates.username;
      if (updates.full_name !== undefined) donorUpdates.full_name = updates.full_name;
      if (updates.bio !== undefined) donorUpdates.bio = updates.bio;
      if (updates.avatar_url !== undefined) donorUpdates.avatar_url = updates.avatar_url;

      if (Object.keys(donorUpdates).length > 0) {
        const { error: donorError } = await supabase
          .from('donors')
          .update(donorUpdates)
          .eq('auth_user_id', user.id);

        if (donorError) {
          console.warn('Could not sync to donor table:', donorError);
          // Don't throw - profile update succeeded, donor sync is secondary
        } else {
          console.log('Donor record synced successfully');
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', user?.id] });
    },
  });
};
