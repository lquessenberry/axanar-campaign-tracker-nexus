import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ReserveUserAnalyticsData {
  totalUsers: number;
  platformBreakdown: Array<{
    platform: string;
    count: number;
    percentage: number;
    users: Array<{
      email: string;
      displayName: string;
      sourceContributionDate: string | null;
      importedAt: string;
    }>;
  }>;
  sourceBreakdown: Array<{
    source: string;
    count: number;
    percentage: number;
    users: Array<{
      email: string;
      displayName: string;
      sourceContributionDate: string | null;
      importedAt: string;
    }>;
  }>;
  statusBreakdown: Array<{
    status: string;
    count: number;
    percentage: number;
    users: Array<{
      email: string;
      displayName: string;
      sourceContributionDate: string | null;
      importedAt: string;
    }>;
  }>;
  dateAnalysis: {
    withOriginalDates: number;
    withImportedDatesOnly: number;
    withoutValidDates: number;
    oldestOriginalDate: string | null;
    newestOriginalDate: string | null;
    importBatchDate: string | null;
  };
  dataQuality: {
    validEmails: number;
    invalidEmails: number;
    withNames: number;
    withoutNames: number;
    duplicateEmails: number;
  };
}

export const useReserveUserAnalytics = () => {
  return useQuery({
    queryKey: ['reserve-user-analytics'],
    queryFn: async (): Promise<ReserveUserAnalyticsData> => {
      const { data, error } = await supabase.functions.invoke('reserve-user-analytics', {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (error) {
        console.error('Reserve user analytics error:', error);
        throw new Error(error.message || 'Failed to fetch reserve user analytics');
      }

      return data;
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
};