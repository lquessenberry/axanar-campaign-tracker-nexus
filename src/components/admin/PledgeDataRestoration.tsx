import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DaystromCard } from '@/components/ui/daystrom-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Search, Plus, Save, Package, DollarSign, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PledgeFormData {
  donor_id: string;
  campaign_id: string;
  reward_id: string | null;
  amount: number;
  status: string;
  shipping_status: string | null;
  notes: string;
}

export const PledgeDataRestoration: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);
  const [showPledgeForm, setShowPledgeForm] = useState(false);
  
  const [pledgeForm, setPledgeForm] = useState<PledgeFormData>({
    donor_id: '',
    campaign_id: '',
    reward_id: null,
    amount: 0,
    status: 'completed',
    shipping_status: null,
    notes: '',
  });

  // Fetch campaigns
  const { data: campaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch rewards for selected campaign
  const { data: rewards } = useQuery({
    queryKey: ['rewards', pledgeForm.campaign_id],
    queryFn: async () => {
      if (!pledgeForm.campaign_id) return [];
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('campaign_id', pledgeForm.campaign_id)
        .order('minimum_pledge_amount');
      if (error) throw error;
      return data;
    },
    enabled: !!pledgeForm.campaign_id,
  });

  // Search donor
  const { data: donor, isLoading: searchLoading } = useQuery({
    queryKey: ['donor-search', searchEmail],
    queryFn: async () => {
      if (!searchEmail) return null;
      const { data, error } = await supabase
        .from('donors')
        .select(`
          *,
          pledges (
            id,
            amount,
            status,
            created_at,
            campaigns (name),
            rewards (name, requires_shipping)
          )
        `)
        .eq('email', searchEmail.toLowerCase().trim())
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: searchEmail.length > 3,
  });

  // Create pledge mutation
  const createPledgeMutation = useMutation({
    mutationFn: async (data: PledgeFormData) => {
      const { error } = await supabase
        .from('pledges')
        .insert([{
          donor_id: data.donor_id,
          campaign_id: data.campaign_id,
          reward_id: data.reward_id || null,
          amount: data.amount,
          status: data.status,
          shipping_status: data.shipping_status,
          notes: data.notes,
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Pledge created successfully');
      queryClient.invalidateQueries({ queryKey: ['donor-search'] });
      setShowPledgeForm(false);
      resetPledgeForm();
    },
    onError: (error: any) => {
      toast.error(`Failed to create pledge: ${error.message}`);
    },
  });

  const resetPledgeForm = () => {
    setPledgeForm({
      donor_id: selectedDonorId || '',
      campaign_id: '',
      reward_id: null,
      amount: 0,
      status: 'completed',
      shipping_status: null,
      notes: '',
    });
  };

  const handleSearch = () => {
    if (searchEmail.length > 3) {
      queryClient.invalidateQueries({ queryKey: ['donor-search', searchEmail] });
    }
  };

  const handleCreatePledge = () => {
    if (!selectedDonorId) {
      toast.error('No donor selected');
      return;
    }
    setPledgeForm({ ...pledgeForm, donor_id: selectedDonorId });
    setShowPledgeForm(true);
  };

  const handleSubmitPledge = () => {
    if (!pledgeForm.campaign_id || pledgeForm.amount <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }
    createPledgeMutation.mutate(pledgeForm);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light tracking-wide mb-2">Pledge Data Restoration</h2>
        <p className="text-muted-foreground">
          Manually restore missing pledge records for donors
        </p>
      </div>

      {/* Search Section */}
      <DaystromCard className="p-6">
        <div className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Label htmlFor="search-email">Donor Email Address</Label>
              <Input
                id="search-email"
                type="email"
                placeholder="Enter donor email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={searchLoading}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Donor Details */}
          {donor && (
            <div className="mt-6 space-y-4">
              <div className="p-4 rounded-daystrom-small bg-background/50 border border-border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">
                      {donor.first_name} {donor.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{donor.email}</p>
                    {donor.auth_user_id && (
                      <Badge variant="outline" className="mt-2">
                        Linked to Auth Account
                      </Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedDonorId(donor.id);
                      handleCreatePledge();
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Pledge
                  </Button>
                </div>

                {/* Existing Pledges */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Existing Pledges ({donor.pledges?.length || 0})</h4>
                  {donor.pledges && donor.pledges.length > 0 ? (
                    <div className="space-y-2">
                      {donor.pledges.map((pledge: any) => (
                        <div
                          key={pledge.id}
                          className="p-3 rounded bg-muted/50 border border-border/50 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{pledge.campaigns?.name}</p>
                              {pledge.rewards && (
                                <p className="text-xs text-muted-foreground">{pledge.rewards.name}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="outline">${Number(pledge.amount).toFixed(2)}</Badge>
                            <Badge variant={pledge.status === 'completed' ? 'default' : 'secondary'}>
                              {pledge.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No pledges found</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DaystromCard>

      {/* Pledge Creation Form */}
      {showPledgeForm && (
        <DaystromCard className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Create New Pledge</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowPledgeForm(false);
                  resetPledgeForm();
                }}
              >
                Cancel
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="campaign">Campaign *</Label>
                <Select
                  value={pledgeForm.campaign_id}
                  onValueChange={(value) => setPledgeForm({ ...pledgeForm, campaign_id: value, reward_id: null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns?.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name} ({campaign.provider})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Pledge Amount *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-9"
                    value={pledgeForm.amount || ''}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="reward">Reward (Optional)</Label>
                <Select
                  value={pledgeForm.reward_id || 'none'}
                  onValueChange={(value) => setPledgeForm({ ...pledgeForm, reward_id: value === 'none' ? null : value })}
                  disabled={!pledgeForm.campaign_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reward" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Reward</SelectItem>
                    {rewards?.map((reward) => (
                      <SelectItem key={reward.id} value={reward.id}>
                        {reward.name} (${reward.minimum_amount})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={pledgeForm.status}
                  onValueChange={(value) => setPledgeForm({ ...pledgeForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="shipping_status">Shipping Status (Optional)</Label>
                <Select
                  value={pledgeForm.shipping_status || 'none'}
                  onValueChange={(value) => setPledgeForm({ ...pledgeForm, shipping_status: value === 'none' ? null : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select shipping status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any restoration notes or source information..."
                value={pledgeForm.notes}
                onChange={(e) => setPledgeForm({ ...pledgeForm, notes: e.target.value })}
                rows={3}
              />
            </div>

            <Button
              onClick={handleSubmitPledge}
              disabled={createPledgeMutation.isPending}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {createPledgeMutation.isPending ? 'Creating...' : 'Create Pledge'}
            </Button>
          </div>
        </DaystromCard>
      )}
    </div>
  );
};
