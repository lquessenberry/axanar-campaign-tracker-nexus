import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DaystromCard } from "@/components/ui/daystrom-card";
import { useUserRewards } from "@/hooks/useUserRewards";
import { DAYSTROM_SPRINGS } from "@/lib/daystrom-springs";
import { Gift, Package, Truck, CheckCircle2, Clock, AlertCircle, DollarSign, Calendar } from "lucide-react";

const RewardsShowcase: React.FC = () => {
  const { data: pledges, isLoading } = useUserRewards();

  const rewardsWithPerks = pledges?.filter(pledge => pledge.reward) || [];
  const physicalRewards = rewardsWithPerks.filter(p => p.reward?.requires_shipping);
  const digitalRewards = rewardsWithPerks.filter(p => !p.reward?.requires_shipping);
  
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
      <DaystromCard className="p-8">
        <div className="text-center">
          <Gift className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-bold mb-2">No Perks Yet</h3>
          <p className="text-muted-foreground">
            Start backing campaigns to unlock exclusive perks and rewards!
          </p>
        </div>
      </DaystromCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-light tracking-wide mb-2">Your Perks & Rewards</h2>
          <p className="text-muted-foreground">
            {rewardsWithPerks.length} perk{rewardsWithPerks.length !== 1 ? 's' : ''} earned across all campaigns
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={DAYSTROM_SPRINGS.snappy}
        >
          <Badge variant="outline" className="text-lg px-4 py-2 bg-primary/10 border-primary/20">
            <Gift className="h-4 w-4 mr-2" />
            {rewardsWithPerks.length}
          </Badge>
        </motion.div>
      </div>

      {/* Physical Rewards */}
      {physicalRewards.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-light tracking-wide">Physical Rewards</h3>
            <Badge variant="secondary">{physicalRewards.length}</Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {physicalRewards.map((pledge, index) => {
              const statusConfig = getShippingStatusConfig(pledge.shipping_status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <motion.div
                  key={pledge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...DAYSTROM_SPRINGS.gentle, delay: index * 0.1 }}
                  layoutId={`reward-${pledge.id}`}
                >
                  <DaystromCard className="h-full hover:border-primary/30 transition-colors">
                    <CardContent className="p-6">
                      {/* Campaign & Amount */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg mb-1">{pledge.reward?.name}</h4>
                          <p className="text-sm text-muted-foreground">{pledge.campaign.name}</p>
                        </div>
                        <Badge variant="outline" className="bg-background">
                          ${Number(pledge.amount).toFixed(0)}
                        </Badge>
                      </div>

                      {/* Description */}
                      {pledge.reward?.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {pledge.reward.description}
                        </p>
                      )}

                      {/* Shipping Status */}
                      <div className={`rounded-daystrom-small p-4 ${statusConfig.bg} border ${statusConfig.border}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                          <span className={`font-semibold ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        
                        {pledge.tracking_number && (
                          <div className="text-xs text-muted-foreground mt-2">
                            <span className="font-medium">Tracking:</span>{' '}
                            <code className="bg-background/50 px-2 py-1 rounded">
                              {pledge.tracking_number}
                            </code>
                          </div>
                        )}
                        
                        {pledge.delivered_at && (
                          <div className="text-xs text-muted-foreground mt-1">
                            <CheckCircle2 className="h-3 w-3 inline mr-1" />
                            Delivered: {new Date(pledge.delivered_at).toLocaleDateString()}
                          </div>
                        )}
                        
                        {pledge.shipped_at && !pledge.delivered_at && (
                          <div className="text-xs text-muted-foreground mt-1">
                            <Truck className="h-3 w-3 inline mr-1" />
                            Shipped: {new Date(pledge.shipped_at).toLocaleDateString()}
                          </div>
                        )}
                        
                        {pledge.shipping_notes && (
                          <div className="text-xs text-muted-foreground mt-2 italic border-t border-border/50 pt-2">
                            {pledge.shipping_notes}
                          </div>
                        )}
                      </div>

                      {/* Pledge Date */}
                      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Pledged: {new Date(pledge.created_at).toLocaleDateString()}
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
