import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Address, CreateAddressInput, UpdateAddressInput } from '@/types/address';
import { useAuth } from '@/contexts/AuthContext';

export const useAddressOperations = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createAddress = useMutation({
    mutationFn: async (addressData: CreateAddressInput) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('addresses')
        .insert({
          donor_id: addressData.donorId,
          address1: addressData.address1,
          address2: addressData.address2 || null,
          city: addressData.city,
          state: addressData.state,
          postal_code: addressData.postal_code,
          country: addressData.country,
          phone: addressData.phone || null,
          is_primary: addressData.is_primary || true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donor-addresses', user?.id] });
    }
  });

  const updateAddress = useMutation({
    mutationFn: async (addressData: UpdateAddressInput) => {
      if (!user) throw new Error('User not authenticated');
      
      const updates: Record<string, string | boolean | null> = {
        updated_at: new Date().toISOString()
      };
      
      // Only include fields that are provided
      if (addressData.address1 !== undefined) updates.address1 = addressData.address1;
      if (addressData.address2 !== undefined) updates.address2 = addressData.address2;
      if (addressData.city !== undefined) updates.city = addressData.city;
      if (addressData.state !== undefined) updates.state = addressData.state;
      if (addressData.postal_code !== undefined) updates.postal_code = addressData.postal_code;
      if (addressData.country !== undefined) updates.country = addressData.country;
      if (addressData.phone !== undefined) updates.phone = addressData.phone;
      if (addressData.is_primary !== undefined) updates.is_primary = addressData.is_primary;
      
      const { data, error } = await supabase
        .from('addresses')
        .update(updates)
        .eq('id', addressData.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donor-addresses', user?.id] });
    }
  });

  const deleteAddress = useMutation({
    mutationFn: async (addressId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;
      return addressId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donor-addresses', user?.id] });
    }
  });

  return {
    createAddress,
    updateAddress,
    deleteAddress,
    isLoading: createAddress.isPending || updateAddress.isPending || deleteAddress.isPending
  };
};

export const useDonorAddresses = (donorId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['donor-addresses', user?.id],
    queryFn: async (): Promise<Address[]> => {
      if (!user || !donorId) throw new Error('User not authenticated or donor ID not provided');
      
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('donor_id', donorId)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!donorId,
  });
};
