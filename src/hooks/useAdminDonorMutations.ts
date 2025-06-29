import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Types for donor-related operations
export interface DonorUpdateData {
  first_name?: string;
  last_name?: string;
  email?: string;
  donor_name?: string;
  status?: 'active' | 'banned';
}

export interface EmailData {
  subject: string;
  message: string;
}

export const useAdminDonorMutations = () => {
  const queryClient = useQueryClient();
  
  // Update donor information
  const updateDonor = useMutation({
    mutationFn: async ({ donorId, data }: { donorId: string; data: DonorUpdateData }) => {
      const { data: updatedDonor, error } = await supabase
        .from('donors')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          donor_name: data.donor_name,
          status: data.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', donorId)
        .select()
        .single();
      
      if (error) throw error;
      return updatedDonor;
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['admin-donors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-donors-stats'] });
      toast({
        title: "Donor Updated",
        description: "The donor information has been successfully updated.",
        variant: "default"
      });
    },
    onError: (error) => {
      console.error('Error updating donor:', error);
      toast({
        title: "Update Failed",
        description: "There was a problem updating the donor. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Send email to donor
  const sendDonorEmail = useMutation({
    mutationFn: async ({ donorId, email, emailData }: { donorId: string; email: string; emailData: EmailData }) => {
      // In a real implementation, this would call a Supabase Edge Function to send the email
      // For now, we'll simulate success
      
      // Example of how to call an edge function:
      // const { data, error } = await supabase.functions.invoke('send-donor-email', {
      //   body: { donorId, email, subject: emailData.subject, message: emailData.message }
      // });
      
      // For now, just log and return success
      console.log(`Sending email to ${email}:`, emailData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true, donorId, email };
    },
    onSuccess: (result) => {
      toast({
        title: "Email Sent",
        description: `Email has been sent to ${result.email}`,
        variant: "default"
      });
    },
    onError: (error) => {
      console.error('Error sending email:', error);
      toast({
        title: "Email Failed",
        description: "There was a problem sending the email. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Ban a donor (update status to 'banned')
  const banDonor = useMutation({
    mutationFn: async ({ donorId }: { donorId: string }) => {
      const { data, error } = await supabase
        .from('donors')
        .update({
          status: 'banned',
          updated_at: new Date().toISOString()
        })
        .eq('id', donorId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-donors'] });
      toast({
        title: "User Banned",
        description: "The user has been banned from the platform.",
        variant: "default"
      });
    },
    onError: (error) => {
      console.error('Error banning user:', error);
      toast({
        title: "Action Failed",
        description: "There was a problem banning the user. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Activate a donor (update status to 'active')
  const activateDonor = useMutation({
    mutationFn: async ({ donorId }: { donorId: string }) => {
      const { data, error } = await supabase
        .from('donors')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', donorId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-donors'] });
      toast({
        title: "User Activated",
        description: "The user has been activated on the platform.",
        variant: "default"
      });
    },
    onError: (error) => {
      console.error('Error activating user:', error);
      toast({
        title: "Action Failed",
        description: "There was a problem activating the user. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Create an account for legacy donor (would trigger invitation email)
  const createDonorAccount = useMutation({
    mutationFn: async ({ donorId, email }: { donorId: string; email: string }) => {
      // In a real implementation, this would call a Supabase Edge Function
      // For now, we'll simulate success
      console.log(`Creating account for donor ${donorId} with email ${email}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true, donorId, email };
    },
    onSuccess: (result) => {
      toast({
        title: "Account Created",
        description: `An invitation has been sent to ${result.email}`,
        variant: "default"
      });
    },
    onError: (error) => {
      console.error('Error creating account:', error);
      toast({
        title: "Account Creation Failed",
        description: "There was a problem creating the account. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  return {
    updateDonor,
    sendDonorEmail,
    banDonor,
    activateDonor,
    createDonorAccount
  };
};
