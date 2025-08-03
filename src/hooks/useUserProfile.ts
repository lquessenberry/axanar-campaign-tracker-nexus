
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserProfile = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      // Check if user has a donor record
      const { data: donor, error: donorError } = await supabase
        .from('donors')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (donorError && donorError.code !== 'PGRST116') {
        throw donorError;
      }

      if (donor) {
        // Return donor data formatted as profile
        return {
          id: user.id,
          username: donor.email?.split('@')[0] || null,
          full_name: donor.full_name || `${donor.first_name || ''} ${donor.last_name || ''}`.trim() || null,
          bio: (donor as any).bio || null,
          avatar_url: donor.avatar_url || null,
          created_at: donor.created_at,
          updated_at: donor.updated_at
        };
      }

      // Return basic profile from auth user
      return {
        id: user.id,
        username: user.email?.split('@')[0] || null,
        full_name: user.user_metadata?.full_name || null,
        bio: null,
        avatar_url: null,
        created_at: user.created_at,
        updated_at: user.updated_at
      };
    },
    enabled: !!user,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (updates: { username?: string; full_name?: string; bio?: string; avatar_url?: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Starting profile update with data:', updates);
      
      try {
        // Call the edge function to handle profile updates with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const { data, error } = await supabase.functions.invoke('update-profile', {
          body: updates,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        clearTimeout(timeoutId);
        
        console.log('Edge function response:', { data, error });

        if (error) {
          console.error('Profile update error:', error);
          throw new Error(error.message || 'Failed to update profile');
        }

        if (!data?.success) {
          console.error('Profile update failed:', data);
          throw new Error(data?.error || 'Failed to update profile');
        }

        console.log('Profile updated successfully:', data.profile);
        return data.profile;
      } catch (err) {
        console.error('Profile update error:', err);
        if (err instanceof Error && err.name === 'AbortError') {
          throw new Error('Request timeout - please try again');
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', user?.id] });
    },
  });
};
