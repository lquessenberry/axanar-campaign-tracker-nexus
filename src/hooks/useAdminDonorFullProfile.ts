import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Comprehensive types for the God View
export interface AdminDonorProfile {
  // Core donor info
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  donor_name: string | null;
  auth_user_id: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string | null;
  updated_at: string | null;
  source: string | null;
  source_platform: string | null;
  donor_tier: string | null;
  deleted: boolean | null;
  admin: boolean | null;
}

export interface AdminPledge {
  id: string;
  amount: number;
  status: string | null;
  created_at: string;
  campaign_id: string;
  reward_id: string | null;
  shipping_status: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  tracking_number: string | null;
  shipping_notes: string | null;
  campaign: {
    id: string;
    name: string;
    provider: string | null;
  } | null;
  reward: {
    id: string;
    name: string;
    description: string | null;
    minimum_amount: number | null;
    is_physical: boolean | null;
  } | null;
}

export interface AdminAddress {
  id: string;
  donor_id: string;
  address1: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  phone: string | null;
  is_primary: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminAuditEntry {
  id: string;
  action: string;
  created_at: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  changed_by_admin_id: string | null;
  source: 'address_change' | 'admin_action';
}

export interface AdminProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  background_url: string | null;
  show_avatar_publicly: boolean | null;
  show_real_name_publicly: boolean | null;
}

export interface AdminDonorFullData {
  donor: AdminDonorProfile | null;
  profile: AdminProfile | null;
  pledges: AdminPledge[];
  addresses: AdminAddress[];
  auditLog: AdminAuditEntry[];
  stats: {
    totalDonated: number;
    pledgeCount: number;
    campaignsSupported: number;
    firstPledgeDate: string | null;
    lastPledgeDate: string | null;
    physicalRewardsCount: number;
    digitalPerksCount: number;
    addressCount: number;
    hasAuthAccount: boolean;
    memberSince: string | null;
  };
}

