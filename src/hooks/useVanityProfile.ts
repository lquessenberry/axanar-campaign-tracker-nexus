import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProfileData, Pledge } from '@/types/profile';

interface VanityProfileResult {
  profile: ProfileData | null;
  pledges: Pledge[];
  sourceType: 'profile' | 'donor';
}

export const useVanityProfile = (username: string) => {
  return useQuery<VanityProfileResult>({
    queryKey: ['vanity-profile', username],
    queryFn: async () => {
      if (!username) throw new Error('No username provided');

      // First try to get user by username from profiles
      const { data: profileData, error: profileError } = await supabase.rpc('get_user_by_username', {
        lookup_username: username
      });

      if (profileError) throw profileError;

      // If profile found
      if (profileData?.[0]) {
        const profile = profileData[0];
        const userId = profile.user_id;
        
        // Get donor IDs for this user
        const { data: donorIds } = await supabase
          .from('donors')
          .select('id')
          .eq('auth_user_id', userId);

        // Get pledges with rewards
        const { data: pledges } = await supabase
          .from('pledges')
          .select(`
            id,
            amount,
            created_at,
            reward_id,
            shipping_status,
            shipped_at,
            delivered_at,
            tracking_number,
            shipping_notes,
            campaigns:campaign_id (
              name,
              provider,
              start_date
            ),
            rewards:reward_id (
              name,
              description,
              is_physical,
              requires_shipping
            )
          `)
          .in('donor_id', donorIds?.map(d => d.id) || []);

        return {
          profile: profile as ProfileData,
          pledges: pledges || [],
          sourceType: (profile.source_type || 'profile') as 'profile' | 'donor',
        };
      }

      // If no profile found, try to find by donor with matching username
      const { data: donorData } = await supabase
        .from('donors')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (donorData) {
        // Get pledges for this donor with rewards
        const { data: pledges } = await supabase
          .from('pledges')
          .select(`
            id,
            amount,
            created_at,
            reward_id,
            shipping_status,
            shipped_at,
            delivered_at,
            tracking_number,
            shipping_notes,
            campaigns:campaign_id (
              name,
              provider,
              start_date
            ),
            rewards:reward_id (
              name,
              description,
              is_physical,
              requires_shipping
            )
          `)
          .eq('donor_id', donorData.id);

        return {
          profile: {
            ...donorData,
            id: donorData.id,
            user_id: donorData.auth_user_id || donorData.id,
            username: donorData.username,
            display_name: donorData.donor_name || donorData.full_name,
            full_name: donorData.full_name,
            bio: donorData.bio,
            avatar_url: donorData.avatar_url,
            created_at: donorData.created_at,
            email: donorData.email,
          } as ProfileData,
          pledges: pledges || [],
          sourceType: 'donor' as const,
        };
      }

      // No profile or donor found - return null
      return {
        profile: null,
        pledges: [],
        sourceType: 'profile' as const,
      };
    },
    enabled: !!username,
  });
};