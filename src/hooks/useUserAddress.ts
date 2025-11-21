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
      
      // Validate required fields
      if (!addressData.address1 || !addressData.city || !addressData.state || 
          !addressData.postal_code || !addressData.country) {
        console.error('❌ Missing required address fields');
        throw new Error('Please fill in all required fields (Address, City, State, Postal Code, Country)');
      }
      
      // Get donor record
      console.log('🔍 Fetching donor record for auth_user_id:', user.id);
      const { data: donor, error: donorError } = await supabase
        .from('donors')
        .select('id, email')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (donorError) {
        console.error('❌ Error fetching donor:', donorError);
        throw new Error(`Failed to find your donor account: ${donorError.message}`);
      }

      if (!donor) {
        console.error('❌ No donor record found for user:', user.id);
        throw new Error('Your donor account could not be found. Please contact support.');
      }

      console.log('✅ Found donor record:', donor.id, donor.email);

      // Check if address exists
      console.log('🔍 Checking for existing address...');
      const { data: existingAddress, error: checkError } = await supabase
        .from('addresses')
        .select('id, address1, city, state')
        .eq('donor_id', donor.id)
        .eq('is_primary', true)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Error checking for existing address:', checkError);
        throw new Error(`Failed to check existing address: ${checkError.message}`);
      }

      const addressPayload = {
        address1: addressData.address1.trim(),
        address2: addressData.address2?.trim() || null,
        city: addressData.city.trim(),
        state: addressData.state.trim(),
        postal_code: addressData.postal_code.trim(),
        country: addressData.country.trim(),
        phone: addressData.phone?.trim() || null,
        donor_id: donor.id,
        is_primary: true,
      };

      if (existingAddress) {
        console.log('🔄 Updating existing address:', existingAddress.id);
        console.log('📦 Update payload:', addressPayload);
        
        const { data, error } = await supabase
          .from('addresses')
          .update(addressPayload)
          .eq('id', existingAddress.id)
          .select()
          .single();

        if (error) {
          console.error('❌ Error updating address:', error);
          console.error('Full error details:', JSON.stringify(error, null, 2));
          throw new Error(`Failed to update address: ${error.message}`);
        }
        
        console.log('✅ Address updated successfully:', data);
        return data;
      } else {
        console.log('➕ Creating new address for donor:', donor.id);
        console.log('📦 Insert payload:', addressPayload);
        
        const { data, error } = await supabase
          .from('addresses')
          .insert(addressPayload)
          .select()
          .single();

        if (error) {
          console.error('❌ Error creating address:', error);
          console.error('Full error details:', JSON.stringify(error, null, 2));
          
          // Provide more specific error messages
          if (error.code === 'PGRST301') {
            throw new Error('Permission denied. Please contact support if this persists.');
          } else if (error.code === '23505') {
            throw new Error('An address already exists for this account.');
          } else {
            throw new Error(`Failed to save address: ${error.message}`);
          }
        }
        
        console.log('✅ Address created successfully:', data);
        return data;
      }
    },
    onSuccess: (data) => {
      console.log('✅ Address update mutation succeeded, invalidating cache');
      queryClient.invalidateQueries({ queryKey: ['user-address', user?.id] });
      queryClient.setQueryData(['user-address', user?.id], data);
    },
    onError: (error) => {
      console.error('❌ Address update mutation failed:', error);
    },
  });
};