export const useAdminDonorFullProfile = (donorId: string | null) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-donor-full-profile', donorId],
    queryFn: async (): Promise<AdminDonorFullData> => {
      if (!user || !donorId) {
        throw new Error('Missing user or donor ID');
      }

      // Verify admin access
      const { data: isAdmin, error: adminError } = await supabase.rpc('check_current_user_is_admin');
      if (adminError || !isAdmin) {
        throw new Error('Admin access required');
      }

      // Fetch donor data - try both donor ID and auth_user_id
      let donorData: AdminDonorProfile | null = null;
      
      // First try as donor ID
      const { data: donorById } = await supabase
        .from('donors')
        .select('*')
        .eq('id', donorId)
        .maybeSingle();
      
      if (donorById) {
        donorData = donorById as AdminDonorProfile;
      } else {
        // Try as auth_user_id
        const { data: donorByAuth } = await supabase
          .from('donors')
          .select('*')
          .eq('auth_user_id', donorId)
          .maybeSingle();
        
        if (donorByAuth) {
          donorData = donorByAuth as AdminDonorProfile;
        }
      }

      if (!donorData) {
        return {
          donor: null,
          profile: null,
          pledges: [],
          addresses: [],
          auditLog: [],
          stats: {
            totalDonated: 0,
            pledgeCount: 0,
            campaignsSupported: 0,
            firstPledgeDate: null,
            lastPledgeDate: null,
            physicalRewardsCount: 0,
            digitalPerksCount: 0,
            addressCount: 0,
            hasAuthAccount: false,
            memberSince: null,
          },
        };
      }

      const actualDonorId = donorData.id;

      // Fetch all data in parallel for performance
      const [profileResult, pledgesResult, addressesResult, addressLogResult, adminAuditResult] = await Promise.all([
        // Profile data (if linked auth account)
        donorData.auth_user_id
          ? supabase
              .from('profiles')
              .select('id, full_name, username, bio, avatar_url, background_url, show_avatar_publicly, show_real_name_publicly')
              .eq('id', donorData.auth_user_id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
        
        // Pledges with campaigns and rewards
        supabase
          .from('pledges')
          .select(`
            id, amount, status, created_at, campaign_id, reward_id,
            shipping_status, shipped_at, delivered_at, tracking_number, shipping_notes,
            campaigns:campaign_id (id, name, provider),
            rewards:reward_id (id, name, description, minimum_amount, is_physical)
          `)
          .eq('donor_id', actualDonorId)
          .order('created_at', { ascending: false }),
        
        // Addresses
        supabase
          .from('addresses')
          .select('*')
          .eq('donor_id', actualDonorId)
          .order('is_primary', { ascending: false }),
        
        // Address change log (last 20)
        supabase
          .from('address_change_log')
          .select('id, action, created_at, old_values, new_values, changed_by_admin_id')
          .eq('donor_id', actualDonorId)
          .order('created_at', { ascending: false })
          .limit(20),
        
        // Admin action audit (last 20)
        supabase
          .from('admin_action_audit')
          .select('id, action_type, created_at, old_values, new_values, admin_user_id')
          .eq('target_id', actualDonorId)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      // Process pledges
      const pledges: AdminPledge[] = (pledgesResult.data || []).map((p: Record<string, unknown>) => ({
        id: p.id as string,
        amount: Number(p.amount),
        status: p.status as string | null,
        created_at: p.created_at as string,
        campaign_id: p.campaign_id as string,
        reward_id: p.reward_id as string | null,
        shipping_status: p.shipping_status as string | null,
        shipped_at: p.shipped_at as string | null,
        delivered_at: p.delivered_at as string | null,
        tracking_number: p.tracking_number as string | null,
        shipping_notes: p.shipping_notes as string | null,
        campaign: p.campaigns as AdminPledge['campaign'],
        reward: p.rewards as AdminPledge['reward'],
      }));

      // Calculate stats
      const totalDonated = pledges.reduce((sum, p) => sum + p.amount, 0);
      const uniqueCampaigns = new Set(pledges.map(p => p.campaign_id));
      const physicalRewards = pledges.filter(p => p.reward?.is_physical).length;
      const digitalPerks = pledges.filter(p => p.reward && !p.reward.is_physical).length;
      
      const pledgeDates = pledges.map(p => new Date(p.created_at).getTime()).filter(d => !isNaN(d));
      const firstPledgeDate = pledgeDates.length > 0 ? new Date(Math.min(...pledgeDates)).toISOString() : null;
      const lastPledgeDate = pledgeDates.length > 0 ? new Date(Math.max(...pledgeDates)).toISOString() : null;

      // Combine audit logs
      const auditLog: AdminAuditEntry[] = [
        ...(addressLogResult.data || []).map((entry: Record<string, unknown>) => ({
          id: entry.id as string,
          action: entry.action as string,
          created_at: entry.created_at as string,
          old_values: entry.old_values as Record<string, unknown> | null,
          new_values: entry.new_values as Record<string, unknown> | null,
          changed_by_admin_id: entry.changed_by_admin_id as string | null,
          source: 'address_change' as const,
        })),
        ...(adminAuditResult.data || []).map((entry: Record<string, unknown>) => ({
          id: entry.id as string,
          action: entry.action_type as string,
          created_at: entry.created_at as string,
          old_values: entry.old_values as Record<string, unknown> | null,
          new_values: entry.new_values as Record<string, unknown> | null,
          changed_by_admin_id: entry.admin_user_id as string | null,
          source: 'admin_action' as const,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return {
        donor: donorData,
        profile: profileResult.data as AdminProfile | null,
        pledges,
        addresses: (addressesResult.data || []) as AdminAddress[],
        auditLog,
        stats: {
          totalDonated,
          pledgeCount: pledges.length,
          campaignsSupported: uniqueCampaigns.size,
          firstPledgeDate,
          lastPledgeDate,
          physicalRewardsCount: physicalRewards,
          digitalPerksCount: digitalPerks,
          addressCount: (addressesResult.data || []).length,
          hasAuthAccount: !!donorData.auth_user_id,
          memberSince: donorData.created_at,
        },
      };
    },
    enabled: !!user && !!donorId,
    staleTime: 30000, // 30 seconds
    retry: 1,
  });
};

// Search hook with fuzzy matching
export const useAdminDonorSearch = (searchTerm: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-donor-search', searchTerm],
    queryFn: async () => {
      if (!user || !searchTerm || searchTerm.length < 2) return [];

      const { data: isAdmin } = await supabase.rpc('check_current_user_is_admin');
      if (!isAdmin) throw new Error('Admin access required');

      // Search donors with fuzzy matching using ILIKE
      const { data: donors, error } = await supabase
        .from('donors')
        .select(`
          id, email, first_name, last_name, full_name, donor_name, 
          auth_user_id, username, avatar_url, created_at
        `)
        .or(`
          email.ilike.%${searchTerm}%,
          first_name.ilike.%${searchTerm}%,
          last_name.ilike.%${searchTerm}%,
          full_name.ilike.%${searchTerm}%,
          donor_name.ilike.%${searchTerm}%,
          username.ilike.%${searchTerm}%
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return donors || [];
    },
    enabled: !!user && !!searchTerm && searchTerm.length >= 2,
    staleTime: 10000,
  });
};
