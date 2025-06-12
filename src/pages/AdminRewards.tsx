
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading rewards...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/admin" className="inline-flex items-center text-primary hover:text-primary/80 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-4 text-foreground">Manage Rewards</h1>
              <p className="text-muted-foreground">Create and manage campaign rewards/perks</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Reward
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-card-foreground">Create New Reward</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Name *</label>
                    <Input
                      value={newReward.name}
                      onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                      className="bg-background border-border text-foreground"
                      placeholder="Reward name"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Description</label>
                    <Textarea
                      value={newReward.description}
                      onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                      className="bg-background border-border text-foreground"
                      placeholder="Reward description"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Minimum Amount *</label>
                    <Input
                      type="number"
                      value={newReward.minimum_amount}
                      onChange={(e) => setNewReward({ ...newReward, minimum_amount: e.target.value })}
                      className="bg-background border-border text-foreground"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Campaign *</label>
                    <select
                      value={newReward.campaign_id}
                      onChange={(e) => setNewReward({ ...newReward, campaign_id: e.target.value })}
                      className="w-full p-2 bg-background border border-border rounded text-foreground"
                    >
                      <option value="">Select a campaign</option>
                      {campaigns?.map((campaign) => (
                        <option key={campaign.id} value={campaign.id}>
                          {campaign.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button onClick={handleCreateReward} className="w-full bg-primary hover:bg-primary/90">
                    Create Reward
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">All Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Name</TableHead>
                    <TableHead className="text-muted-foreground">Campaign</TableHead>
                    <TableHead className="text-muted-foreground">Minimum Amount</TableHead>
                    <TableHead className="text-muted-foreground">Description</TableHead>
                    <TableHead className="text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewards?.map((reward) => (
                    <TableRow key={reward.id} className="border-border">
                      <TableCell className="text-card-foreground font-medium">{reward.name}</TableCell>
                      <TableCell className="text-card-foreground">{reward.campaigns?.name || 'Unknown Campaign'}</TableCell>
                      <TableCell className="text-card-foreground">${Number(reward.minimum_amount).toFixed(2)}</TableCell>
                      <TableCell className="text-card-foreground max-w-xs truncate">
                        {reward.description || 'No description'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-border hover:bg-accent hover:text-accent-foreground"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteRewardMutation.mutate(reward.id)}
                            className="border-destructive/20 hover:bg-destructive hover:text-destructive-foreground text-destructive"
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
