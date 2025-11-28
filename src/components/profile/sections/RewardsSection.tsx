import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
import RewardsShowcase from "../RewardsShowcase";
import { ShippingAddressBlock } from "../ShippingAddressBlock";
import { AmbassadorialTitleDisplay } from "../AmbassadorialTitleDisplay";
import DashboardStats from "../DashboardStats";
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
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">Verified Donor</span>
              </div>
              <h2 className="text-2xl font-bold mb-1">
                Welcome, {profile?.full_name || profile?.username || 'Supporter'}!
              </h2>
              <p className="text-muted-foreground">
                Your exclusive access to the Axanar donor portal
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PHYSICAL & DIGITAL REWARDS */}
      <RewardsShowcase />

      {/* AMBASSADORIAL TITLES - BELOW DIGITAL PERKS */}
      <AmbassadorialTitleDisplay userId={user.id} />

      {/* SHIPPING ADDRESS - CRITICAL FOR PHYSICAL REWARDS */}
      <ShippingAddressBlock />

      {/* Dashboard Stats */}
      <DashboardStats
        totalPledged={totalPledged}
        totalXP={totalXP}
        achievementsCount={achievementsCount}
        recruitCount={recruitCount}
      />
    </div>
  );
};

export default RewardsSection;
