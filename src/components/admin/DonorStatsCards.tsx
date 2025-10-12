
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Users, UserCheck, DollarSign } from "lucide-react";

interface DonorStatsCardsProps {
  totalEmailAddresses?: number;
  activeDonors?: number;
  totalCount: number; // Keep for backward compatibility
  authenticatedCount: number;
  totalRaised: number;
  isLoadingTotalEmails?: boolean;
  isLoadingActiveDonors?: boolean;
  isLoadingTotal?: boolean; // Keep for backward compatibility
  isLoadingAuthenticated?: boolean;
  isLoadingRaised?: boolean;
}

const DonorStatsCards = ({ 
  totalEmailAddresses,
  activeDonors,
  totalCount, 
  authenticatedCount, 
  totalRaised,
  isLoadingTotalEmails = false,
  isLoadingActiveDonors = false,
  isLoadingTotal = false,
  isLoadingAuthenticated = false,
  isLoadingRaised = false,
}: DonorStatsCardsProps) => {
  // Use new props if available, fallback to old for backward compatibility
  const emailCount = totalEmailAddresses ?? totalCount;
  const activeCount = activeDonors ?? totalCount;
  const loadingEmails = isLoadingTotalEmails || isLoadingTotal;
  const loadingActive = isLoadingActiveDonors || isLoadingTotal;

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 border border-border rounded-lg mb-8">
      <Badge variant="secondary" className="px-4 py-2 text-base gap-2">
        <Mail className="h-5 w-5" />
        <span className="font-semibold">Total Emails:</span>
        {loadingEmails ? (
          <Skeleton className="h-5 w-16 ml-2" />
        ) : (
          <span className="font-bold text-blue-600 dark:text-blue-400 ml-1">
            {emailCount?.toLocaleString() || 0}
          </span>
        )}
      </Badge>

      <Badge variant="secondary" className="px-4 py-2 text-base gap-2">
        <Users className="h-5 w-5" />
        <span className="font-semibold">Active Donors:</span>
        {loadingActive ? (
          <Skeleton className="h-5 w-16 ml-2" />
        ) : (
          <span className="font-bold text-primary ml-1">
            {activeCount?.toLocaleString() || 0}
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
