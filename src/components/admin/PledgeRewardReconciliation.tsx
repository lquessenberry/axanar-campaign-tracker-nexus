import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertTriangle, Package, DollarSign, Mail } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PledgeWithoutReward {
  pledge_id: string;
  donor_id: string;
  amount: number;
  campaign_id: string;
  campaign_name: string;
  email: string;
  full_name: string;
  source_perk_name: string | null;
}

interface Reward {
  id: string;
  name: string;
  minimum_amount: number;
  campaign_id: string;
  campaign_name: string;
  is_physical: boolean;
  requires_shipping: boolean;
  description: string;
}

interface RewardMatch {
  pledge: PledgeWithoutReward;
  suggestedReward: Reward | null;
  matchConfidence: 'high' | 'medium' | 'low' | 'none';
  matchReason: string;
}

export function PledgeRewardReconciliation() {
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  // Fetch pledges without rewards
  const { data: pledgesWithoutRewards, isLoading: loadingPledges } = useQuery({
    queryKey: ['pledges-without-rewards'],
    queryFn: async () => {
      const { data: pledgeData, error: pledgeError } = await supabase
        .from('pledges')
        .select('id, donor_id, amount, campaign_id, reward_id')
        .is('reward_id', null)
        .gt('amount', 0)
        .order('amount', { ascending: false })
        .limit(100);

      if (pledgeError) throw pledgeError;

      // Fetch related data
      const donorIds = pledgeData?.map(p => p.donor_id) || [];
      const campaignIds = [...new Set(pledgeData?.map(p => p.campaign_id))];

      const [{ data: donorData }, { data: campaignData }] = await Promise.all([
        supabase.from('donors').select('id, email, full_name, source_perk_name').in('id', donorIds),
        supabase.from('campaigns').select('id, name').in('id', campaignIds)
      ]);

      return (pledgeData || []).map(p => {
        const donor = donorData?.find(d => d.id === p.donor_id);
        const campaign = campaignData?.find(c => c.id === p.campaign_id);
        
        return {
          pledge_id: p.id,
          donor_id: p.donor_id,
          amount: Number(p.amount),
          campaign_id: p.campaign_id,
          campaign_name: campaign?.name || 'Unknown',
          email: donor?.email || '',
          full_name: donor?.full_name || '',
          source_perk_name: donor?.source_perk_name || null
        };
      }) as PledgeWithoutReward[];
    }
  });

  // Fetch all rewards
  const { data: rewards, isLoading: loadingRewards } = useQuery({
    queryKey: ['all-rewards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rewards')
        .select('id, name, minimum_amount, campaign_id, is_physical, requires_shipping, description')
        .order('minimum_amount', { ascending: false });

      if (error) throw error;

      // Fetch campaign names
      const campaignIds = [...new Set(data?.map(r => r.campaign_id))];
      const { data: campaignData } = await supabase
        .from('campaigns')
        .select('id, name')
        .in('id', campaignIds);

      return (data || []).map(r => {
        const campaign = campaignData?.find(c => c.id === r.campaign_id);
        return {
          id: r.id,
          name: r.name,
          minimum_amount: Number(r.minimum_amount),
          campaign_id: r.campaign_id,
          is_physical: r.is_physical,
          requires_shipping: r.requires_shipping,
          description: r.description || '',
          campaign_name: campaign?.name || 'Unknown'
        };
      }) as Reward[];
    }
  });

  // Calculate matches
  const matches: RewardMatch[] = (pledgesWithoutRewards || []).map(pledge => {
    // Find rewards for same campaign
    const campaignRewards = (rewards || []).filter(
      r => r.campaign_id === pledge.campaign_id
    );

    // Find best matching reward
    let suggestedReward: Reward | null = null;
    let matchConfidence: 'high' | 'medium' | 'low' | 'none' = 'none';
    let matchReason = 'No matching reward found';

    // Exact perk name match (highest confidence)
    if (pledge.source_perk_name) {
      const exactMatch = campaignRewards.find(
        r => r.name.toLowerCase() === pledge.source_perk_name?.toLowerCase()
      );
      if (exactMatch) {
        suggestedReward = exactMatch;
        matchConfidence = 'high';
        matchReason = `Exact perk name match: "${pledge.source_perk_name}"`;
        return { pledge, suggestedReward, matchConfidence, matchReason };
      }
    }

    // Find highest reward tier that pledge qualifies for
    const qualifyingRewards = campaignRewards.filter(
      r => pledge.amount >= r.minimum_amount
    );

    if (qualifyingRewards.length > 0) {
      // Get the highest tier they qualify for
      suggestedReward = qualifyingRewards[0]; // Already sorted by amount DESC
      
      // Check if amount exactly matches minimum
      if (pledge.amount === suggestedReward.minimum_amount) {
        matchConfidence = 'high';
        matchReason = `Exact amount match ($${pledge.amount})`;
      } else {
        matchConfidence = 'medium';
        matchReason = `Qualifies for $${suggestedReward.minimum_amount} tier (pledged $${pledge.amount})`;
      }
    }

    return { pledge, suggestedReward, matchConfidence, matchReason };
  });

  // Assign reward mutation
  const assignRewardMutation = useMutation({
    mutationFn: async ({ pledgeId, rewardId }: { pledgeId: string; rewardId: string }) => {
      const { error } = await supabase
        .from('pledges')
        .update({ reward_id: rewardId })
        .eq('id', pledgeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pledges-without-rewards'] });
      toast.success('Reward assigned successfully');
    },
    onError: (error) => {
      toast.error(`Failed to assign reward: ${error.message}`);
    }
  });

  // Bulk assign selected matches
  const bulkAssignMutation = useMutation({
    mutationFn: async (matchesToAssign: RewardMatch[]) => {
      const updates = matchesToAssign
        .filter(m => m.suggestedReward)
        .map(m => ({
          id: m.pledge.pledge_id,
          reward_id: m.suggestedReward!.id
        }));

      for (const update of updates) {
        const { error } = await supabase
          .from('pledges')
          .update({ reward_id: update.reward_id })
          .eq('id', update.id);

        if (error) throw error;
      }

      return updates.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['pledges-without-rewards'] });
      setSelectedMatches(new Set());
      toast.success(`Successfully assigned ${count} rewards`);
    },
    onError: (error) => {
      toast.error(`Failed to assign rewards: ${error.message}`);
    }
  });

  const toggleMatch = (pledgeId: string) => {
    const newSelected = new Set(selectedMatches);
    if (newSelected.has(pledgeId)) {
      newSelected.delete(pledgeId);
    } else {
      newSelected.add(pledgeId);
    }
    setSelectedMatches(newSelected);
  };

  const handleBulkAssign = () => {
    const matchesToAssign = matches.filter(m => 
      selectedMatches.has(m.pledge.pledge_id) && m.suggestedReward
    );
    
    if (matchesToAssign.length === 0) {
      toast.error('No valid matches selected');
      return;
    }

    bulkAssignMutation.mutate(matchesToAssign);
  };

  const handleSelectByConfidence = (confidence: 'high' | 'medium') => {
    const highConfidenceMatches = matches
      .filter(m => m.matchConfidence === confidence && m.suggestedReward)
      .map(m => m.pledge.pledge_id);
    
    setSelectedMatches(new Set(highConfidenceMatches));
    toast.success(`Selected ${highConfidenceMatches.length} ${confidence} confidence matches`);
  };

  const isLoading = loadingPledges || loadingRewards;
  const highConfidenceCount = matches.filter(m => m.matchConfidence === 'high').length;
  const mediumConfidenceCount = matches.filter(m => m.matchConfidence === 'medium').length;
  const lowConfidenceCount = matches.filter(m => m.matchConfidence === 'low').length;
  const noMatchCount = matches.filter(m => m.matchConfidence === 'none').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Pledge Reward Reconciliation
          </CardTitle>
          <CardDescription>
            Identify and assign missing rewards to pledges based on contribution amounts and original perk names
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading data...</div>
          ) : (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">High Confidence</p>
                        <p className="text-2xl font-bold text-green-600">{highConfidenceCount}</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Medium Confidence</p>
                        <p className="text-2xl font-bold text-yellow-600">{mediumConfidenceCount}</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Low Confidence</p>
                        <p className="text-2xl font-bold text-orange-600">{lowConfidenceCount}</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">No Match</p>
                        <p className="text-2xl font-bold text-red-600">{noMatchCount}</p>
                      </div>
                      <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bulk Actions */}
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={() => handleSelectByConfidence('high')}
                  variant="outline"
                  size="sm"
                >
                  Select All High Confidence ({highConfidenceCount})
                </Button>
                <Button 
                  onClick={() => handleSelectByConfidence('medium')}
                  variant="outline"
                  size="sm"
                >
                  Select All Medium Confidence ({mediumConfidenceCount})
                </Button>
                <Button 
                  onClick={() => setSelectedMatches(new Set())}
                  variant="outline"
                  size="sm"
                  disabled={selectedMatches.size === 0}
                >
                  Clear Selection
                </Button>
                <Button
                  onClick={handleBulkAssign}
                  disabled={selectedMatches.size === 0 || bulkAssignMutation.isPending}
                  className="ml-auto"
                >
                  {bulkAssignMutation.isPending ? 'Assigning...' : `Assign ${selectedMatches.size} Selected Rewards`}
                </Button>
              </div>

              {/* Matches List */}
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {matches.map((match) => (
                    <Card 
                      key={match.pledge.pledge_id}
                      className={`${
                        selectedMatches.has(match.pledge.pledge_id) 
                          ? 'ring-2 ring-primary' 
                          : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            {/* User Info */}
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{match.pledge.full_name || match.pledge.email}</span>
                              <Badge variant="outline">{match.pledge.campaign_name}</Badge>
                            </div>

                            {/* Pledge Amount */}
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="font-semibold text-green-600">${match.pledge.amount}</span>
                              {match.pledge.source_perk_name && (
                                <Badge variant="secondary" className="text-xs">
                                  Original: {match.pledge.source_perk_name}
                                </Badge>
                              )}
                            </div>

                            {/* Suggested Reward */}
                            {match.suggestedReward ? (
                              <div className="p-3 bg-muted rounded-lg space-y-1">
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant={
                                      match.matchConfidence === 'high' ? 'default' :
                                      match.matchConfidence === 'medium' ? 'secondary' : 'outline'
                                    }
                                  >
                                    {match.matchConfidence} confidence
                                  </Badge>
                                  <Package className="w-4 h-4" />
                                  <span className="font-medium">{match.suggestedReward.name}</span>
                                  <span className="text-sm text-muted-foreground">
                                    (${match.suggestedReward.minimum_amount} tier)
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{match.matchReason}</p>
                              </div>
                            ) : (
                              <div className="p-3 bg-destructive/10 rounded-lg">
                                <p className="text-sm text-destructive font-medium">
                                  {match.matchReason}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant={selectedMatches.has(match.pledge.pledge_id) ? 'default' : 'outline'}
                              onClick={() => toggleMatch(match.pledge.pledge_id)}
                              disabled={!match.suggestedReward}
                            >
                              {selectedMatches.has(match.pledge.pledge_id) ? 'Selected' : 'Select'}
                            </Button>
                            {match.suggestedReward && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => assignRewardMutation.mutate({
                                  pledgeId: match.pledge.pledge_id,
                                  rewardId: match.suggestedReward!.id
                                })}
                                disabled={assignRewardMutation.isPending}
                              >
                                Assign Now
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
