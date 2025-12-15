import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Gift, Package, Truck, CheckCircle, Clock, AlertCircle, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { useAdminDonorMutations } from '@/hooks/useAdminDonorMutations';
import { toast } from '@/components/ui/use-toast';

interface Pledge {
  id: string;
  amount: number;
  campaign_id: string | null;
  reward_id: string | null;
  shipping_status: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  tracking_number: string | null;
  shipping_notes: string | null;
  created_at: string | null;
  campaign?: {
    name: string;
  };
  reward?: {
    name: string;
    description: string;
    is_physical: boolean;
  };
}

interface AdminGodViewRewardsProps {
  pledges: Pledge[];
  donorId: string;
  isLoading?: boolean;
}

const SHIPPING_STATUSES = [
  { value: 'pending', label: 'Pending', icon: Clock, color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'processing', label: 'Processing', icon: Package, color: 'bg-blue-500/20 text-blue-400' },
  { value: 'shipped', label: 'Shipped', icon: Truck, color: 'bg-purple-500/20 text-purple-400' },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'bg-green-500/20 text-green-400' },
  { value: 'issue', label: 'Issue', icon: AlertCircle, color: 'bg-red-500/20 text-red-400' },
];

const AdminGodViewRewards: React.FC<AdminGodViewRewardsProps> = ({
  pledges,
  donorId,
  isLoading = false,
}) => {
  const [selectedPledges, setSelectedPledges] = useState<Set<string>>(new Set());
  const [editingPledge, setEditingPledge] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    shipping_status: string;
    tracking_number: string;
    shipping_notes: string;
  }>({ shipping_status: '', tracking_number: '', shipping_notes: '' });
  const [bulkStatus, setBulkStatus] = useState<string>('');

  const { updatePledge, bulkUpdatePledges } = useAdminDonorMutations(donorId);

  // Filter pledges that have rewards (especially physical ones)
  const rewardPledges = pledges.filter(p => p.reward);
  const physicalRewards = rewardPledges.filter(p => p.reward?.is_physical);
  const digitalRewards = rewardPledges.filter(p => !p.reward?.is_physical);

  const handleSelectPledge = (pledgeId: string, checked: boolean) => {
    const newSelected = new Set(selectedPledges);
    if (checked) {
      newSelected.add(pledgeId);
    } else {
      newSelected.delete(pledgeId);
    }
    setSelectedPledges(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPledges(new Set(physicalRewards.map(p => p.id)));
    } else {
      setSelectedPledges(new Set());
    }
  };

  const startEdit = (pledge: Pledge) => {
    setEditingPledge(pledge.id);
    setEditData({
      shipping_status: pledge.shipping_status || 'pending',
      tracking_number: pledge.tracking_number || '',
      shipping_notes: pledge.shipping_notes || '',
    });
  };

  const cancelEdit = () => {
    setEditingPledge(null);
    setEditData({ shipping_status: '', tracking_number: '', shipping_notes: '' });
  };

  const saveEdit = async () => {
    if (!editingPledge) return;

    try {
      await updatePledge.mutateAsync({
        pledgeId: editingPledge,
        data: {
          shipping_status: editData.shipping_status,
          tracking_number: editData.tracking_number || null,
          shipping_notes: editData.shipping_notes || null,
          shipped_at: editData.shipping_status === 'shipped' ? new Date().toISOString() : undefined,
          delivered_at: editData.shipping_status === 'delivered' ? new Date().toISOString() : undefined,
        },
      });
      setEditingPledge(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedPledges.size === 0 || !bulkStatus) {
      toast({
        title: 'Select pledges and status',
        description: 'Please select at least one pledge and a status to apply.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await bulkUpdatePledges.mutateAsync({
        pledgeIds: Array.from(selectedPledges),
        data: {
          shipping_status: bulkStatus,
          shipped_at: bulkStatus === 'shipped' ? new Date().toISOString() : undefined,
          delivered_at: bulkStatus === 'delivered' ? new Date().toISOString() : undefined,
        },
      });
      setSelectedPledges(new Set());
      setBulkStatus('');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const getStatusBadge = (status: string | null) => {
    const statusConfig = SHIPPING_STATUSES.find(s => s.value === status) || SHIPPING_STATUSES[0];
    const Icon = statusConfig.icon;
    return (
      <Badge className={`${statusConfig.color} gap-1`}>
        <Icon className="h-3 w-3" />
        {statusConfig.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Physical Rewards Section */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Physical Rewards ({physicalRewards.length})
            </CardTitle>
            
            {/* Bulk Actions */}
            {physicalRewards.length > 0 && (
              <div className="flex items-center gap-2">
                <Select value={bulkStatus} onValueChange={setBulkStatus}>
                  <SelectTrigger className="w-[140px] h-8">
                    <SelectValue placeholder="Bulk status..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIPPING_STATUSES.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={handleBulkUpdate}
                  disabled={selectedPledges.size === 0 || !bulkStatus || bulkUpdatePledges.isPending}
                >
                  Apply ({selectedPledges.size})
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {physicalRewards.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              No physical rewards found
            </p>
          ) : (
            <div className="space-y-3">
              {/* Select All */}
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <Checkbox
                  checked={selectedPledges.size === physicalRewards.length}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all physical rewards"
                />
                <span className="text-sm text-muted-foreground">Select All</span>
              </div>

              {physicalRewards.map(pledge => (
                <div
                  key={pledge.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedPledges.has(pledge.id)}
                    onCheckedChange={(checked) => handleSelectPledge(pledge.id, checked as boolean)}
                    aria-label={`Select ${pledge.reward?.name}`}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium text-sm">{pledge.reward?.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {pledge.campaign?.name} • ${pledge.amount}
                        </p>
                        {pledge.reward?.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {pledge.reward.description}
                          </p>
                        )}
                      </div>
                      
                      {editingPledge === pledge.id ? (
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" onClick={saveEdit} disabled={updatePledge.isPending}>
                            <Save className="h-4 w-4 text-green-400" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={cancelEdit}>
                            <X className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => startEdit(pledge)}>
                          Edit
                        </Button>
                      )}
                    </div>
                    
                    {editingPledge === pledge.id ? (
                      <div className="mt-3 space-y-2">
                        <div className="flex gap-2">
                          <Select
                            value={editData.shipping_status}
                            onValueChange={(v) => setEditData(prev => ({ ...prev, shipping_status: v }))}
                          >
                            <SelectTrigger className="w-[140px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SHIPPING_STATUSES.map(status => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Tracking number"
                            value={editData.tracking_number}
                            onChange={(e) => setEditData(prev => ({ ...prev, tracking_number: e.target.value }))}
                            className="h-8 flex-1"
                          />
                        </div>
                        <Input
                          placeholder="Shipping notes..."
                          value={editData.shipping_notes}
                          onChange={(e) => setEditData(prev => ({ ...prev, shipping_notes: e.target.value }))}
                          className="h-8"
                        />
                      </div>
                    ) : (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {getStatusBadge(pledge.shipping_status)}
                        {pledge.tracking_number && (
                          <Badge variant="outline" className="text-xs">
                            Tracking: {pledge.tracking_number}
                          </Badge>
                        )}
                        {pledge.shipped_at && (
                          <span className="text-xs text-muted-foreground">
                            Shipped: {format(new Date(pledge.shipped_at), 'MMM d, yyyy')}
                          </span>
                        )}
                        {pledge.delivered_at && (
                          <span className="text-xs text-muted-foreground">
                            Delivered: {format(new Date(pledge.delivered_at), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Digital Rewards Section */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="h-5 w-5 text-cyan-400" />
            Digital Rewards ({digitalRewards.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {digitalRewards.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              No digital rewards found
            </p>
          ) : (
            <div className="grid gap-2">
              {digitalRewards.map(pledge => (
                <div
                  key={pledge.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div>
                    <h4 className="font-medium text-sm">{pledge.reward?.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {pledge.campaign?.name} • ${pledge.amount}
                    </p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Fulfilled
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGodViewRewards;
