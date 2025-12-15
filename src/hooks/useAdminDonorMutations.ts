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

  // Send email to donor
  const sendEmail = useMutation({
    mutationFn: async (data: EmailData) => {
      if (!donorId) throw new Error('No donor ID');
      
      // Get donor email
      const { data: donor } = await supabase
        .from('donors')
        .select('email')
        .eq('id', donorId)
        .single();

      if (!donor?.email) throw new Error('Donor email not found');

      // Call edge function to send email
      const { error } = await supabase.functions.invoke('send-admin-email', {
        body: { to: donor.email, subject: data.subject, message: data.message },
      });

      if (error) throw error;

      await logAdminAction('send_email', donorId, null, { subject: data.subject }, true);
      return { success: true };
    },
    onSuccess: () => {
      toast({ title: 'Email Sent', description: 'Message sent to donor.' });
    },
    onError: (error) => {
      toast({ title: 'Send Failed', description: 'Could not send email.', variant: 'destructive' });
      console.error('Send email error:', error);
    },
  });

  // Link donor to auth account
  const linkAccount = useMutation({
    mutationFn: async (authEmail: string) => {
      if (!donorId) throw new Error('No donor ID');

      // Find donor by email to get their auth_user_id if they have one
      const { data: existingDonor, error: lookupError } = await supabase
        .from('donors')
        .select('id, auth_user_id')
        .eq('email', authEmail)
        .single();

      if (lookupError && lookupError.code !== 'PGRST116') {
        throw new Error('Error looking up account');
      }

      // If we found a donor with that email and they have an auth_user_id, use it
      let authUserId = existingDonor?.auth_user_id;
      
      if (!authUserId) {
        throw new Error('No auth account found with that email. User may need to create an account first.');
      }

      // Update donor with auth_user_id
      const { error } = await supabase
        .from('donors')
        .update({ auth_user_id: authUserId, updated_at: new Date().toISOString() })
        .eq('id', donorId);

      if (error) throw error;

      await logAdminAction('link_account', donorId, null, { auth_user_id: authUserId }, true);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-donor-full-profile', donorId] });
      toast({ title: 'Account Linked', description: 'Donor linked to auth account.' });
    },
    onError: (error) => {
      toast({ title: 'Link Failed', description: error.message || 'Could not link account.', variant: 'destructive' });
      console.error('Link account error:', error);
    },
  });

  // Toggle donor deleted status (ban/activate)
  const toggleDonorStatus = useMutation({
    mutationFn: async (setDeleted: boolean) => {
      if (!donorId) throw new Error('No donor ID');

      const { data: updated, error } = await supabase
        .from('donors')
        .update({ deleted: setDeleted, updated_at: new Date().toISOString() })
        .eq('id', donorId)
        .select()
        .single();

      if (error) throw error;

      await logAdminAction(setDeleted ? 'ban_donor' : 'activate_donor', donorId, null, { deleted: setDeleted }, true);
      return updated;
    },
    onSuccess: (_, setDeleted) => {
      queryClient.invalidateQueries({ queryKey: ['admin-donor-full-profile', donorId] });
      toast({ 
        title: setDeleted ? 'Account Banned' : 'Account Activated', 
        description: setDeleted ? 'Donor access has been disabled.' : 'Donor access has been restored.' 
      });
    },
    onError: (error) => {
      toast({ title: 'Update Failed', description: 'Could not change account status.', variant: 'destructive' });
      console.error('Toggle status error:', error);
    },
  });

  // Resend verification email
  const resendVerification = useMutation({
    mutationFn: async () => {
      if (!donorId) throw new Error('No donor ID');

      const { data: donor } = await supabase
        .from('donors')
        .select('email, auth_user_id')
        .eq('id', donorId)
        .single();

      if (!donor?.auth_user_id) throw new Error('Donor has no linked auth account');

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: donor.email,
      });

      if (error) throw error;

      await logAdminAction('resend_verification', donorId, null, { email: donor.email }, true);
      return { success: true };
    },
    onSuccess: () => {
      toast({ title: 'Verification Sent', description: 'Email verification link sent.' });
    },
    onError: (error) => {
      toast({ title: 'Send Failed', description: 'Could not send verification.', variant: 'destructive' });
      console.error('Resend verification error:', error);
    },
  });

  // Set primary address (alias for compatibility)
  const setPrimaryAddress = setAddressPrimary;

  return {
    updateDonor,
    updatePledge,
    createPledge,
    deletePledge,
    updateAddress,
    createAddress,
    deleteAddress,
    setAddressPrimary,
    setPrimaryAddress,
    bulkUpdatePledges,
    sendEmail,
    linkAccount,
    toggleDonorStatus,
    resendVerification,
  };
};
