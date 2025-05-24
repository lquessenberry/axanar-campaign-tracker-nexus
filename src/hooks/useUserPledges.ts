
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserPledges = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-pledges', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('pledges')
        .select(`
          *,
          campaigns(
            id,
            title,
            image_url,
            status,
            goal_amount,
            current_amount
          )
        `)
        .eq('backer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};
