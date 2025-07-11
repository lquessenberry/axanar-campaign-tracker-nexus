import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface Reward {
  id: string;
  name: string;
  description?: string;
  amount: number;
  limit?: number;
  claimed: number;
  campaign_id: string;
  image_url?: string;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
  shipping_required?: boolean;
  estimated_delivery?: string;
}

export const useAdminRewardMutations = () => {
  const queryClient = useQueryClient();

  // Create a new reward
  const createReward = useMutation({
    mutationFn: async (data: Omit<Reward, 'id' | 'created_at' | 'updated_at' | 'claimed'>) => {
      const formattedData = {
        ...data,
        claimed: 0, // New rewards start with 0 claims
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newReward, error } = await supabase
        .from('rewards')
        .insert([formattedData])
        .select()
        .single();

      if (error) throw error;
      return newReward;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
      queryClient.invalidateQueries({ queryKey: ['admin-rewards-stats'] });
      toast({
        title: "Reward Created",
        description: "New reward has been successfully created."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Reward",
        description: error?.message || "Failed to create reward. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update an existing reward
  const updateReward = useMutation({
    mutationFn: async ({ rewardId, data }: { rewardId: string; data: Partial<Reward> }) => {
      const formattedData = {
        ...data,
        updated_at: new Date().toISOString()
      };

      const { data: updatedReward, error } = await supabase
        .from('rewards')
        .update(formattedData)
        .eq('id', rewardId)
        .select()
        .single();

      if (error) throw error;
      return updatedReward;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
      toast({
        title: "Reward Updated",
        description: "Reward has been successfully updated."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Updating Reward",
        description: error?.message || "Failed to update reward. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete a reward
  const deleteReward = useMutation({
    mutationFn: async (rewardId: string) => {
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', rewardId);

      if (error) throw error;
      return rewardId;
    },
    onSuccess: (rewardId) => {
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
      queryClient.invalidateQueries({ queryKey: ['admin-rewards-stats'] });
      toast({
        title: "Reward Deleted",
        description: "The reward has been successfully deleted."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Deleting Reward",
        description: error?.message || "Failed to delete reward. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Toggle reward availability
  const toggleRewardAvailability = useMutation({
    mutationFn: async ({ rewardId, isAvailable }: { rewardId: string; isAvailable: boolean }) => {
      const { data: updatedReward, error } = await supabase
        .from('rewards')
        .update({ 
          is_available: isAvailable,
          updated_at: new Date().toISOString() 
        })
        .eq('id', rewardId)
        .select()
        .single();

      if (error) throw error;
      return updatedReward;
    },
    onSuccess: (reward) => {
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
      queryClient.invalidateQueries({ queryKey: ['admin-rewards-stats'] });
      toast({
        title: "Reward Updated",
        description: "The reward has been successfully updated."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Updating Reward",
        description: error?.message || "Failed to update reward. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Bulk delete rewards
  const bulkDeleteRewards = useMutation({
    mutationFn: async (rewardIds: string[]) => {
      const { error } = await supabase
        .from('rewards')
        .delete()
        .in('id', rewardIds);

      if (error) throw error;
      return rewardIds;
    },
    onSuccess: (rewardIds) => {
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
      queryClient.invalidateQueries({ queryKey: ['admin-rewards-stats'] });
      toast({
        title: "Rewards Deleted",
        description: `Successfully deleted ${rewardIds.length} reward${rewardIds.length === 1 ? '' : 's'}.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Deleting Rewards",
        description: error?.message || "Failed to delete rewards. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Bulk toggle rewards availability
  const bulkToggleRewardAvailability = useMutation({
    mutationFn: async ({ rewardIds, isAvailable }: { rewardIds: string[]; isAvailable: boolean }) => {
      const { error } = await supabase
        .from('rewards')
        .update({ 
          is_available: isAvailable,
          updated_at: new Date().toISOString() 
        })
        .in('id', rewardIds);

      if (error) throw error;
      return { rewardIds, isAvailable };
    },
    onSuccess: ({ rewardIds, isAvailable }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
      queryClient.invalidateQueries({ queryKey: ['admin-rewards-stats'] });
      toast({
        title: isAvailable ? "Rewards Available" : "Rewards Unavailable",
        description: `Successfully ${isAvailable ? 'activated' : 'deactivated'} ${rewardIds.length} reward${rewardIds.length === 1 ? '' : 's'}.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Updating Rewards",
        description: error?.message || "Failed to update rewards. Please try again.",
        variant: "destructive"
      });
    }
  });

  return {
    createReward,
    updateReward,
    deleteReward,
    toggleRewardAvailability,
    bulkDeleteRewards,
    bulkToggleRewardAvailability
  };
};
