
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDonorStats = () => {
  // Get total count of verified donors (excluding reserve users)
  const { data: totalCount, isLoading: isLoadingTotal } = useQuery({
    queryKey: ['total-verified-donors-count'],
    queryFn: async () => {
      // First get all reserve user emails
      const { data: reserveUsers, error: reserveError } = await supabase
        .from('reserve_users')
        .select('email');

      if (reserveError) throw reserveError;

      const reserveEmails = reserveUsers?.map(ru => ru.email.toLowerCase().trim()) || [];

      // Then count donors excluding those in reserve_users
      const { data: allDonors, error: donorsError } = await supabase
        .from('donors')
        .select('email');

      if (donorsError) throw donorsError;

      // Filter out donors whose email matches reserve users
      const verifiedDonors = allDonors?.filter(
        donor => !reserveEmails.includes(donor.email.toLowerCase().trim())
      ) || [];

      return verifiedDonors.length;
    },
  });

  // Get count of verified donors with linked auth accounts (excluding reserve users)
  const { data: authenticatedCount, isLoading: isLoadingAuthenticated } = useQuery({
    queryKey: ['authenticated-verified-donors-count'],
    queryFn: async () => {
      // First get all reserve user emails
      const { data: reserveUsers, error: reserveError } = await supabase
        .from('reserve_users')
        .select('email');

      if (reserveError) throw reserveError;

      const reserveEmails = reserveUsers?.map(ru => ru.email.toLowerCase().trim()) || [];

      // Then get donors with auth accounts
      const { data: authDonors, error: donorsError } = await supabase
        .from('donors')
        .select('email, auth_user_id')
        .not('auth_user_id', 'is', null);

      if (donorsError) throw donorsError;

      // Filter out donors whose email matches reserve users
      const verifiedAuthDonors = authDonors?.filter(
        donor => !reserveEmails.includes(donor.email.toLowerCase().trim())
      ) || [];

      return verifiedAuthDonors.length;
    },
  });

  // Get total amount raised with aggressive caching
  const { data: totalRaised, isLoading: isLoadingRaised } = useQuery({
    queryKey: ['total-raised'],
    queryFn: async () => {
      const { count: pledgeCount, error: countError } = await supabase
        .from('pledges')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      
      console.log('Total pledges in database:', pledgeCount);

      let allPledges = [];
      let from = 0;
      const batchSize = 1000;
      
      while (true) {
        const { data: batch, error: batchError } = await supabase
          .from('pledges')
          .select('amount')
          .range(from, from + batchSize - 1);

        if (batchError) throw batchError;
        
        if (batch.length === 0) break;
        
        allPledges.push(...batch);
        from += batchSize;
        
        console.log(`Fetched ${allPledges.length} pledges so far...`);
      }

      console.log('Total pledges fetched:', allPledges.length);
      
      const total = allPledges.reduce((sum, pledge) => {
        const amount = Number(pledge.amount);
        return sum + amount;
      }, 0);
      
      console.log('Final total raised:', total);
      return total;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    totalCount: totalCount || 0,
    authenticatedCount: authenticatedCount || 0,
    totalRaised,
    isLoadingTotal,
    isLoadingAuthenticated,
    isLoadingRaised,
  };
};
