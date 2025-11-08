import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Trophy, Zap } from "lucide-react";

interface DashboardStatsProps {
  totalPledged: number;
  totalXP: number;
  achievementsCount: number;
  recruitCount: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalPledged,
  totalXP,
  achievementsCount,
  recruitCount
}) => {
  return (
    <section className="py-8 bg-gradient-to-br from-background/95 via-background to-background/95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Donor Dashboard</h2>
            <p className="text-muted-foreground">Your exclusive access to the Axanar donor portal</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contributed</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">${totalPledged.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Your lifetime contributions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Axanar Credits (AXC)</CardTitle>
              <Zap className="h-4 w-4 text-axanar-teal" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-axanar-teal">{totalXP}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total participation credits earned
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{achievementsCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Milestones unlocked
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recruitment</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recruitCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Accounts re-enlisted
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default DashboardStats;