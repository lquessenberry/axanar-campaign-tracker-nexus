import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useVanityProfile = (username: string) => {
  return useQuery({
    queryKey: ['vanity-profile', username],
    queryFn: async () => {
      if (!username) throw new Error('No username provided');

      const { data, error } = await supabase.rpc('get_user_by_username', {
        lookup_username: username
      });

      if (error) throw error;
      
      return data?.[0] || null;
    },
    enabled: !!username,
  });
};

export const usePublicProfile = (userId: string, sourceType: 'profile' | 'donor') => {
  return useQuery({
    queryKey: ['public-profile', userId, sourceType],
    queryFn: async () => {
      if (sourceType === 'profile') {
        // Get profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) throw profileError;

        // Get donor IDs for this user first
        const { data: donorIds, error: donorError } = await supabase
          .from('donors')
          .select('id')
          .eq('auth_user_id', userId);

        if (donorError) {
          console.warn('Donor fetch error:', donorError);
        }

        // Get pledge data for this user
        const { data: pledges, error: pledgesError } = await supabase
          .from('pledges')
          .select(`
            id,
            amount,
            created_at,
            campaigns:campaign_id (
              name
            )
          `)
          .in('donor_id', donorIds?.map(d => d.id) || []);

        if (pledgesError) {
          console.warn('Pledge fetch error:', pledgesError);
        }

        return {
          type: 'profile' as const,
          profile,
          pledges: pledges || [],
          campaigns: []
        };
      } else {
        // Get donor data
        const { data: donor, error: donorError } = await supabase
          .from('donors')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (donorError) throw donorError;

        // Get pledge data for this donor
        const { data: pledges, error: pledgesError } = await supabase
          .from('pledges')
          .select(`
            id,
            amount,
            created_at,
            campaigns:campaign_id (
              name
            )
          `)
          .eq('donor_id', userId);

        if (pledgesError) throw pledgesError;

        return {
          type: 'donor' as const,
          profile: donor,
          pledges: pledges || [],
          campaigns: []
        };
      }
    },
    enabled: !!userId && !!sourceType,
  });
};