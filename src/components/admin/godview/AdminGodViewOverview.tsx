import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, Gift, Package, MapPin, Calendar, 
  TrendingUp, AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import { AdminDonorFullData, AdminPledge } from '@/hooks/useAdminDonorFullProfile';
import InlineEditField from './InlineEditField';
import { useAdminDonorMutations } from '@/hooks/useAdminDonorMutations';
import { cn } from '@/lib/utils';

interface AdminGodViewOverviewProps {
  donorData: AdminDonorFullData;
}

const AdminGodViewOverview = ({ donorData }: AdminGodViewOverviewProps) => {
  const { donor, stats, pledges, addresses } = donorData;
  const { updatePledge } = useAdminDonorMutations(donor?.id || null);

  // Get recent pledges (top 3)
  const recentPledges = pledges.slice(0, 3);
  
  // Calculate status indicators
  const pendingShipments = pledges.filter(
    p => p.reward?.is_physical && (!p.shipping_status || p.shipping_status === 'pending')
  ).length;
  
  const primaryAddress = addresses.find(a => a.is_primary);
  const hasAddress = addresses.length > 0;

  const handleQuickShippingUpdate = async (pledgeId: string, status: string) => {
    await updatePledge.mutateAsync({
      pledgeId,
      data: { 
        shipping_status: status,
        shipped_at: status === 'shipped' ? new Date().toISOString() : undefined,
        delivered_at: status === 'delivered' ? new Date().toISOString() : undefined,
      },
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {/* Stats Column */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Donor Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Donated</span>
            <span className="text-xl font-bold text-primary">
              ${stats.totalDonated.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Pledges</span>
            <span className="font-semibold">{stats.pledgeCount}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Campaigns</span>
            <span className="font-semibold">{stats.campaignsSupported}</span>
          </div>

          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Gift className="h-3 w-3" /> Physical Rewards
              </span>
              <span>{stats.physicalRewardsCount}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Package className="h-3 w-3" /> Digital Perks
              </span>
              <span>{stats.digitalPerksCount}</span>
            </div>
          </div>

          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">First Pledge</span>
              <span>
                {stats.firstPledgeDate 
                  ? new Date(stats.firstPledgeDate).toLocaleDateString() 
                  : '—'}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last Pledge</span>
              <span>
                {stats.lastPledgeDate 
                  ? new Date(stats.lastPledgeDate).toLocaleDateString() 
                  : '—'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Pledges Column */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Recent Pledges
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentPledges.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No pledges yet</p>
          ) : (
            <div className="space-y-3">
              {recentPledges.map((pledge) => (
                <div
                  key={pledge.id}
                  className="p-3 rounded-lg bg-muted/50 border border-border/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate max-w-[60%]">
                      {pledge.campaign?.name || 'Unknown Campaign'}
                    </span>
                    <InlineEditField
                      value={pledge.amount}
                      type="number"
                      prefix="$"
                      onSave={async (value) => {
                        await updatePledge.mutateAsync({
                          pledgeId: pledge.id,
                          data: { amount: Number(value) },
                          oldData: { amount: pledge.amount },
                        });
                      }}
                      className="font-semibold text-primary"
                      ariaLabel={`Edit amount for ${pledge.campaign?.name}`}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {new Date(pledge.created_at).toLocaleDateString()}
                    </span>
                    {pledge.reward?.is_physical && (
                      <ShippingStatusBadge 
                        status={pledge.shipping_status} 
                        onStatusChange={(status) => handleQuickShippingUpdate(pledge.id, status)}
                      />
                    )}
                  </div>
                  
                  {pledge.reward && (
                    <p className="text-xs text-muted-foreground truncate">
                      Reward: {pledge.reward.name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Column */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-primary" />
            Account Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Auth Status */}
          <StatusItem
            label="Auth Account"
            status={stats.hasAuthAccount ? 'good' : 'warning'}
            value={stats.hasAuthAccount ? 'Linked' : 'Not Linked'}
            icon={stats.hasAuthAccount ? CheckCircle : AlertCircle}
          />

          {/* Address Status */}
          <StatusItem
            label="Shipping Address"
            status={hasAddress ? 'good' : 'warning'}
            value={hasAddress 
              ? `${addresses.length} address${addresses.length > 1 ? 'es' : ''}`
              : 'No address'
            }
            icon={MapPin}
          />

          {/* Pending Shipments */}
          <StatusItem
            label="Pending Shipments"
            status={pendingShipments > 0 ? 'warning' : 'neutral'}
            value={pendingShipments > 0 ? `${pendingShipments} pending` : 'All shipped'}
            icon={Package}
          />

          {/* Member Since */}
          <StatusItem
            label="Member Since"
            status="neutral"
            value={stats.memberSince 
              ? new Date(stats.memberSince).toLocaleDateString() 
              : 'Unknown'}
            icon={Calendar}
          />

          {/* Primary Address Preview */}
          {primaryAddress && (
            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted-foreground mb-1">Primary Address</p>
              <p className="text-sm">
                {[
                  primaryAddress.address1,
                  primaryAddress.city,
                  primaryAddress.state,
                  primaryAddress.postal_code,
                ].filter(Boolean).join(', ')}
              </p>
              <p className="text-xs text-muted-foreground">{primaryAddress.country}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Helper components
interface StatusItemProps {
  label: string;
  status: 'good' | 'warning' | 'error' | 'neutral';
  value: string;
  icon: React.ElementType;
}

const StatusItem = ({ label, status, value, icon: Icon }: StatusItemProps) => {
  const statusColors = {
    good: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-destructive',
    neutral: 'text-muted-foreground',
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground flex items-center gap-2">
        <Icon className={cn('h-4 w-4', statusColors[status])} />
        {label}
      </span>
      <span className={cn('text-sm font-medium', statusColors[status])}>
        {value}
      </span>
    </div>
  );
};

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

export default AdminGodViewOverview;
