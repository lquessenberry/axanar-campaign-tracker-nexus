
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DonorStatsCardsProps {
  totalCount: number;
  activeDonorsCount: number;
  totalRaised: number;
  originalDonorsCount: number;
  importedDonorsCount: number;
  isLoadingTotal?: boolean;
  isLoadingActive?: boolean;
  isLoadingRaised?: boolean;
  isLoadingBreakdown?: boolean;
}

const DonorStatsCards = ({ 
  totalCount, 
  activeDonorsCount, 
  totalRaised,
  originalDonorsCount,
  importedDonorsCount,
  isLoadingTotal = false,
  isLoadingActive = false,
  isLoadingRaised = false,
  isLoadingBreakdown = false
}: DonorStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Total Donors</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingTotal ? (
            <Skeleton className="h-9 w-24" />
          ) : (
            <div className="text-3xl font-bold text-primary">{totalCount?.toLocaleString() || 0}</div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Original Donors</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingBreakdown ? (
            <Skeleton className="h-9 w-24" />
          ) : (
            <div className="text-3xl font-bold text-blue-400">
              {originalDonorsCount?.toLocaleString() || 0}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Imported Donors</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingBreakdown ? (
            <Skeleton className="h-9 w-24" />
          ) : (
            <div className="text-3xl font-bold text-orange-400">
              {importedDonorsCount?.toLocaleString() || 0}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Active Donors</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingActive ? (
            <Skeleton className="h-9 w-24" />
          ) : (
            <div className="text-3xl font-bold text-green-400">
              {activeDonorsCount?.toLocaleString() || 0}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Total Raised</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingRaised ? (
            <Skeleton className="h-9 w-32" />
          ) : (
            <div className="text-3xl font-bold text-primary">
              ${totalRaised?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DonorStatsCards;
