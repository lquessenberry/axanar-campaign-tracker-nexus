import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Calendar } from "lucide-react";
import RewardsShowcase from "../RewardsShowcase";
import { ShippingAddressBlock } from "../ShippingAddressBlock";
import { AmbassadorialTitleDisplay } from "../AmbassadorialTitleDisplay";
import ForumBadgesPanel from "../ForumBadgesPanel";
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

      {/* REWARDS SHOWCASE - MOST IMPORTANT */}
      <RewardsShowcase />

      {/* AMBASSADORIAL TITLES - DIGITAL PERKS */}
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

      {/* Forum Badges */}
      <ForumBadgesPanel />

      {/* Account Info */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Account Info
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-background/40 rounded-lg">
              <span className="text-sm text-muted-foreground">Member Since</span>
              <span className="text-sm font-semibold">{memberSince}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-background/40 rounded-lg">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-semibold truncate max-w-48">
                {user.email || 'No email'}
              </span>
            </div>
            {profile?.username && (
              <div className="flex items-center justify-between p-3 bg-background/40 rounded-lg">
                <span className="text-sm text-muted-foreground">Username</span>
                <span className="text-sm font-semibold">@{profile.username}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RewardsSection;
