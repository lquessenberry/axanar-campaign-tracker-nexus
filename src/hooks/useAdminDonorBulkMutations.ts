import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { EmailData } from './useAdminDonorMutations';

export const useAdminDonorBulkMutations = () => {
  const queryClient = useQueryClient();
  
  // Bulk email to donors
  const bulkSendEmails = useMutation({
    mutationFn: async ({ donorIds, emailData }: { donorIds: string[]; emailData: EmailData }) => {
      if (donorIds.length === 0) {
        throw new Error("No donors selected");
      }
      
      // In a real implementation, this would call a Supabase Edge Function to send bulk emails
      // For now, we'll simulate success
      
      // Fetch the donors to get their emails
      const { data: donors, error } = await supabase
        .from('donors')
        .select('id, email')
        .in('id', donorIds);
      
      if (error) throw error;
      
      // Log the operation for demo purposes
      console.log(`Sending bulk email to ${donors.length} donors:`, {
        subject: emailData.subject,
        message: emailData.message,
        recipients: donors.map(donor => donor.email)
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return { success: true, count: donors.length };
    },
    onSuccess: (result) => {
      toast({
        title: "Bulk Email Sent",
        description: `Email has been sent to ${result.count} donors`,
        variant: "default"
      });
    },
    onError: (error) => {
      console.error('Error sending bulk email:', error);
      toast({
        title: "Bulk Email Failed",
        description: "There was a problem sending emails. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Bulk export donor data
  const bulkExportDonors = useMutation({
    mutationFn: async ({ donorIds }: { donorIds: string[] }) => {
      if (donorIds.length === 0) {
        throw new Error("No donors selected");
      }
      
      // Fetch full donor data including their pledges
      const { data: donors, error } = await supabase
        .from('donors')
        .select(`
          id,
          first_name,
          last_name,
          full_name,
          donor_name,
          email,
          created_at,
          pledges (
            id,
            amount,
            campaign_id,
            status,
            created_at
          )
        `)
        .in('id', donorIds);
      
      if (error) throw error;
      
      // In a real implementation, we'd format this data into CSV or Excel
      // For now, we'll just return the JSON data
      
      // Convert to CSV (simplified version)
      const headers = [
        'ID',
        'First Name',
        'Last Name',
        'Full Name',
        'Email',
        'Created At',
        'Total Pledges',
        'Total Amount'
      ].join(',');
      
      const rows = donors.map(donor => {
        const totalAmount = donor.pledges?.reduce((sum, pledge) => 
          sum + Number(pledge.amount), 0) || 0;
          
        return [
          donor.id,
          donor.first_name || '',
          donor.last_name || '',
          donor.full_name || '',
          donor.email,
          donor.created_at,
          donor.pledges?.length || 0,
          totalAmount
        ].join(',');
      });
      
      const csv = [headers, ...rows].join('\n');
      
      // Create a downloadable blob
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      // Create a download link and trigger it
      const a = document.createElement('a');
      a.href = url;
      a.download = `donors-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return { success: true, count: donors.length };
    },
    onSuccess: (result) => {
      toast({
        title: "Export Complete",
        description: `${result.count} donor records exported successfully`,
        variant: "default"
      });
    },
    onError: (error) => {
      console.error('Error exporting donors:', error);
      toast({
        title: "Export Failed",
        description: "There was a problem exporting the data. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Bulk create accounts for legacy donors
  const bulkCreateAccounts = useMutation({
    mutationFn: async ({ donorIds }: { donorIds: string[] }) => {
      if (donorIds.length === 0) {
        throw new Error("No donors selected");
      }
      
      // In a real implementation, this would call a Supabase Edge Function
      // to send invitation emails to each donor
      
      // Fetch donors who don't have auth accounts yet
      const { data: donors, error } = await supabase
        .from('donors')
        .select('id, email')
        .in('id', donorIds)
        .is('auth_user_id', null);
      
      if (error) throw error;
      
      // Log the operation for demo purposes
      console.log(`Creating accounts for ${donors.length} legacy donors`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return { success: true, count: donors.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-donors'] });
      toast({
        title: "Account Creation In Progress",
        description: `Invitations sent to ${result.count} donors`,
        variant: "default"
      });
    },
    onError: (error) => {
      console.error('Error creating accounts:', error);
      toast({
        title: "Account Creation Failed",
        description: "There was a problem creating the accounts. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Bulk delete donors
  const bulkDeleteDonors = useMutation({
    mutationFn: async ({ donorIds }: { donorIds: string[] }) => {
      if (donorIds.length === 0) {
        throw new Error("No donors selected");
      }
      
      // In a production app, we might want to implement soft delete instead
      const { data, error } = await supabase
        .from('donors')
        .update({ status: 'deleted', updated_at: new Date().toISOString() })
        .in('id', donorIds);
      
      if (error) throw error;
      
      return { success: true, count: donorIds.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-donors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-donors-stats'] });
      toast({
        title: "Donors Removed",
        description: `${result.count} donors have been removed`,
        variant: "default"
      });
    },
    onError: (error) => {
      console.error('Error deleting donors:', error);
      toast({
        title: "Delete Failed",
        description: "There was a problem removing the donors. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  return {
    bulkSendEmails,
    bulkExportDonors,
    bulkCreateAccounts,
    bulkDeleteDonors
  };
};
