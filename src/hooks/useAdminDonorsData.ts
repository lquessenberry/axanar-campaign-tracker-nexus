
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
    totalCount,
    activeDonorsCount,
    totalRaised,
    originalDonorsCount,
    importedDonorsCount,
    isLoadingTotal,
    isLoadingActive,
    isLoadingRaised,
    isLoadingBreakdown
  } = useDonorStats();

  const { filteredCount } = useDonorFilters(filters);

  const {
    donors,
    isLoading,
    itemsPerPage
  } = usePaginatedDonors(currentPage, filters);

  const totalPages = Math.ceil((filteredCount || totalCount || 0) / itemsPerPage);

  return {
    totalCount,
    activeDonorsCount,
    totalRaised,
    originalDonorsCount,
    importedDonorsCount,
    donors,
    isLoading,
    totalPages,
    itemsPerPage,
    isLoadingTotal,
    isLoadingActive,
    isLoadingRaised,
    isLoadingBreakdown
  };
};
