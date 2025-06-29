import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  goal_amount: number;
  current_amount: number;
  active: boolean;
  start_date?: string | Date;
  end_date?: string | Date | null;
  created_at?: string;
  updated_at?: string;
}

export const useAdminCampaignMutations = () => {
  const queryClient = useQueryClient();

  // Create a new campaign
  const createCampaign = useMutation({
    mutationFn: async (data: Omit<Campaign, 'id' | 'created_at' | 'updated_at' | 'current_amount'>) => {
      // Format dates for database storage
      const formattedData = {
        ...data,
        start_date: data.start_date instanceof Date ? data.start_date.toISOString() : data.start_date,
        end_date: data.end_date instanceof Date ? data.end_date.toISOString() : data.end_date,
        current_amount: 0, // New campaigns start at $0
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newCampaign, error } = await supabase
        .from('campaigns')
        .insert([formattedData])
        .select()
        .single();

      if (error) throw error;
      return newCampaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns-stats'] });
      toast({
        title: "Campaign Created",
        description: "New campaign has been successfully created."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Campaign",
        description: error?.message || "Failed to create campaign. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update an existing campaign
  const updateCampaign = useMutation({
    mutationFn: async ({ campaignId, data }: { campaignId: string; data: Partial<Campaign> }) => {
      // Format dates for database storage
      const formattedData = {
        ...data,
        start_date: data.start_date instanceof Date ? data.start_date.toISOString() : data.start_date,
        end_date: data.end_date instanceof Date ? data.end_date.toISOString() : data.end_date,
        updated_at: new Date().toISOString()
      };

      const { data: updatedCampaign, error } = await supabase
        .from('campaigns')
        .update(formattedData)
        .eq('id', campaignId)
        .select()
        .single();

      if (error) throw error;
      return updatedCampaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      toast({
        title: "Campaign Updated",
        description: "Campaign has been successfully updated."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Updating Campaign",
        description: error?.message || "Failed to update campaign. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete a campaign
  const deleteCampaign = useMutation({
    mutationFn: async (campaignId: string) => {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;
      return campaignId;
    },
    onSuccess: (campaignId) => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns-stats'] });
      toast({
        title: "Campaign Deleted",
        description: "The campaign has been successfully deleted."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Deleting Campaign",
        description: error?.message || "Failed to delete campaign. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Toggle campaign status (active/inactive)
  const toggleCampaignStatus = useMutation({
    mutationFn: async ({ campaignId, active }: { campaignId: string; active: boolean }) => {
      const { data: updatedCampaign, error } = await supabase
        .from('campaigns')
        .update({ 
          active,
          updated_at: new Date().toISOString() 
        })
        .eq('id', campaignId)
        .select()
        .single();

      if (error) throw error;
      return updatedCampaign;
    },
    onSuccess: (campaign) => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns-stats'] });
      toast({
        title: campaign.active ? "Campaign Activated" : "Campaign Deactivated",
        description: `The campaign has been ${campaign.active ? "activated" : "deactivated"} successfully.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Updating Campaign Status",
        description: error?.message || "Failed to update campaign status. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Bulk delete campaigns
  const bulkDeleteCampaigns = useMutation({
    mutationFn: async (campaignIds: string[]) => {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .in('id', campaignIds);

      if (error) throw error;
      return campaignIds;
    },
    onSuccess: (campaignIds) => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns-stats'] });
      toast({
        title: "Campaigns Deleted",
        description: `Successfully deleted ${campaignIds.length} campaign${campaignIds.length === 1 ? '' : 's'}.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Deleting Campaigns",
        description: error?.message || "Failed to delete campaigns. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Bulk activate/deactivate campaigns
  const bulkToggleCampaignStatus = useMutation({
    mutationFn: async ({ campaignIds, active }: { campaignIds: string[]; active: boolean }) => {
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          active,
          updated_at: new Date().toISOString() 
        })
        .in('id', campaignIds);

      if (error) throw error;
      return { campaignIds, active };
    },
    onSuccess: ({ campaignIds, active }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns-stats'] });
      toast({
        title: active ? "Campaigns Activated" : "Campaigns Deactivated",
        description: `Successfully ${active ? 'activated' : 'deactivated'} ${campaignIds.length} campaign${campaignIds.length === 1 ? '' : 's'}.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Updating Campaign Status",
        description: error?.message || "Failed to update campaign status. Please try again.",
        variant: "destructive"
      });
    }
  });

  return {
    createCampaign,
    updateCampaign,
    deleteCampaign,
    toggleCampaignStatus,
    bulkDeleteCampaigns,
    bulkToggleCampaignStatus
  };
};
