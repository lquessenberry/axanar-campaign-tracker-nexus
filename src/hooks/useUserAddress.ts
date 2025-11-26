import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Address {
  id?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_primary?: boolean;
}

export const useUserAddress = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-address', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      // Get donor record first
      const { data: donor, error: donorError } = await supabase
        .from('donors')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (donorError) throw donorError;
      if (!donor) return null;

      // Get primary address
      const { data: address, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('donor_id', donor.id)
        .eq('is_primary', true)
        .maybeSingle();

      if (error) throw error;
      return address;
    },
    enabled: !!user,
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (addressData: Address) => {
      if (!user) {
        console.error('❌ No authenticated user');
        throw new Error('You must be logged in to update your address');
      }
      
      console.log('🔄 Starting address update for user:', user.id);
      console.log('📦 Address data:', addressData);
      
      // Validate required fields client-side
      if (!addressData.address1?.trim() || !addressData.city?.trim() || 
          !addressData.state?.trim() || !addressData.postal_code?.trim() || 
          !addressData.country?.trim()) {
        console.error('❌ Missing required address fields');
        throw new Error('Please fill in all required fields');
      }
      
      // First verify donor record exists
      const { data: donorCheck, error: donorError } = await supabase
        .from('donors')
        .select('id, email, full_name')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      
      if (donorError) {
        console.error('❌ Error checking donor record:', donorError);
        throw new Error('Failed to verify your donor account. Please contact support.');
      }
      
      if (!donorCheck) {
        console.error('❌ No donor record found for auth user:', user.id);
        console.error('User email:', user.email);
        throw new Error('No donor account linked to your login. Please contact support with your email address.');
      }
      
      console.log('✅ Donor record verified:', donorCheck.id, donorCheck.email);
      
      // Call the secure database function
      const { data, error } = await supabase.rpc('upsert_user_address', {
        p_address1: addressData.address1,
        p_city: addressData.city,
        p_state: addressData.state,
        p_postal_code: addressData.postal_code,
        p_country: addressData.country,
        p_address2: addressData.address2 || null,
        p_phone: addressData.phone || null,
      });

      if (error) {
        console.error('❌ Error from upsert function:', error);
        throw new Error(error.message || 'Failed to save address');
      }
      
      console.log('✅ Address saved successfully');
      
      // Return the full address object for optimistic update
      return {
        address1: addressData.address1,
        address2: addressData.address2 || null,
        city: addressData.city,
        state: addressData.state,
        postal_code: addressData.postal_code,
        country: addressData.country,
        phone: addressData.phone || null,
        is_primary: true,
      };
    },
    onSuccess: (data) => {
      console.log('✅ Address update mutation succeeded, updating cache immediately');
      // Immediately update the cache with the new data
      queryClient.setQueryData(['user-address', user?.id], data);
      // Invalidate to trigger a background refetch for consistency
      queryClient.invalidateQueries({ queryKey: ['user-address', user?.id] });
    },
    onError: (error) => {
      console.error('❌ Address update mutation failed:', error);
    },
  });
};