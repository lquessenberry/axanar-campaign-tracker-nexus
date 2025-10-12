
import { useDonorStats } from './admin/useDonorStats';
import { useDonorFilters } from './admin/useDonorFilters';
import { usePaginatedDonors } from './admin/usePaginatedDonors';

interface DonorFilters {
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  statusFilter?: string;
}

export const useAdminDonorsData = (currentPage: number, filters: DonorFilters = {}) => {
  const {
    totalEmailAddresses,
    activeDonors,
    totalCount,
    authenticatedCount,
    totalRaised,
    isLoadingTotalEmails,
    isLoadingActiveDonors,
    isLoadingTotal,
    isLoadingAuthenticated,
    isLoadingRaised,
  } = useDonorStats();

  const { filteredCount } = useDonorFilters(filters);

  const {
    donors,
    isLoading,
    itemsPerPage
  } = usePaginatedDonors(currentPage, filters);

  const totalPages = Math.ceil((filteredCount || totalCount || 0) / itemsPerPage);

  return {
    totalEmailAddresses,
    activeDonors,
    totalCount,
    authenticatedCount,
    totalRaised,
    donors,
    isLoading,
    totalPages,
    itemsPerPage,
    isLoadingTotalEmails,
    isLoadingActiveDonors,
    isLoadingTotal,
    isLoadingAuthenticated,
    isLoadingRaised,
  };
};
