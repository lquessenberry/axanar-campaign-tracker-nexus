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
      if (!user) throw new Error('User not authenticated');
      
      console.log('🔄 Starting address update for user:', user.id);
      
      // Get donor record
      const { data: donor, error: donorError } = await supabase
        .from('donors')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (donorError) {
        console.error('❌ Error fetching donor:', donorError);
        throw donorError;
      }

      console.log('✅ Found donor record:', donor.id);

      // Check if address exists
      const { data: existingAddress } = await supabase
        .from('addresses')
        .select('id')
        .eq('donor_id', donor.id)
        .eq('is_primary', true)
        .maybeSingle();

      const addressPayload = {
        ...addressData,
        donor_id: donor.id,
        is_primary: true,
      };

      if (existingAddress) {
        console.log('🔄 Updating existing address:', existingAddress.id);
        // Update existing address
        const { data, error } = await supabase
          .from('addresses')
          .update(addressPayload)
          .eq('id', existingAddress.id)
          .select()
          .single();

        if (error) {
          console.error('❌ Error updating address:', error);
          throw error;
        }
        console.log('✅ Address updated successfully');
        return data;
      } else {
        console.log('🔄 Creating new address');
        // Create new address
        const { data, error } = await supabase
          .from('addresses')
          .insert(addressPayload)
          .select()
          .single();

        if (error) {
          console.error('❌ Error creating address:', error);
          throw error;
        }
        console.log('✅ Address created successfully');
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