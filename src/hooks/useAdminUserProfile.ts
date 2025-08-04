import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface DonorData {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  donor_name: string | null;
  auth_user_id: string | null;
}

export const useAdminUserProfile = (userId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-user-profile', userId],
    queryFn: async (): Promise<{ profile: UserProfile | null; donor: DonorData | null }> => {
      if (!user) throw new Error('Not authenticated');
      if (!userId) return { profile: null, donor: null };

      console.log('🔍 Fetching profile for user ID:', userId);

      try {
        // First check if current user is admin
        const { data: isAdmin, error: adminError } = await supabase.rpc('check_current_user_is_admin');
        if (adminError) {
          console.error('❌ Admin check error:', adminError);
          throw new Error('Admin check failed');
        }
        if (!isAdmin) {
          console.error('❌ Not admin');
          throw new Error('Admin access required');
        }

        console.log('✅ Admin access confirmed');

        // Try to get profile data first (assuming userId is an auth user ID)
        console.log('🔍 Checking for auth user profile...');
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) {
          console.error('❌ Profile fetch error:', profileError);
        }

        if (profile) {
          console.log('✅ Found auth user profile:', profile);
          // Get donor data linked to this auth user
          const { data: donor, error: donorError } = await supabase
            .from('donors')
            .select('*')
            .eq('auth_user_id', userId)
            .maybeSingle();

          if (donorError) {
            console.error('❌ Donor fetch error:', donorError);
          } else {
            console.log('📊 Associated donor data:', donor);
          }

          return { profile, donor };
        }

        // If no profile found, try treating userId as a donor ID
        console.log('🔍 No profile found, trying as donor ID...');
        const { data: donor, error: donorError } = await supabase
          .from('donors')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (donorError) {
          console.error('❌ Donor lookup error:', donorError);
          throw donorError;
        }

        if (donor) {
          console.log('✅ Found donor data:', donor);
          // If donor has auth_user_id, get the profile
          let linkedProfile = null;
          if (donor.auth_user_id) {
            console.log('🔗 Donor has auth account, fetching profile...');
            const { data: profileData, error: linkedProfileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', donor.auth_user_id)
              .maybeSingle();
            
            if (linkedProfileError) {
              console.error('❌ Linked profile error:', linkedProfileError);
            } else {
              console.log('✅ Found linked profile:', profileData);
              linkedProfile = profileData;
            }
          } else {
            console.log('ℹ️ Legacy donor - no auth account');
          }
          return { profile: linkedProfile, donor };
        }

        console.log('❌ No user or donor found with ID:', userId);
        return { profile: null, donor: null };
        
      } catch (error) {
        console.error('💥 Fatal error in useAdminUserProfile:', error);
        throw error;
      }
    },
    enabled: !!user && !!userId,
    retry: 1,
    staleTime: 30000, // 30 seconds
  });
};

export const useAdminUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      profileData, 
      donorData 
    }: { 
      userId: string; 
      profileData: Partial<UserProfile>; 
      donorData?: Partial<DonorData>;
    }) => {
      if (!user) throw new Error('Not authenticated');

      // Check admin status
      const { data: isAdmin, error: adminError } = await supabase.rpc('check_current_user_is_admin');
      if (adminError || !isAdmin) {
        throw new Error('Admin access required');
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId);

      if (profileError) {
        throw profileError;
      }

      // Update donor data if provided
      if (donorData) {
        const { error: donorError } = await supabase
          .from('donors')
          .update(donorData)
          .eq('auth_user_id', userId);

        if (donorError) {
          throw donorError;
        }
      }

      return { success: true };
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin-donors'] });
      toast.success('User profile updated successfully');
    },
    onError: (error) => {
      console.error('Error updating user profile:', error);
      toast.error('Failed to update user profile');
    },
  });
};

export const useAdminSearchUsers = (searchTerm: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-search-users', searchTerm],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      if (!searchTerm || searchTerm.length < 2) return [];

      // Check admin status
      const { data: isAdmin, error: adminError } = await supabase.rpc('check_current_user_is_admin');
      if (adminError || !isAdmin) {
        throw new Error('Admin access required');
      }

      // Search in both profiles and donors tables
      const [profilesResult, donorsResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, username')
          .or(`full_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`)
          .limit(10),
        supabase
          .from('donors')
          .select('auth_user_id, email, first_name, last_name, donor_name')
          .or(`email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,donor_name.ilike.%${searchTerm}%`)
          .not('auth_user_id', 'is', null)
          .limit(10)
      ]);

      // Combine and deduplicate results
      const users = new Map();

      // Add profile results
      profilesResult.data?.forEach(profile => {
        users.set(profile.id, {
          id: profile.id,
          name: profile.full_name || profile.username || 'Unknown User',
          email: null,
          source: 'profile'
        });
      });

      // Add donor results
      donorsResult.data?.forEach(donor => {
        if (donor.auth_user_id) {
          const existing = users.get(donor.auth_user_id);
          const name = donor.donor_name || 
                      (donor.first_name && donor.last_name ? `${donor.first_name} ${donor.last_name}` : '') ||
                      donor.first_name || 
                      donor.last_name || 
                      'Unknown User';
          
          users.set(donor.auth_user_id, {
            id: donor.auth_user_id,
            name: existing?.name || name,
            email: donor.email,
            source: existing ? 'both' : 'donor'
          });
        }
      });

      return Array.from(users.values());
    },
    enabled: !!user && !!searchTerm && searchTerm.length >= 2,
  });
};