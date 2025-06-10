
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
          bio: null,
          avatar_url: null,
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
      
      // Try to update donor record
      const { data, error } = await supabase
        .from('donors')
        .update({
          full_name: updates.full_name,
          updated_at: new Date().toISOString()
        })
        .eq('auth_user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', user?.id] });
    },
  });
};
