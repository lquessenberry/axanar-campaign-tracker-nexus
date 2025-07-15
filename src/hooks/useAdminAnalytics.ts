import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminAnalytics } from '@/types/adminData';

export const useAdminAnalytics = () => {
  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async (): Promise<AdminAnalytics> => {
      const { data, error } = await supabase.functions.invoke('admin-analytics', {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (error) {
        console.error('Admin analytics error:', error);
        throw new Error(error.message || 'Failed to fetch admin analytics');
      }

      return data as AdminAnalytics;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
};