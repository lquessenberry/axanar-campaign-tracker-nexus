import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, CheckCircle, Users } from "lucide-react";

interface RewardStatsCardsProps {
  totalCount: number;
  availableCount: number;
  totalClaims: number;
  isLoadingStats: boolean;
}

const RewardStatsCards = ({
  totalCount,
  availableCount,
  totalClaims,
  isLoadingStats
}: RewardStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
          <Gift className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoadingStats ? (
            <div className="h-6 w-12 bg-muted animate-pulse rounded" />
          ) : (
            <div className="text-2xl font-bold">{totalCount}</div>
          )}
          <p className="text-xs text-muted-foreground mt-1">All rewards in system</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Rewards</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoadingStats ? (
            <div className="h-6 w-12 bg-muted animate-pulse rounded" />
          ) : (
            <div className="text-2xl font-bold">{availableCount}</div>
          )}
          <p className="text-xs text-muted-foreground mt-1">Currently available rewards</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoadingStats ? (
            <div className="h-6 w-12 bg-muted animate-pulse rounded" />
          ) : (
            <div className="text-2xl font-bold">{totalClaims}</div>
          )}
          <p className="text-xs text-muted-foreground mt-1">Rewards claimed by donors</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RewardStatsCards;
