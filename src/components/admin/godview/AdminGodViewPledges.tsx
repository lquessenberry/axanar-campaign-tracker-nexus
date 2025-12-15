import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Loader2, CheckCircle, Clock
} from 'lucide-react';
import { AdminDonorFullData, AdminPledge } from '@/hooks/useAdminDonorFullProfile';
import { useAdminDonorMutations, PledgeUpdateData } from '@/hooks/useAdminDonorMutations';
import InlineEditField from './InlineEditField';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LCARSDataTable, LCARSDataTableColumn, LCARSBulkAction } from '@/components/admin/lcars';

interface AdminGodViewPledgesProps {
  donorData: AdminDonorFullData;
}

const AdminGodViewPledges = ({ donorData }: AdminGodViewPledgesProps) => {
  const { donor, pledges } = donorData;
  const donorId = donor?.id || null;
  const { updatePledge, createPledge, deletePledge, bulkUpdatePledges } = useAdminDonorMutations(donorId);
  
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

  const handleBulkShippingUpdate = async (selectedRows: AdminPledge[], status: string) => {
    if (selectedRows.length === 0) return;
    
    await bulkUpdatePledges.mutateAsync({
      pledgeIds: selectedRows.map(p => p.id),
      data: {
        shipping_status: status,
        shipped_at: status === 'shipped' ? new Date().toISOString() : undefined,
        delivered_at: status === 'delivered' ? new Date().toISOString() : undefined,
      },
    });
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

  // Define columns for LCARSDataTable
  const columns: LCARSDataTableColumn<AdminPledge>[] = [
    {
      key: 'campaign',
      header: 'Campaign',
      sortable: true,
      render: (pledge) => (
        <span className="font-medium">
          {pledge.campaign?.name || 'Unknown'}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      align: 'right',
      render: (pledge) => (
        <InlineEditField
          value={pledge.amount}
          type="number"
          prefix="$"
          onSave={(value) => handleUpdateField(pledge.id, 'amount', Number(value))}
          ariaLabel="Edit pledge amount"
        />
      ),
    },
    {
      key: 'reward',
      header: 'Reward',
      render: (pledge) => (
        <span className="text-sm">
          {pledge.reward?.name || <span className="text-muted-foreground italic">None</span>}
        </span>
      ),
    },
    {
      key: 'shipping_status',
      header: 'Shipping',
      render: (pledge) => {
        if (!pledge.reward?.is_physical) {
          return <span className="text-muted-foreground text-sm">N/A</span>;
        }
        return (
          <ShippingStatusBadge
            status={pledge.shipping_status}
            onStatusChange={(status) => handleUpdateField(pledge.id, 'shipping_status', status)}
          />
        );
      },
    },
    {
      key: 'tracking_number',
      header: 'Tracking',
      render: (pledge) => {
        if (!pledge.reward?.is_physical) {
          return <span className="text-muted-foreground">—</span>;
        }
        return (
          <InlineEditField
            value={pledge.tracking_number}
            type="text"
            placeholder="Add tracking..."
            emptyText="—"
            onSave={(value) => handleUpdateField(pledge.id, 'tracking_number', value)}
            ariaLabel="Edit tracking number"
          />
        );
      },
    },
    {
      key: 'created_at',
      header: 'Date',
      sortable: true,
      render: (pledge) => (
        <span className="text-sm text-muted-foreground">
          {new Date(pledge.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '40px',
      render: (pledge) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => setShowDeleteDialog({ open: true, pledgeId: pledge.id })}
          aria-label="Delete pledge"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  // Define bulk actions
  const bulkActions: LCARSBulkAction<AdminPledge>[] = [
    {
      label: 'Mark Shipped',
      icon: <Package className="h-4 w-4" />,
      onClick: (rows) => handleBulkShippingUpdate(rows, 'shipped'),
    },
    {
      label: 'Mark Delivered',
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (rows) => handleBulkShippingUpdate(rows, 'delivered'),
    },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Pledges ({pledges.length})
        </h2>

        <Button onClick={() => setShowAddDialog(true)} size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Add Pledge
        </Button>
      </div>

      {/* LCARS Data Table */}
      <LCARSDataTable
        data={pledges}
        columns={columns}
        bulkActions={bulkActions}
        searchable={true}
        searchPlaceholder="Search pledges..."
        searchKeys={['campaign', 'reward']}
        selectable={true}
        emptyMessage="No pledges found"
        compact={false}
      />

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

// Shipping Status Badge Component
interface ShippingStatusBadgeProps {
  status: string | null;
  onStatusChange: (status: string) => void;
}

const ShippingStatusBadge = ({ status, onStatusChange }: ShippingStatusBadgeProps) => {
  const statusConfig = {
    pending: { label: 'Pending', variant: 'secondary' as const, next: 'shipped' },
    shipped: { label: 'Shipped', variant: 'default' as const, next: 'delivered' },
    delivered: { label: 'Delivered', variant: 'default' as const, next: null },
  };

  const currentStatus = status || 'pending';
  const config = statusConfig[currentStatus as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'cursor-pointer text-xs',
        currentStatus === 'delivered' && 'bg-green-600 hover:bg-green-700',
        currentStatus === 'shipped' && 'bg-blue-600 hover:bg-blue-700',
        config.next && 'hover:scale-105 transition-transform'
      )}
      onClick={() => config.next && onStatusChange(config.next)}
      title={config.next ? `Click to mark as ${config.next}` : 'Delivered'}
    >
      {currentStatus === 'pending' && <Clock className="h-3 w-3 mr-1" />}
      {currentStatus === 'shipped' && <Package className="h-3 w-3 mr-1" />}
      {currentStatus === 'delivered' && <CheckCircle className="h-3 w-3 mr-1" />}
      {config.label}
    </Badge>
  );
};

export default AdminGodViewPledges;
