import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminAnalytics } from '@/types/adminData';
import { useFallbackAdminData } from './useFallbackAdminData';

export const useAdminAnalytics = () => {
  // Use fallback data as backup
  const fallbackQuery = useFallbackAdminData();
  
  const edgeFunctionQuery = useQuery({
    queryKey: ['admin-analytics-edge'],
    queryFn: async (): Promise<AdminAnalytics> => {
      console.log('Fetching admin analytics via edge function...');
      
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (!session?.session?.access_token) {
          console.error('No valid session found');
          throw new Error('Authentication required');
        }

        console.log('Invoking admin-analytics edge function...');
        const { data, error } = await supabase.functions.invoke('admin-analytics', {
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Edge function response:', { data, error });

        if (error) {
          console.error('Admin analytics edge function error:', error);
          throw new Error(error.message || error.toString() || 'Failed to fetch admin analytics');
        }

        if (!data) {
          console.error('No data returned from edge function');
          throw new Error('No data returned from admin analytics');
        }

        console.log('Successfully fetched admin analytics:', data);
        return data as AdminAnalytics;
      } catch (err) {
        console.error('Admin analytics error:', err);
        throw err;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 3000,
    // If edge function fails, we'll use fallback data
    enabled: true,
  });

  // Return edge function data if available, otherwise fallback data
  return {
    data: edgeFunctionQuery.data || fallbackQuery.data,
    isLoading: edgeFunctionQuery.isLoading && fallbackQuery.isLoading,
    error: edgeFunctionQuery.error && fallbackQuery.error ? 
      new Error(`Edge function failed: ${edgeFunctionQuery.error.message}. Fallback also failed: ${fallbackQuery.error.message}`) :
      null,
    isUsingFallback: !edgeFunctionQuery.data && !!fallbackQuery.data,
  };
};