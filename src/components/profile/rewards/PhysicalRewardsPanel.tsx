import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DaystromCard } from "@/components/ui/daystrom-card";
import { DAYSTROM_SPRINGS } from "@/lib/daystrom-springs";
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Calendar, 
  AlertCircle,
  MapPin
} from "lucide-react";
import { AdminPledgeEditor } from "../AdminPledgeEditor";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { MissingPledgeDataAlert } from "../MissingPledgeDataAlert";
import { AccountMergeAlert } from "../AccountMergeAlert";

interface PhysicalRewardsPanelProps {
  pledges: any[];
  isLoading: boolean;
}

const getShippingStatusConfig = (status?: string | null) => {
  switch (status) {
    case 'delivered':
      return { 
        icon: CheckCircle2, 
        color: 'text-green-500', 
        bg: 'bg-green-500/10', 
        border: 'border-green-500/30', 
        label: 'Delivered',
        glow: 'shadow-green-500/20'
      };
    case 'shipped':
      return { 
        icon: Truck, 
        color: 'text-blue-500', 
        bg: 'bg-blue-500/10', 
        border: 'border-blue-500/30', 
        label: 'In Transit',
        glow: 'shadow-blue-500/20'
      };
    case 'processing':
      return { 
        icon: Package, 
        color: 'text-yellow-500', 
        bg: 'bg-yellow-500/10', 
        border: 'border-yellow-500/30', 
        label: 'Processing',
        glow: 'shadow-yellow-500/20'
      };
    default:
      return { 
        icon: Clock, 
        color: 'text-muted-foreground', 
        bg: 'bg-muted/30', 
        border: 'border-border', 
        label: 'Pending',
        glow: ''
      };
  }
};

export const PhysicalRewardsPanel: React.FC<PhysicalRewardsPanelProps> = ({
  pledges,
  isLoading
}) => {
  const { data: isAdmin } = useAdminCheck();

  if (isLoading) {
    return (
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Physical Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pledges.length === 0) {
    return (
      <div className="space-y-4">
        <AccountMergeAlert />
        <MissingPledgeDataAlert />
        <Card className="border-2 border-dashed border-muted-foreground/30">
          <CardContent className="py-12">
            <div className="text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">No Physical Rewards</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Physical rewards from your campaign pledges will appear here with shipping tracking.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-4 border-b border-primary/20">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <span>Physical Rewards</span>
          </CardTitle>
          <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary">
            {pledges.length} Item{pledges.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {pledges.map((pledge, index) => {
          const statusConfig = getShippingStatusConfig(pledge.shipping_status);
          const StatusIcon = statusConfig.icon;
          const pledgeDate = new Date(pledge.created_at);
          const shippedDate = pledge.shipped_at ? new Date(pledge.shipped_at) : null;
          const deliveredDate = pledge.delivered_at ? new Date(pledge.delivered_at) : null;

          return (
            <motion.div
              key={pledge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...DAYSTROM_SPRINGS.gentle, delay: index * 0.1 }}
              layoutId={`physical-reward-${pledge.id}`}
            >
              <DaystromCard className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${statusConfig.glow}`}>
                {/* Reward Header */}
                <div className="p-4 border-b border-border/50 bg-gradient-to-r from-background to-muted/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg truncate">{pledge.reward?.name}</h4>
                      <p className="text-sm text-muted-foreground">{pledge.campaign.name}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant="outline" className="bg-background">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {Number(pledge.amount).toFixed(0)}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {pledgeDate.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {pledge.reward?.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {pledge.reward.description}
                    </p>
                  )}
                </div>

                {/* Status Section */}
                <div className="p-4">
                  <div className={`rounded-lg p-4 ${statusConfig.bg} border ${statusConfig.border}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-background/80">
                          <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                        </div>
                        <div>
                          <div className={`font-bold ${statusConfig.color}`}>
                            {statusConfig.label}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {pledge.shipping_status === 'pending' && 'Awaiting fulfillment'}
                            {pledge.shipping_status === 'processing' && 'Preparing your order'}
                            {pledge.shipping_status === 'shipped' && 'On the way to you'}
                            {pledge.shipping_status === 'delivered' && 'Successfully received'}
                            {!pledge.shipping_status && 'Awaiting fulfillment'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Progress Dots */}
                      <div className="flex items-center gap-1.5">
                        <div className={`h-2.5 w-2.5 rounded-full transition-colors ${
                          pledge.shipping_status ? 'bg-green-500' : 'bg-muted'
                        }`} />
                        <div className={`h-2.5 w-2.5 rounded-full transition-colors ${
                          shippedDate ? 'bg-green-500' : 'bg-muted'
                        }`} />
                        <div className={`h-2.5 w-2.5 rounded-full transition-colors ${
                          deliveredDate ? 'bg-green-500' : 'bg-muted'
                        }`} />
                      </div>
                    </div>
                  </div>

                  {/* Tracking Info */}
                  {pledge.tracking_number && (
                    <div className="mt-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Tracking:</span>
                        <code className="font-mono bg-background px-2 py-0.5 rounded text-xs">
                          {pledge.tracking_number}
                        </code>
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  {(shippedDate || deliveredDate) && (
                    <div className="mt-3 space-y-2">
                      {shippedDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <Truck className="h-4 w-4 text-blue-500" />
                          <span>Shipped {shippedDate.toLocaleDateString()}</span>
                        </div>
                      )}
                      {deliveredDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Delivered {deliveredDate.toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {pledge.shipping_notes && (
                    <div className="mt-3 p-3 rounded-lg bg-muted/20 border border-border/50">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <p className="text-sm">{pledge.shipping_notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Admin Controls */}
                  {isAdmin && (
                    <AdminPledgeEditor
                      pledgeId={pledge.id}
                      currentStatus={pledge.shipping_status}
                      currentShippedAt={pledge.shipped_at}
                      currentDeliveredAt={pledge.delivered_at}
                      currentTrackingNumber={pledge.tracking_number}
                      currentShippingNotes={pledge.shipping_notes}
                    />
                  )}
                </div>
              </DaystromCard>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
};