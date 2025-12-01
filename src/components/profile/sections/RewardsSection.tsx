import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Package, Gift, Award, MapPin } from "lucide-react";
import RewardsShowcase from "../RewardsShowcase";
import { ShippingAddressBlock } from "../ShippingAddressBlock";
import { AmbassadorialTitleDisplay } from "../AmbassadorialTitleDisplay";
import DashboardStats from "../DashboardStats";
import { PhysicalRewardsPanel } from "../rewards/PhysicalRewardsPanel";
import { DigitalPerksPanel } from "../rewards/DigitalPerksPanel";
import { useUserRewards } from "@/hooks/useUserRewards";
import { User } from "@supabase/supabase-js";

interface RewardsSectionProps {
  profile: any;
  user: User;
  totalPledged: number;
  totalXP: number;
  achievementsCount: number;
  recruitCount: number;
  memberSince: string;
}

const RewardsSection: React.FC<RewardsSectionProps> = ({
  profile,
  user,
  totalPledged,
  totalXP,
  achievementsCount,
  recruitCount,
  memberSince,
}) => {
  const { data: pledges, isLoading } = useUserRewards();
  
  const rewardsWithPerks = pledges?.filter(pledge => pledge.reward) || [];
  const physicalRewards = rewardsWithPerks.filter(p => p.reward?.requires_shipping);
  const digitalRewards = rewardsWithPerks.filter(p => !p.reward?.requires_shipping);

  return (
    <div className="space-y-6">
      {/* Compact Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-medium">
            Welcome, {profile?.full_name || profile?.username || 'Supporter'}
          </span>
          <Badge variant="outline" className="bg-primary/10 border-primary/30">
            Verified Donor
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Package className="h-4 w-4" />
            {physicalRewards.length} Physical
          </span>
          <span className="flex items-center gap-1">
            <Gift className="h-4 w-4" />
            {digitalRewards.length} Digital
          </span>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN - Physical Rewards (Primary Focus) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <PhysicalRewardsPanel 
            pledges={physicalRewards} 
            isLoading={isLoading} 
          />
          
          {/* Shipping Address - Below Physical Rewards */}
          {physicalRewards.length > 0 && (
            <ShippingAddressBlock />
          )}
        </div>

        {/* RIGHT COLUMN - Digital Perks & Titles */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* Digital Perks */}
          <DigitalPerksPanel 
            pledges={digitalRewards} 
            isLoading={isLoading} 
          />

          {/* Ambassadorial Titles */}
          <AmbassadorialTitleDisplay userId={user.id} />

          {/* Quick Stats */}
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <div className="text-2xl font-bold text-primary">
                    ${totalPledged.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Pledged</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <div className="text-2xl font-bold text-primary">
                    {totalXP.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Total XP</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <div className="text-2xl font-bold text-primary">
                    {achievementsCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Achievements</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <div className="text-2xl font-bold text-primary">
                    {memberSince}
                  </div>
                  <div className="text-xs text-muted-foreground">Member Since</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Show address block at bottom on mobile if no physical rewards */}
      {physicalRewards.length === 0 && (
        <ShippingAddressBlock />
      )}
    </div>
  );
};

export default RewardsSection;