import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserAchievements = (targetUserId?: string) => {
  const { user } = useAuth();
  const userId = targetUserId || user?.id;
  
  return useQuery({
    queryKey: ['user-achievements', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
};

export const useCalculateAchievements = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase.rpc('calculate_donation_achievements', {
        user_uuid: user.id
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-achievements', user?.id] });
    },
  });
};

export const useUserRecruitment = (targetUserId?: string) => {
  const { user } = useAuth();
  const userId = targetUserId || user?.id;
  
  return useQuery({
    queryKey: ['user-recruitment', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      
      const { data, error } = await supabase
        .from('user_recruits')
        .select('*')
        .eq('recruiter_id', userId)
        .order('recruited_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
};
