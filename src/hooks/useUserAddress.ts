import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';

const addressSchema = z.object({
  address1: z.string().trim().min(1, "Address is required").max(200, "Address too long"),
  address2: z.string().trim().max(200, "Address line 2 too long").optional(),
  city: z.string().trim().min(1, "City is required").max(100, "City name too long"),
  state: z.string().trim().min(1, "State/Province is required").max(100, "State name too long"),
  postal_code: z.string().trim().min(1, "Postal code is required").max(20, "Postal code too long"),
  country: z.string().trim().min(1, "Country is required").max(100, "Country name too long"),
  phone: z.string().trim().max(20, "Phone number too long").optional(),
});

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
      
      // Validate input with zod schema
      const validationResult = addressSchema.safeParse(addressData);
      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        console.error('❌ Validation failed:', validationResult.error);
        throw new Error(firstError.message);
      }
      
      const validatedData = validationResult.data;
      console.log('📦 Validated address data:', validatedData);
      
      // Call the secure database function
      console.log('📡 Calling upsert_user_address RPC...');
      const { data: rpcResult, error: rpcError } = await supabase.rpc('upsert_user_address', {
        p_address1: validatedData.address1,
        p_city: validatedData.city,
        p_state: validatedData.state,
        p_postal_code: validatedData.postal_code,
        p_country: validatedData.country,
        p_address2: validatedData.address2 || null,
        p_phone: validatedData.phone || null,
      });

      if (rpcError) {
        console.error('❌ RPC function failed:', rpcError);
        console.error('RPC error details:', JSON.stringify(rpcError, null, 2));
        throw new Error(
          rpcError.message || 'Failed to save address to database. Please try again or contact axanartech@gmail.com'
        );
      }
      
      if (!rpcResult) {
        console.error('❌ RPC returned no data');
        throw new Error('Address save returned no confirmation. Please refresh and verify your address was saved.');
      }
      
      console.log('✅ RPC succeeded:', rpcResult);
      
      // VERIFICATION: Refetch donor and address from database to confirm save
      console.log('🔍 Verification: Fetching donor record and address...');
      const { data: donor, error: donorError } = await supabase
        .from('donors')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      
      if (donorError || !donor) {
        console.error('❌ Verification failed: Could not fetch donor record');
        throw new Error('Your account is not linked to a donor record. Please contact axanartech@gmail.com');
      }
      
      const { data: verifiedAddress, error: verifyError } = await supabase
        .from('addresses')
        .select('*')
        .eq('donor_id', donor.id)
        .eq('is_primary', true)
        .maybeSingle();
      
      if (verifyError) {
        console.warn('⚠️ Verification failed:', verifyError);
        // Don't throw - save might have succeeded even if verification fails
      }
      
      if (!verifiedAddress) {
        console.error('❌ Verification failed: Address not found in database after save');
        throw new Error('Address save could not be verified. Please refresh the page and check if your address was saved.');
      }
      
      console.log('✅ Verification passed: Address confirmed in database:', verifiedAddress);
      
      // Return verified address from database
      return verifiedAddress;
    },
    onSuccess: (verifiedAddress) => {
      console.log('✅ Address update mutation succeeded');
      console.log('📥 Updating cache with verified address from database');
      
      // Update cache with database-verified address
      queryClient.setQueryData(['user-address', user?.id], verifiedAddress);
      
      // Invalidate to trigger background refetch for consistency
      queryClient.invalidateQueries({ 
        queryKey: ['user-address', user?.id],
        exact: true 
      });
    },
    onError: (error) => {
      console.error('❌ Address update mutation failed:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    },
  });
};