
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DonorStatsCardsProps {
  totalCount: number;
  authenticatedCount: number;
  totalRaised: number;
  isLoadingTotal?: boolean;
  isLoadingAuthenticated?: boolean;
  isLoadingRaised?: boolean;
}

const DonorStatsCards = ({ 
  totalCount, 
  authenticatedCount, 
  totalRaised,
  isLoadingTotal = false,
  isLoadingAuthenticated = false,
  isLoadingRaised = false,
}: DonorStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
          <CardTitle className="text-card-foreground">With Auth Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAuthenticated ? (
            <Skeleton className="h-9 w-24" />
          ) : (
            <div className="text-3xl font-bold text-green-400">
              {authenticatedCount?.toLocaleString() || 0}
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
