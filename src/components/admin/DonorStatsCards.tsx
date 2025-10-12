
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, DollarSign } from "lucide-react";

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
    <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 border border-border rounded-lg mb-8">
      <Badge variant="secondary" className="px-4 py-2 text-base gap-2">
        <Users className="h-5 w-5" />
        <span className="font-semibold">Active Donors:</span>
        {isLoadingTotal ? (
          <Skeleton className="h-5 w-16 ml-2" />
        ) : (
          <span className="font-bold text-primary ml-1">
            {totalCount?.toLocaleString() || 0}
          </span>
        )}
      </Badge>

      <Badge variant="secondary" className="px-4 py-2 text-base gap-2">
        <UserCheck className="h-5 w-5" />
        <span className="font-semibold">With Auth:</span>
        {isLoadingAuthenticated ? (
          <Skeleton className="h-5 w-16 ml-2" />
        ) : (
          <span className="font-bold text-green-600 dark:text-green-400 ml-1">
            {authenticatedCount?.toLocaleString() || 0}
          </span>
        )}
      </Badge>

      <Badge variant="secondary" className="px-4 py-2 text-base gap-2">
        <DollarSign className="h-5 w-5" />
        <span className="font-semibold">Total Raised:</span>
        {isLoadingRaised ? (
          <Skeleton className="h-5 w-20 ml-2" />
        ) : (
          <span className="font-bold text-primary ml-1">
            ${totalRaised?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
          </span>
        )}
      </Badge>
    </div>
  );
};

export default DonorStatsCards;
