import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gift, Package, Truck, CheckCircle, Clock, AlertCircle, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { useAdminDonorMutations } from '@/hooks/useAdminDonorMutations';
import { toast } from '@/components/ui/use-toast';
import { LCARSDataTable, LCARSDataTableColumn, LCARSBulkAction, LCARSStatCard } from '@/components/admin/lcars';
import { cn } from '@/lib/utils';

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
  const [editingPledge, setEditingPledge] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    shipping_status: string;
    tracking_number: string;
    shipping_notes: string;
  }>({ shipping_status: '', tracking_number: '', shipping_notes: '' });

  const { updatePledge, bulkUpdatePledges } = useAdminDonorMutations(donorId);

  // Filter pledges that have rewards
  const rewardPledges = pledges.filter(p => p.reward);
  const physicalRewards = rewardPledges.filter(p => p.reward?.is_physical);
  const digitalRewards = rewardPledges.filter(p => !p.reward?.is_physical);

  // Calculate stats
  const pendingCount = physicalRewards.filter(p => !p.shipping_status || p.shipping_status === 'pending').length;
  const shippedCount = physicalRewards.filter(p => p.shipping_status === 'shipped').length;
  const deliveredCount = physicalRewards.filter(p => p.shipping_status === 'delivered').length;

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

  const handleBulkUpdate = async (selectedRows: Pledge[], status: string) => {
    if (selectedRows.length === 0) {
      toast({
        title: 'No rewards selected',
        description: 'Please select at least one reward to update.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await bulkUpdatePledges.mutateAsync({
        pledgeIds: selectedRows.map(p => p.id),
        data: {
          shipping_status: status,
          shipped_at: status === 'shipped' ? new Date().toISOString() : undefined,
          delivered_at: status === 'delivered' ? new Date().toISOString() : undefined,
        },
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const getStatusBadge = (status: string | null) => {
    const statusConfig = SHIPPING_STATUSES.find(s => s.value === status) || SHIPPING_STATUSES[0];
    const Icon = statusConfig.icon;
    return (
      <Badge className={cn(statusConfig.color, 'gap-1')}>
        <Icon className="h-3 w-3" />
        {statusConfig.label}
      </Badge>
    );
  };

  // Physical rewards columns
  const physicalColumns: LCARSDataTableColumn<Pledge>[] = [
    {
      key: 'reward',
      header: 'Reward',
      sortable: true,
      render: (pledge) => (
        <div>
          <p className="font-medium text-sm">{pledge.reward?.name}</p>
          <p className="text-xs text-muted-foreground">{pledge.campaign?.name}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      align: 'right',
      render: (pledge) => <span className="font-medium">${pledge.amount}</span>,
    },
    {
      key: 'shipping_status',
      header: 'Status',
      render: (pledge) => {
        if (editingPledge === pledge.id) {
          return (
            <Select
              value={editData.shipping_status}
              onValueChange={(v) => setEditData(prev => ({ ...prev, shipping_status: v }))}
            >
              <SelectTrigger className="w-[130px] h-8">
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
          );
        }
        return getStatusBadge(pledge.shipping_status);
      },
    },
    {
      key: 'tracking_number',
      header: 'Tracking',
      render: (pledge) => {
        if (editingPledge === pledge.id) {
          return (
            <Input
              placeholder="Tracking #"
              value={editData.tracking_number}
              onChange={(e) => setEditData(prev => ({ ...prev, tracking_number: e.target.value }))}
              className="h-8 w-[140px]"
            />
          );
        }
        return pledge.tracking_number ? (
          <span className="text-sm font-mono">{pledge.tracking_number}</span>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        );
      },
    },
    {
      key: 'dates',
      header: 'Dates',
      render: (pledge) => (
        <div className="text-xs text-muted-foreground">
          {pledge.shipped_at && <p>Shipped: {format(new Date(pledge.shipped_at), 'MMM d, yyyy')}</p>}
          {pledge.delivered_at && <p>Delivered: {format(new Date(pledge.delivered_at), 'MMM d, yyyy')}</p>}
          {!pledge.shipped_at && !pledge.delivered_at && <span>—</span>}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '80px',
      render: (pledge) => {
        if (editingPledge === pledge.id) {
          return (
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" onClick={saveEdit} disabled={updatePledge.isPending}>
                <Save className="h-4 w-4 text-green-400" />
              </Button>
              <Button size="icon" variant="ghost" onClick={cancelEdit}>
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          );
        }
        return (
          <Button size="sm" variant="ghost" onClick={() => startEdit(pledge)}>
            Edit
          </Button>
        );
      },
    },
  ];

  // Digital rewards columns
  const digitalColumns: LCARSDataTableColumn<Pledge>[] = [
    {
      key: 'reward',
      header: 'Reward',
      sortable: true,
      render: (pledge) => (
        <div>
          <p className="font-medium text-sm">{pledge.reward?.name}</p>
          {pledge.reward?.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">{pledge.reward.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'campaign',
      header: 'Campaign',
      render: (pledge) => <span className="text-sm">{pledge.campaign?.name}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      align: 'right',
      render: (pledge) => <span className="font-medium">${pledge.amount}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: () => (
        <Badge className="bg-green-500/20 text-green-400 gap-1">
          <CheckCircle className="h-3 w-3" />
          Fulfilled
        </Badge>
      ),
    },
  ];

  // Bulk actions for physical rewards
  const bulkActions: LCARSBulkAction<Pledge>[] = [
    {
      label: 'Mark Shipped',
      icon: <Truck className="h-4 w-4" />,
      onClick: (rows) => handleBulkUpdate(rows, 'shipped'),
    },
    {
      label: 'Mark Delivered',
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (rows) => handleBulkUpdate(rows, 'delivered'),
    },
  ];

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
    <div className="space-y-6 p-4">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <LCARSStatCard
          title="Physical Rewards"
          value={physicalRewards.length}
          icon={<Package className="h-4 w-4" />}
          variant="primary"
        />
        <LCARSStatCard
          title="Pending"
          value={pendingCount}
          icon={<Clock className="h-4 w-4" />}
          variant={pendingCount > 0 ? 'warning' : 'default'}
        />
        <LCARSStatCard
          title="Shipped"
          value={shippedCount}
          icon={<Truck className="h-4 w-4" />}
          variant="default"
        />
        <LCARSStatCard
          title="Delivered"
          value={deliveredCount}
          icon={<CheckCircle className="h-4 w-4" />}
          variant="success"
        />
      </div>

      {/* Physical Rewards Table */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Physical Rewards
        </h3>
        <LCARSDataTable
          data={physicalRewards}
          columns={physicalColumns}
          bulkActions={bulkActions}
          searchable={true}
          searchPlaceholder="Search rewards..."
          selectable={true}
          emptyMessage="No physical rewards found"
        />
      </div>

      {/* Digital Rewards Table */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Gift className="h-5 w-5 text-cyan-400" />
          Digital Rewards
        </h3>
        <LCARSDataTable
          data={digitalRewards}
          columns={digitalColumns}
          searchable={false}
          selectable={false}
          emptyMessage="No digital rewards found"
          compact
        />
      </div>
    </div>
  );
};

export default AdminGodViewRewards;
