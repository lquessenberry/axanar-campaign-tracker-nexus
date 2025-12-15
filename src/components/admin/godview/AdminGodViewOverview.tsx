import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, Gift, Package, MapPin, Calendar, 
  TrendingUp, AlertCircle, CheckCircle, Clock, Users
} from 'lucide-react';
import { AdminDonorFullData, AdminPledge } from '@/hooks/useAdminDonorFullProfile';
import InlineEditField from './InlineEditField';
import { useAdminDonorMutations } from '@/hooks/useAdminDonorMutations';
import { cn } from '@/lib/utils';
import { LCARSStatCard } from '@/components/admin/lcars';

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

  // Generate sparkline data from pledges (by month, last 6 months simulation)
  const generateSparklineData = () => {
    if (pledges.length === 0) return [];
    // Simple sparkline showing pledge amounts (last 6 or available)
    return pledges.slice(0, 6).map(p => p.amount).reverse();
  };

  // Calculate trend (compare first half vs second half of pledges)
  const calculateTrend = () => {
    if (pledges.length < 2) return undefined;
    const mid = Math.floor(pledges.length / 2);
    const recentSum = pledges.slice(0, mid).reduce((sum, p) => sum + p.amount, 0);
    const olderSum = pledges.slice(mid).reduce((sum, p) => sum + p.amount, 0);
    if (olderSum === 0) return undefined;
    const change = ((recentSum - olderSum) / olderSum) * 100;
    return { value: Math.round(change), label: 'vs prior' };
  };

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
    <div className="p-4 space-y-4">
      {/* LCARS Stat Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <LCARSStatCard
          title="Total Donated"
          value={`$${stats.totalDonated.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="h-4 w-4" />}
          variant="primary"
          sparklineData={generateSparklineData()}
          trend={calculateTrend()}
        />
        
        <LCARSStatCard
          title="Pledges"
          value={stats.pledgeCount}
          subtitle={`${stats.campaignsSupported} campaigns`}
          icon={<Gift className="h-4 w-4" />}
          variant="default"
        />
        
        <LCARSStatCard
          title="Physical Rewards"
          value={stats.physicalRewardsCount}
          subtitle={pendingShipments > 0 ? `${pendingShipments} pending` : 'All shipped'}
          icon={<Package className="h-4 w-4" />}
          variant={pendingShipments > 0 ? 'warning' : 'success'}
        />
        
        <LCARSStatCard
          title="Digital Perks"
          value={stats.digitalPerksCount}
          icon={<Users className="h-4 w-4" />}
          variant="default"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
