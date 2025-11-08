import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Users, Trophy, Zap, Shield, Calendar } from "lucide-react";
import DashboardStats from "../DashboardStats";
import RecentActivityFeed from "../RecentActivityFeed";
import { User } from "@supabase/supabase-js";

interface OverviewSectionProps {
  profile: any;
  user: User;
  totalPledged: number;
  totalXP: number;
  achievementsCount: number;
  recruitCount: number;
  memberSince: string;
  pledges?: any[];
  achievements?: any[];
  forumThreads?: any[];
  forumComments?: any[];
}

const OverviewSection: React.FC<OverviewSectionProps> = ({
  profile,
  user,
  totalPledged,
  totalXP,
  achievementsCount,
  recruitCount,
  memberSince,
  pledges = [],
  achievements = [],
  forumThreads = [],
  forumComments = []
}) => {
  return (
    <div className="space-y-6">
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

      {/* Dashboard Stats */}
      <DashboardStats
        totalPledged={totalPledged}
        totalXP={totalXP}
        achievementsCount={achievementsCount}
        recruitCount={recruitCount}
      />

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Recent Highlights
            </h3>
            <div className="space-y-3 text-sm">
              {totalPledged > 0 && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="font-medium text-green-700 dark:text-green-400">
                    ${totalPledged.toLocaleString()} Total Contributed
                  </p>
                </div>
              )}
              {achievementsCount > 0 && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <p className="font-medium text-purple-700 dark:text-purple-400">
                    {achievementsCount} Achievements Unlocked
                  </p>
                </div>
              )}
              {totalXP > 0 && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="font-medium text-blue-700 dark:text-blue-400">
                    {totalXP} AXC Earned
                  </p>
                </div>
              )}
              {!totalPledged && !achievementsCount && !totalXP && (
                <p className="text-muted-foreground text-center py-4">
                  Start contributing to unlock highlights!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <RecentActivityFeed
        pledges={pledges}
        achievements={achievements}
        forumThreads={forumThreads}
        forumComments={forumComments}
        limit={10}
      />
    </div>
  );
};

export default OverviewSection;