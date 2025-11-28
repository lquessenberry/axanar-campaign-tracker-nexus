import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DaystromCard } from "@/components/ui/daystrom-card";
import { useUserRewards } from "@/hooks/useUserRewards";
import { useAuth } from "@/contexts/AuthContext";
import { DAYSTROM_SPRINGS } from "@/lib/daystrom-springs";
import { Gift, Package, Truck, CheckCircle2, Clock, DollarSign, Calendar, Award, AlertCircle } from "lucide-react";
import { MissingPledgeDataAlert } from "./MissingPledgeDataAlert";
import { AccountMergeAlert } from "./AccountMergeAlert";

const RewardsShowcase: React.FC = () => {
  const { user } = useAuth();
  const { data: pledges, isLoading: rewardsLoading } = useUserRewards();
  
  const isLoading = rewardsLoading;

  const rewardsWithPerks = pledges?.filter(pledge => pledge.reward) || [];
  const physicalRewards = rewardsWithPerks.filter(p => p.reward?.requires_shipping);
  const digitalRewards = rewardsWithPerks.filter(p => !p.reward?.requires_shipping);
  
  const totalItems = rewardsWithPerks.length;
  
  const getShippingStatusConfig = (status?: string | null) => {
    switch (status) {
      case 'delivered':
        return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'Delivered' };
      case 'shipped':
        return { icon: Truck, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'In Transit' };
      case 'processing':
        return { icon: Package, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'Processing' };
      default:
        return { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted/30', border: 'border-border', label: 'Pending' };
    }
  };

  if (isLoading) {
    return (
      <DaystromCard className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DaystromCard>
    );
  }

  if (!rewardsWithPerks.length) {
    return (
      <div className="space-y-4">
        <AccountMergeAlert />
        <MissingPledgeDataAlert />
        <DaystromCard className="p-8">
          <div className="text-center">
            <Gift className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-bold mb-2">No Perks Yet</h3>
            <p className="text-muted-foreground">
              Start backing campaigns to unlock exclusive perks and rewards!
            </p>
          </div>
        </DaystromCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-light tracking-wide mb-2">Your Perks & Rewards</h2>
          <p className="text-muted-foreground">
            {totalItems} total item{totalItems !== 1 ? 's' : ''} earned across all campaigns
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={DAYSTROM_SPRINGS.snappy}
        >
          <Badge variant="outline" className="text-lg px-4 py-2 bg-primary/10 border-primary/20">
            <Gift className="h-4 w-4 mr-2" />
            {totalItems}
          </Badge>
        </motion.div>
      </div>

      {/* Physical Rewards - Enhanced Display */}
      {physicalRewards.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-light tracking-wide">Physical Rewards</h3>
            <Badge variant="secondary">{physicalRewards.length}</Badge>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {physicalRewards.map((pledge, index) => {
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
                  layoutId={`reward-${pledge.id}`}
                >
                  <DaystromCard className="overflow-hidden hover:border-primary/40 transition-all duration-300">
                    {/* Header with gradient */}
                    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                              <Package className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-bold text-xl">{pledge.reward?.name}</h4>
                              <p className="text-sm text-muted-foreground">{pledge.campaign.name}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant="outline" className="bg-background text-base px-3 py-1">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {Number(pledge.amount).toFixed(0)}
                          </Badge>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {pledgeDate.toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {pledge.reward?.description && (
                        <p className="text-sm text-muted-foreground mt-3 pl-14">
                          {pledge.reward.description}
                        </p>
                      )}
                    </div>

                    <CardContent className="p-6">
                      {/* Status Timeline */}
                      <div className="space-y-4">
                        {/* Current Status Banner */}
                        <div className={`rounded-lg p-4 ${statusConfig.bg} border-2 ${statusConfig.border} shadow-sm`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-background/50">
                                <StatusIcon className={`h-6 w-6 ${statusConfig.color}`} />
                              </div>
                              <div>
                                <div className={`font-bold text-lg ${statusConfig.color}`}>
                                  {statusConfig.label}
                                </div>
                                {pledge.shipping_status === 'pending' && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Awaiting fulfillment
                                  </p>
                                )}
                                {pledge.shipping_status === 'processing' && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Preparing your order
                                  </p>
                                )}
                                {pledge.shipping_status === 'shipped' && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    On the way to you
                                  </p>
                                )}
                                {pledge.shipping_status === 'delivered' && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Successfully received
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {/* Progress Indicator */}
                            <div className="hidden sm:flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${pledge.shipping_status ? 'bg-green-500' : 'bg-muted'}`} />
                              <div className={`h-2 w-2 rounded-full ${shippedDate ? 'bg-green-500' : 'bg-muted'}`} />
                              <div className={`h-2 w-2 rounded-full ${deliveredDate ? 'bg-green-500' : 'bg-muted'}`} />
                            </div>
                          </div>
                        </div>

                        {/* Tracking Details */}
                        {(pledge.tracking_number || shippedDate || deliveredDate) && (
                          <div className="space-y-3 pt-2">
                            {pledge.tracking_number && (
                              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                                <Truck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                    Tracking Number
                                  </div>
                                  <code className="text-sm font-mono bg-background px-3 py-1.5 rounded border border-border inline-block">
                                    {pledge.tracking_number}
                                  </code>
                                </div>
                              </div>
                            )}
                            
                            {/* Timeline */}
                            <div className="space-y-2">
                              {shippedDate && (
                                <div className="flex items-center gap-3 text-sm">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20">
                                    <Truck className="h-4 w-4 text-blue-500" />
                                  </div>
                                  <div className="flex-1">
                                    <span className="font-medium">Shipped</span>
                                    <span className="text-muted-foreground ml-2">
                                      {shippedDate.toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric', 
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </div>
                              )}
                              
                              {deliveredDate && (
                                <div className="flex items-center gap-3 text-sm">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  </div>
                                  <div className="flex-1">
                                    <span className="font-medium">Delivered</span>
                                    <span className="text-muted-foreground ml-2">
                                      {deliveredDate.toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric', 
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Shipping Notes */}
                        {pledge.shipping_notes && (
                          <div className="mt-4 p-4 rounded-lg bg-muted/20 border border-border/50">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                  Notes
                                </div>
                                <p className="text-sm text-foreground">
                                  {pledge.shipping_notes}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </DaystromCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Digital Rewards */}
      {digitalRewards.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-light tracking-wide">Digital Perks</h3>
            <Badge variant="secondary">{digitalRewards.length}</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {digitalRewards.map((pledge, index) => (
              <motion.div
                key={pledge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...DAYSTROM_SPRINGS.gentle, delay: (physicalRewards.length + index) * 0.1 }}
                layoutId={`reward-${pledge.id}`}
              >
                <DaystromCard className="h-full hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold mb-1">{pledge.reward?.name}</h4>
                        <p className="text-xs text-muted-foreground">{pledge.campaign.name}</p>
                      </div>
                      <Badge variant="outline" className="bg-primary/10 border-primary/20">
                        ${Number(pledge.amount).toFixed(0)}
                      </Badge>
                    </div>

                    {pledge.reward?.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                        {pledge.reward.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-3 border-t border-border/50">
                      <Calendar className="h-3 w-3" />
                      {new Date(pledge.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </DaystromCard>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardsShowcase;
