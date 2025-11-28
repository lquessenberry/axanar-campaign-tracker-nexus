import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UserSupportContext {
  // Auth & Identity
  userId: string;
  email: string | null;
  isAuthenticated: boolean;
  
  // Donor Linkage
  donorId: string | null;
  donorLinked: boolean;
  donorEmail: string | null;
  donorName: string | null;
  
  // Pledge History
  pledgeCount: number;
  totalPledged: number;
  campaigns: Array<{
    name: string;
    amount: number;
    date: string;
  }>;
  
  // Address Status
  hasAddress: boolean;
  addressComplete: boolean;
  addressCity: string | null;
  addressState: string | null;
  addressCountry: string | null;
  
  // Forum Activity
  threadCount: number;
  commentCount: number;
  
  // Platform History
  platforms: {
    kickstarter: boolean;
    indiegogo: boolean;
    paypal: boolean;
    woocommerce: boolean;
    patreon: boolean;
  };
  
  // Account Metadata
  memberSince: string | null;
  lastActivity: string | null;
}

export const useUserSupportContext = (userId?: string) => {
  return useQuery({
    queryKey: ['userSupportContext', userId],
    queryFn: async (): Promise<UserSupportContext | null> => {
      if (!userId) return null;

      // Fetch user auth info
      const { data: authUser } = await supabase.auth.admin.getUserById(userId);
      
      // Fetch donor record
      const { data: donor } = await supabase
        .from('donors')
        .select('id, email, full_name, created_at, source, source_platform')
        .eq('auth_user_id', userId)
        .maybeSingle();

      // Fetch pledge data
      const { data: pledges } = await supabase
        .from('pledges')
        .select(`
          amount,
          created_at,
          campaigns (
            name
          )
        `)
        .eq('donor_id', donor?.id || '')
        .order('created_at', { ascending: false });

      const totalPledged = pledges?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;

      // Fetch address
      const { data: address } = await supabase
        .from('addresses')
        .select('address1, city, state, country, postal_code')
        .eq('donor_id', donor?.id || '')
        .eq('is_primary', true)
        .maybeSingle();

      // Fetch forum activity
      const { count: threadCount } = await supabase
        .from('forum_threads')
        .select('*', { count: 'exact', head: true })
        .eq('author_user_id', userId);

      const { count: commentCount } = await supabase
        .from('forum_comments')
        .select('*', { count: 'exact', head: true })
        .eq('author_user_id', userId);

      // Determine platforms from source data
      const platforms = {
        kickstarter: donor?.source === 'kickstarter' || donor?.source_platform === 'kickstarter',
        indiegogo: donor?.source === 'indiegogo' || donor?.source_platform === 'indiegogo',
        paypal: donor?.source === 'paypal' || donor?.source_platform === 'paypal',
        woocommerce: false, // Future integration
        patreon: false // Future integration
      };

      return {
        userId,
        email: authUser?.user?.email || null,
        isAuthenticated: true,
        
        donorId: donor?.id || null,
        donorLinked: !!donor,
        donorEmail: donor?.email || null,
        donorName: donor?.full_name || null,
        
        pledgeCount: pledges?.length || 0,
        totalPledged,
        campaigns: (pledges || []).map(p => ({
          name: (p.campaigns as any)?.name || 'Unknown',
          amount: Number(p.amount) || 0,
          date: p.created_at || ''
        })),
        
        hasAddress: !!address,
        addressComplete: !!(address?.address1 && address?.city && address?.state && address?.postal_code),
        addressCity: address?.city || null,
        addressState: address?.state || null,
        addressCountry: address?.country || null,
        
        threadCount: threadCount || 0,
        commentCount: commentCount || 0,
        
        platforms,
        
        memberSince: authUser?.user?.created_at || donor?.created_at || null,
        lastActivity: authUser?.user?.last_sign_in_at || null
      };
    },
    enabled: !!userId,
    staleTime: 30000 // 30 seconds
  });
};
