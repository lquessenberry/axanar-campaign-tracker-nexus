import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, Trash2, Package, DollarSign, AlertTriangle,
  Loader2
} from 'lucide-react';
import { AdminDonorFullData, AdminPledge } from '@/hooks/useAdminDonorFullProfile';
import { useAdminDonorMutations, PledgeUpdateData } from '@/hooks/useAdminDonorMutations';
import InlineEditField from './InlineEditField';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminGodViewPledgesProps {
  donorData: AdminDonorFullData;
}

const AdminGodViewPledges = ({ donorData }: AdminGodViewPledgesProps) => {
  const { donor, pledges } = donorData;
  const donorId = donor?.id || null;
  const { updatePledge, createPledge, deletePledge, bulkUpdatePledges } = useAdminDonorMutations(donorId);
  
  const [selectedPledges, setSelectedPledges] = useState<Set<string>>(new Set());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<{ open: boolean; pledgeId: string | null }>({ 
    open: false, 
    pledgeId: null 
  });
  const [newPledge, setNewPledge] = useState({
    campaign_id: '',
    amount: '',
    reward_id: '',
  });

  // Fetch campaigns for dropdown
  const { data: campaigns } = useQuery({
    queryKey: ['admin-campaigns-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch rewards for selected campaign
  const { data: rewards } = useQuery({
    queryKey: ['admin-rewards-list', newPledge.campaign_id],
    queryFn: async () => {
      if (!newPledge.campaign_id) return [];
      const { data, error } = await supabase
        .from('rewards')
        .select('id, name, minimum_amount')
        .eq('campaign_id', newPledge.campaign_id)
        .order('minimum_amount');
      if (error) throw error;
      return data || [];
    },
    enabled: !!newPledge.campaign_id,
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPledges(new Set(pledges.map(p => p.id)));
    } else {
      setSelectedPledges(new Set());
    }
  };

  const handleSelectPledge = (pledgeId: string, checked: boolean) => {
    const newSelected = new Set(selectedPledges);
    if (checked) {
      newSelected.add(pledgeId);
    } else {
      newSelected.delete(pledgeId);
    }
    setSelectedPledges(newSelected);
  };

  const handleBulkShippingUpdate = async (status: string) => {
    if (selectedPledges.size === 0) return;
    
    await bulkUpdatePledges.mutateAsync({
      pledgeIds: Array.from(selectedPledges),
      data: {
        shipping_status: status,
        shipped_at: status === 'shipped' ? new Date().toISOString() : undefined,
        delivered_at: status === 'delivered' ? new Date().toISOString() : undefined,
      },
    });
    setSelectedPledges(new Set());
  };

  const handleAddPledge = async () => {
    if (!donorId || !newPledge.campaign_id || !newPledge.amount) return;

    await createPledge.mutateAsync({
      donor_id: donorId,
      campaign_id: newPledge.campaign_id,
      amount: parseFloat(newPledge.amount),
      reward_id: newPledge.reward_id || null,
    });

    setShowAddDialog(false);
    setNewPledge({ campaign_id: '', amount: '', reward_id: '' });
  };

  const handleDeletePledge = async () => {
    if (!showDeleteDialog.pledgeId) return;
    
    const pledge = pledges.find(p => p.id === showDeleteDialog.pledgeId);
    await deletePledge.mutateAsync({
      pledgeId: showDeleteDialog.pledgeId,
      oldData: pledge as unknown as Record<string, unknown>,
    });
    
    setShowDeleteDialog({ open: false, pledgeId: null });
  };

  const handleUpdateField = async (pledgeId: string, field: keyof PledgeUpdateData, value: unknown) => {
    const pledge = pledges.find(p => p.id === pledgeId);
    await updatePledge.mutateAsync({
      pledgeId,
      data: { [field]: value },
      oldData: pledge ? { [field]: pledge[field as keyof AdminPledge] } : undefined,
    });
  };

  const shippingStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Pledges ({pledges.length})
          </h2>
          
          {selectedPledges.size > 0 && (
            <Badge variant="secondary">
              {selectedPledges.size} selected
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Bulk Actions */}
          {selectedPledges.size > 0 && (
            <div className="flex items-center gap-2">
              <Select onValueChange={handleBulkShippingUpdate}>
                <SelectTrigger className="w-[160px] h-9">
                  <Package className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Bulk Shipping" />
                </SelectTrigger>
                <SelectContent>
                  {shippingStatusOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      Mark as {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button onClick={() => setShowAddDialog(true)} size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Add Pledge
          </Button>
        </div>
      </div>

      {/* Pledges Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedPledges.size === pledges.length && pledges.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all pledges"
                    />
                  </TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Shipping</TableHead>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-10">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pledges.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No pledges found
                    </TableCell>
                  </TableRow>
                ) : (
                  pledges.map((pledge) => (
                    <TableRow key={pledge.id} className="border-border group">
                      <TableCell>
                        <Checkbox
                          checked={selectedPledges.has(pledge.id)}
                          onCheckedChange={(checked) => handleSelectPledge(pledge.id, !!checked)}
                          aria-label={`Select pledge for ${pledge.campaign?.name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {pledge.campaign?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <InlineEditField
                          value={pledge.amount}
                          type="number"
                          prefix="$"
                          onSave={(value) => handleUpdateField(pledge.id, 'amount', Number(value))}
                          ariaLabel="Edit pledge amount"
                        />
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {pledge.reward?.name || <span className="text-muted-foreground italic">None</span>}
                        </span>
                      </TableCell>
                      <TableCell>
                        {pledge.reward?.is_physical ? (
                          <InlineEditField
                            value={pledge.shipping_status || 'pending'}
                            type="select"
                            options={shippingStatusOptions}
                            onSave={(value) => handleUpdateField(pledge.id, 'shipping_status', value)}
                            ariaLabel="Edit shipping status"
                          />
                        ) : (
                          <span className="text-muted-foreground text-sm">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {pledge.reward?.is_physical ? (
                          <InlineEditField
                            value={pledge.tracking_number}
                            type="text"
                            placeholder="Add tracking..."
                            emptyText="—"
                            onSave={(value) => handleUpdateField(pledge.id, 'tracking_number', value)}
                            ariaLabel="Edit tracking number"
                          />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(pledge.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setShowDeleteDialog({ open: true, pledgeId: pledge.id })}
                          aria-label="Delete pledge"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Pledge Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Pledge</DialogTitle>
            <DialogDescription>
              Create a new pledge for this donor.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="campaign">Campaign *</Label>
              <Select
                value={newPledge.campaign_id}
                onValueChange={(value) => setNewPledge({ ...newPledge, campaign_id: value, reward_id: '' })}
              >
                <SelectTrigger id="campaign">
                  <SelectValue placeholder="Select campaign" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={newPledge.amount}
                onChange={(e) => setNewPledge({ ...newPledge, amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward">Reward (Optional)</Label>
              <Select
                value={newPledge.reward_id}
                onValueChange={(value) => setNewPledge({ ...newPledge, reward_id: value })}
                disabled={!newPledge.campaign_id}
              >
                <SelectTrigger id="reward">
                  <SelectValue placeholder={newPledge.campaign_id ? "Select reward" : "Select campaign first"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No reward</SelectItem>
                  {rewards?.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name} (${r.minimum_amount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddPledge}
              disabled={!newPledge.campaign_id || !newPledge.amount || createPledge.isPending}
            >
              {createPledge.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Pledge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={showDeleteDialog.open} 
        onOpenChange={(open) => setShowDeleteDialog({ open, pledgeId: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Pledge
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this pledge? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog({ open: false, pledgeId: null })}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeletePledge}
              disabled={deletePledge.isPending}
            >
              {deletePledge.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGodViewPledges;
