import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DaystromCard } from "@/components/ui/daystrom-card";
import { useUserRewards } from "@/hooks/useUserRewards";
import { useAmbassadorialTitles } from "@/hooks/useAmbassadorialTitles";
import { useAuth } from "@/contexts/AuthContext";
import { TitleBadgeDisplay } from "./TitleBadgeDisplay";
import { DAYSTROM_SPRINGS } from "@/lib/daystrom-springs";
import { Gift, Package, Truck, CheckCircle2, Clock, AlertCircle, DollarSign, Calendar, Crown, Award } from "lucide-react";
import { MissingPledgeDataAlert } from "./MissingPledgeDataAlert";

const RewardsShowcase: React.FC = () => {
  const { user } = useAuth();
  const { data: pledges, isLoading: rewardsLoading } = useUserRewards();
  const { data: titleData, isLoading: titlesLoading } = useAmbassadorialTitles(user?.id);
  
  const isLoading = rewardsLoading || titlesLoading;

  const rewardsWithPerks = pledges?.filter(pledge => pledge.reward) || [];
  const physicalRewards = rewardsWithPerks.filter(p => p.reward?.requires_shipping);
  const digitalRewards = rewardsWithPerks.filter(p => !p.reward?.requires_shipping);
  
  const primaryTitle = titleData?.primaryTitle;
  const displayedTitles = titleData?.titles.filter(t => t.is_displayed) || [];
  const totalItems = rewardsWithPerks.length + (displayedTitles.length > 0 ? 1 : 0);
  
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

  if (!rewardsWithPerks.length && !displayedTitles.length) {
    return (
      <div className="space-y-4">
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

      {/* Ambassadorial Titles Collection */}
      {displayedTitles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={DAYSTROM_SPRINGS.gentle}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-light tracking-wide">Diplomatic Titles</h3>
            <Badge variant="secondary">{displayedTitles.length}</Badge>
          </div>

          <DaystromCard className="p-6 bg-gradient-to-br from-primary/5 via-transparent to-primary/5">
            {/* Primary Title Showcase */}
            {primaryTitle && (
              <div className="mb-6 pb-6 border-b border-border/50">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="h-5 w-5 text-primary" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Primary Title
                      </span>
                    </div>
                    <TitleBadgeDisplay title={primaryTitle} size="lg" />
                  </div>
                  <div className="flex flex-col gap-2 text-right">
                    {primaryTitle.xp_multiplier > 1 && (
                      <div className="text-sm">
                        <span className="text-primary font-bold text-lg">{primaryTitle.xp_multiplier}x</span>
                        <span className="text-muted-foreground ml-1 text-xs">XP</span>
                      </div>
                    )}
                    {primaryTitle.forum_xp_bonus > 0 && (
                      <div className="text-xs text-muted-foreground">
                        +{primaryTitle.forum_xp_bonus} Forum XP
                      </div>
                    )}
                  </div>
                </div>

                {primaryTitle.description && (
                  <p className="text-sm text-muted-foreground mb-2 italic">
                    {primaryTitle.description}
                  </p>
                )}

                {primaryTitle.campaign_name && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Earned from: <span className="text-foreground font-medium">{primaryTitle.campaign_name}</span></span>
                  </div>
                )}
              </div>
            )}

            {/* Additional Titles */}
            {displayedTitles.length > 1 && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                  Additional Titles ({displayedTitles.length - 1})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {displayedTitles
                    .filter(t => !t.is_primary)
                    .map((title, index) => (
                      <motion.div
                        key={title.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ ...DAYSTROM_SPRINGS.snappy, delay: index * 0.05 }}
                        className="p-3 rounded-daystrom-small bg-background/50 border border-border/50 hover:border-primary/30 transition-colors"
                      >
                        <TitleBadgeDisplay title={title} size="sm" />
                        {title.campaign_name && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {title.campaign_name}
                          </p>
                        )}
                      </motion.div>
                    ))}
                </div>
              </div>
            )}
          </DaystromCard>
        </motion.div>
      )}

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
