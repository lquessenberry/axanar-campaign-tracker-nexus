
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Edit2, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const AdminRewards = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newReward, setNewReward] = useState({
    name: '',
    description: '',
    minimum_amount: '',
    campaign_id: ''
  });

  const { data: rewards, isLoading } = useQuery({
    queryKey: ['admin-rewards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rewards')
        .select(`
          *,
          campaigns:campaign_id (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: campaigns } = useQuery({
    queryKey: ['admin-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name')
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  const createRewardMutation = useMutation({
    mutationFn: async (reward: typeof newReward) => {
      const { data, error } = await supabase
        .from('rewards')
        .insert({
          name: reward.name,
          description: reward.description,
          minimum_amount: parseFloat(reward.minimum_amount),
          campaign_id: reward.campaign_id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
      setIsCreateDialogOpen(false);
      setNewReward({ name: '', description: '', minimum_amount: '', campaign_id: '' });
      toast({
        title: "Success",
        description: "Reward created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create reward",
        variant: "destructive",
      });
      console.error('Error creating reward:', error);
    },
  });

  const deleteRewardMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', rewardId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
      toast({
        title: "Success",
        description: "Reward deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete reward",
        variant: "destructive",
      });
      console.error('Error deleting reward:', error);
    },
  });

  const handleCreateReward = () => {
    if (!newReward.name || !newReward.minimum_amount || !newReward.campaign_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createRewardMutation.mutate(newReward);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-axanar-dark flex items-center justify-center">
        <div className="text-white">Loading rewards...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-axanar-dark text-white">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/admin" className="inline-flex items-center text-axanar-teal hover:text-axanar-teal/80 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-4">Manage Rewards</h1>
              <p className="text-axanar-silver">Create and manage campaign rewards/perks</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-axanar-teal hover:bg-axanar-teal/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Reward
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-axanar-light border-axanar-silver/20">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Reward</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-axanar-silver">Name *</label>
                    <Input
                      value={newReward.name}
                      onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                      className="bg-axanar-dark border-axanar-silver/20 text-white"
                      placeholder="Reward name"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-axanar-silver">Description</label>
                    <Textarea
                      value={newReward.description}
                      onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                      className="bg-axanar-dark border-axanar-silver/20 text-white"
                      placeholder="Reward description"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-axanar-silver">Minimum Amount *</label>
                    <Input
                      type="number"
                      value={newReward.minimum_amount}
                      onChange={(e) => setNewReward({ ...newReward, minimum_amount: e.target.value })}
                      className="bg-axanar-dark border-axanar-silver/20 text-white"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-axanar-silver">Campaign *</label>
                    <select
                      value={newReward.campaign_id}
                      onChange={(e) => setNewReward({ ...newReward, campaign_id: e.target.value })}
                      className="w-full p-2 bg-axanar-dark border border-axanar-silver/20 rounded text-white"
                    >
                      <option value="">Select a campaign</option>
                      {campaigns?.map((campaign) => (
                        <option key={campaign.id} value={campaign.id}>
                          {campaign.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button onClick={handleCreateReward} className="w-full bg-axanar-teal hover:bg-axanar-teal/90">
                    Create Reward
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="bg-axanar-light border-axanar-silver/20">
          <CardHeader>
            <CardTitle className="text-white">All Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-axanar-silver/20">
                    <TableHead className="text-axanar-silver">Name</TableHead>
                    <TableHead className="text-axanar-silver">Campaign</TableHead>
                    <TableHead className="text-axanar-silver">Minimum Amount</TableHead>
                    <TableHead className="text-axanar-silver">Description</TableHead>
                    <TableHead className="text-axanar-silver">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewards?.map((reward) => (
                    <TableRow key={reward.id} className="border-axanar-silver/20">
                      <TableCell className="text-white font-medium">{reward.name}</TableCell>
                      <TableCell className="text-white">{reward.campaigns?.name || 'Unknown Campaign'}</TableCell>
                      <TableCell className="text-white">${Number(reward.minimum_amount).toFixed(2)}</TableCell>
                      <TableCell className="text-white max-w-xs truncate">
                        {reward.description || 'No description'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-axanar-silver/20 hover:bg-axanar-teal hover:border-axanar-teal"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteRewardMutation.mutate(reward.id)}
                            className="border-red-500/20 hover:bg-red-600 hover:border-red-600 text-red-400"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default AdminRewards;
