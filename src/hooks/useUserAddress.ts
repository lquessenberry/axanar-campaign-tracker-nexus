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
      
      // PRE-FLIGHT CHECK: Verify donor record exists and is linked
      console.log('🔍 Pre-flight: Checking donor linkage...');
      const { data: donorCheck, error: donorError } = await supabase
        .from('donors')
        .select('id, email, full_name, auth_user_id')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      
      if (donorError) {
        console.error('❌ Pre-flight failed: Error checking donor record:', donorError);
        throw new Error('Failed to verify your donor account. Please contact support at axanartech@gmail.com');
      }
      
      if (!donorCheck) {
        console.error('❌ Pre-flight failed: No donor record found for auth user:', user.id);
        console.error('User email:', user.email);
        throw new Error(
          `Your account (${user.email}) is not linked to a donor record. Please contact axanartech@gmail.com with your email address to resolve this issue.`
        );
      }
      
      console.log('✅ Pre-flight passed: Donor record verified:', donorCheck.id, donorCheck.email);
      
      // Call the secure database function
      console.log('📡 Calling upsert_user_address RPC...');
      const { data: rpcResult, error: rpcError } = await supabase.rpc('upsert_user_address', {
        p_address1: addressData.address1.trim(),
        p_city: addressData.city.trim(),
        p_state: addressData.state.trim(),
        p_postal_code: addressData.postal_code.trim(),
        p_country: addressData.country.trim(),
        p_address2: addressData.address2?.trim() || null,
        p_phone: addressData.phone?.trim() || null,
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
      
      // VERIFICATION: Refetch address from database to confirm save
      console.log('🔍 Verification: Refetching address from database...');
      const { data: verifiedAddress, error: verifyError } = await supabase
        .from('addresses')
        .select('*')
        .eq('donor_id', donorCheck.id)
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