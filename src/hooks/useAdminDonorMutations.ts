import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Json } from '@/integrations/supabase/types';

// Types for mutations
export interface DonorUpdateData {
  first_name?: string;
  last_name?: string;
  email?: string;
  donor_name?: string;
  bio?: string;
  username?: string;
}

export interface EmailData {
  subject: string;
  message: string;
}

export interface PledgeUpdateData {
  amount?: number;
  status?: string;
  reward_id?: string | null;
  shipping_status?: string;
  shipped_at?: string | null;
  delivered_at?: string | null;
  tracking_number?: string | null;
  shipping_notes?: string | null;
}

export interface PledgeCreateData {
  donor_id: string;
  campaign_id: string;
  amount: number;
  reward_id?: string | null;
  status?: string;
}

export interface AddressData {
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  is_primary?: boolean;
}

interface FieldError {
  field: string;
  message: string;
}

export class FieldValidationError extends Error {
  fieldErrors: FieldError[];
  
  constructor(fieldErrors: FieldError[]) {
    super(fieldErrors.map(e => `${e.field}: ${e.message}`).join(', '));
    this.fieldErrors = fieldErrors;
    this.name = 'FieldValidationError';
  }
}

export const useAdminDonorMutations = (donorId: string | null) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Helper to log admin action
  const logAdminAction = async (
    actionType: string,
    targetId: string,
    oldValues: unknown | null,
    newValues: unknown | null,
    success: boolean,
    errorMessage?: string
  ) => {
    try {
      await supabase.from('admin_action_audit').insert([{
        admin_user_id: user?.id,
        action_type: actionType,
        target_id: targetId,
        target_table: 'donors',
        old_values: oldValues as Json,
        new_values: newValues as Json,
        success,
        error_message: errorMessage,
      }]);
    } catch (err) {
      console.error('Failed to log admin action:', err);
    }
  };

  // Update donor information
  const updateDonor = useMutation({
    mutationFn: async ({ data, oldData }: { data: DonorUpdateData; oldData?: DonorUpdateData }) => {
      if (!donorId) throw new Error('No donor ID');
      
      const { data: updated, error } = await supabase
        .from('donors')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', donorId)
        .select()
        .single();

      if (error) {
        // Check for unique constraint violations
        if (error.code === '23505') {
          if (error.message.includes('email')) {
            throw new FieldValidationError([{ field: 'email', message: 'This email is already in use' }]);
          }
          if (error.message.includes('username')) {
            throw new FieldValidationError([{ field: 'username', message: 'This username is already taken' }]);
          }
        }
        throw error;
      }

      await logAdminAction('update_donor', donorId, oldData || null, data, true);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-donor-full-profile', donorId] });
      queryClient.invalidateQueries({ queryKey: ['admin-donors'] });
      toast({ title: 'Donor Updated', description: 'Changes saved successfully.' });
    },
    onError: (error) => {
      if (error instanceof FieldValidationError) {
        toast({
          title: 'Validation Error',
          description: error.fieldErrors.map(e => e.message).join(', '),
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Update Failed', description: 'Could not save changes.', variant: 'destructive' });
      }
      logAdminAction('update_donor', donorId || '', null, null, false, error.message);
    },
  });

  // Update pledge
  const updatePledge = useMutation({
    mutationFn: async ({ pledgeId, data, oldData }: { pledgeId: string; data: PledgeUpdateData; oldData?: PledgeUpdateData }) => {
      const { data: updated, error } = await supabase
        .from('pledges')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pledgeId)
        .select()
        .single();

      if (error) throw error;

      await logAdminAction('update_pledge', pledgeId, oldData || null, data, true);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-donor-full-profile', donorId] });
      toast({ title: 'Pledge Updated', description: 'Pledge changes saved.' });
    },
    onError: (error) => {
      toast({ title: 'Update Failed', description: 'Could not update pledge.', variant: 'destructive' });
      console.error('Pledge update error:', error);
    },
  });

  // Create pledge
  const createPledge = useMutation({
    mutationFn: async (data: PledgeCreateData) => {
      const { data: created, error } = await supabase
        .from('pledges')
        .insert({
          ...data,
          status: data.status || 'completed',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      await logAdminAction('create_pledge', created.id, null, data as unknown, true);
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-donor-full-profile', donorId] });
      toast({ title: 'Pledge Created', description: 'New pledge added successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Create Failed', description: 'Could not create pledge.', variant: 'destructive' });
      console.error('Pledge create error:', error);
    },
  });

  // Delete pledge
  const deletePledge = useMutation({
    mutationFn: async ({ pledgeId, oldData }: { pledgeId: string; oldData?: Record<string, unknown> }) => {
      const { error } = await supabase
        .from('pledges')
        .delete()
        .eq('id', pledgeId);

      if (error) throw error;

      await logAdminAction('delete_pledge', pledgeId, oldData || null, null, true);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-donor-full-profile', donorId] });
      toast({ title: 'Pledge Deleted', description: 'Pledge removed successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Delete Failed', description: 'Could not delete pledge.', variant: 'destructive' });
      console.error('Pledge delete error:', error);
    },
  });

  // Update address
  const updateAddress = useMutation({
    mutationFn: async ({ addressId, data, oldData }: { addressId: string; data: AddressData; oldData?: AddressData }) => {
      const { data: updated, error } = await supabase
        .from('addresses')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', addressId)
        .select()
        .single();

      if (error) throw error;

      await logAdminAction('update_address', addressId, oldData || null, data, true);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-donor-full-profile', donorId] });
      toast({ title: 'Address Updated', description: 'Address changes saved.' });
    },
    onError: (error) => {
      toast({ title: 'Update Failed', description: 'Could not update address.', variant: 'destructive' });
      console.error('Address update error:', error);
    },
  });

  // Create address
  const createAddress = useMutation({
    mutationFn: async (data: AddressData) => {
      if (!donorId) throw new Error('No donor ID');

      const { data: created, error } = await supabase
        .from('addresses')
        .insert({
          ...data,
          donor_id: donorId,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      await logAdminAction('create_address', created.id, null, data, true);
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-donor-full-profile', donorId] });
      toast({ title: 'Address Created', description: 'New address added.' });
    },
    onError: (error) => {
      toast({ title: 'Create Failed', description: 'Could not create address.', variant: 'destructive' });
      console.error('Address create error:', error);
    },
  });

  // Delete address
  const deleteAddress = useMutation({
    mutationFn: async ({ addressId, oldData }: { addressId: string; oldData?: Record<string, unknown> }) => {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;

      await logAdminAction('delete_address', addressId, oldData || null, null, true);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-donor-full-profile', donorId] });
      toast({ title: 'Address Deleted', description: 'Address removed.' });
    },
    onError: (error) => {
      toast({ title: 'Delete Failed', description: 'Could not delete address.', variant: 'destructive' });
      console.error('Address delete error:', error);
    },
  });

  // Set primary address
  const setAddressPrimary = useMutation({
    mutationFn: async (addressId: string) => {
      if (!donorId) throw new Error('No donor ID');

      // First, unset all addresses as primary
      await supabase
        .from('addresses')
        .update({ is_primary: false })
        .eq('donor_id', donorId);

      // Then set the selected address as primary
      const { data: updated, error } = await supabase
        .from('addresses')
        .update({ is_primary: true, updated_at: new Date().toISOString() })
        .eq('id', addressId)
        .select()
        .single();

      if (error) throw error;

      await logAdminAction('set_primary_address', addressId, null, { is_primary: true }, true);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-donor-full-profile', donorId] });
      toast({ title: 'Primary Address Set', description: 'Default shipping address updated.' });
    },
    onError: (error) => {
      toast({ title: 'Update Failed', description: 'Could not set primary address.', variant: 'destructive' });
      console.error('Set primary address error:', error);
    },
  });

  // Bulk update pledges (for shipping status updates)
  const bulkUpdatePledges = useMutation({
    mutationFn: async ({ pledgeIds, data }: { pledgeIds: string[]; data: Partial<PledgeUpdateData> }) => {
      const { error } = await supabase
        .from('pledges')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .in('id', pledgeIds);

      if (error) throw error;

      await logAdminAction('bulk_update_pledges', donorId || '', { pledgeIds }, data, true);
      return { success: true, count: pledgeIds.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-donor-full-profile', donorId] });
      toast({ title: 'Bulk Update Complete', description: `Updated ${result.count} pledges.` });
    },
    onError: (error) => {
      toast({ title: 'Bulk Update Failed', description: 'Could not update pledges.', variant: 'destructive' });
      console.error('Bulk update error:', error);
    },
  });

  return {
    updateDonor,
    updatePledge,
    createPledge,
    deletePledge,
    updateAddress,
    createAddress,
    deleteAddress,
    setAddressPrimary,
    bulkUpdatePledges,
  };
};
