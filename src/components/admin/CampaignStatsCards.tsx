import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Rocket, DollarSign } from "lucide-react";

interface CampaignStatsCardsProps {
  totalCount: number;
  activeCount: number;
  totalRaised: number;
  isLoadingStats: boolean;
}

const CampaignStatsCards = ({
  totalCount,
  activeCount,
  totalRaised,
  isLoadingStats
}: CampaignStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoadingStats ? (
            <div className="h-6 w-12 bg-muted animate-pulse rounded" />
          ) : (
            <div className="text-2xl font-bold">{totalCount}</div>
          )}
          <p className="text-xs text-muted-foreground mt-1">All campaigns in system</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
          <Rocket className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoadingStats ? (
            <div className="h-6 w-12 bg-muted animate-pulse rounded" />
          ) : (
            <div className="text-2xl font-bold">{activeCount}</div>
          )}
          <p className="text-xs text-muted-foreground mt-1">Currently active campaigns</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoadingStats ? (
            <div className="h-6 w-24 bg-muted animate-pulse rounded" />
          ) : (
            <div className="text-2xl font-bold">
              ${totalRaised.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">Across all campaigns</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignStatsCards;
