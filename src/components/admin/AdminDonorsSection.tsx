
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DonorStatsCards from "./DonorStatsCards";
import DonorTable from "./DonorTable";
import DonorPagination from "./DonorPagination";
import DonorSearchAndFilters from "./DonorSearchAndFilters";
import DonorBulkActions from "./DonorBulkActions";

interface Donor {
  id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  donor_name?: string;
  email: string;
  auth_user_id?: string;
  created_at?: string;
  totalPledges: number;
  pledgeCount: number;
}

interface AdminDonorsSectionProps {
  totalCount: number;
  activeDonorsCount: number;
  totalRaised: number;
  donors: Donor[];
  isLoadingTotal: boolean;
  isLoadingActive: boolean;
  isLoadingRaised: boolean;
  donorsLoading: boolean;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  selectedDonors: Set<string>;
  searchTerm: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  statusFilter: string;
  onPageChange: (page: number) => void;
  onSelectDonor: (donorId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onSearchChange: (term: string) => void;
  onSortChange: (sortBy: string) => void;
  onSortOrderToggle: () => void;
  onStatusFilterChange: (status: string) => void;
  onClearFilters: () => void;
  onSendEmail: (donor: Donor) => void;
  onBan: (donor: Donor) => void;
  onActivate: (donor: Donor) => void;
  onBulkEmail: () => void;
  onBulkExport: () => void;
  onBulkCreateAccounts: () => void;
  onBulkDelete: () => void;
}

const AdminDonorsSection = ({
  totalCount,
  activeDonorsCount,
  totalRaised,
  donors,
  isLoadingTotal,
  isLoadingActive,
  isLoadingRaised,
  donorsLoading,
  currentPage,
  totalPages,
  itemsPerPage,
  selectedDonors,
  searchTerm,
  sortBy,
  sortOrder,
  statusFilter,
  onPageChange,
  onSelectDonor,
  onSelectAll,
  onSearchChange,
  onSortChange,
  onSortOrderToggle,
  onStatusFilterChange,
  onClearFilters,
  onSendEmail,
  onBan,
  onActivate,
  onBulkEmail,
  onBulkExport,
  onBulkCreateAccounts,
  onBulkDelete,
}: AdminDonorsSectionProps) => {
  return (
    <div className="space-y-6">
      <DonorStatsCards
        totalCount={totalCount}
        activeDonorsCount={activeDonorsCount}
        totalRaised={totalRaised}
        isLoadingTotal={isLoadingTotal}
        isLoadingActive={isLoadingActive}
        isLoadingRaised={isLoadingRaised}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Donor Management</CardTitle>
          <CardDescription>View and manage all donors in the system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DonorSearchAndFilters
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            sortBy={sortBy}
            onSortChange={onSortChange}
            sortOrder={sortOrder}
            onSortOrderToggle={onSortOrderToggle}
            statusFilter={statusFilter}
            onStatusFilterChange={onStatusFilterChange}
            onClearFilters={onClearFilters}
          />
          
          {selectedDonors.size > 0 && (
            <DonorBulkActions
              selectedCount={selectedDonors.size}
              onSelectAll={onSelectAll}
              onBulkEmail={onBulkEmail}
              onBulkExport={onBulkExport}
              onBulkCreateAccounts={onBulkCreateAccounts}
              onBulkDelete={onBulkDelete}
              totalCount={totalCount || 0}
              allSelected={donors?.length > 0 && selectedDonors.size === donors.length}
            />
          )}
          
          {donorsLoading ? (
            <div className="text-center py-8">Loading donors...</div>
          ) : (
            <>
              <DonorTable
                donors={donors || []}
                selectedDonors={selectedDonors}
                onSelectDonor={onSelectDonor}
                onSendEmail={onSendEmail}
                onBan={onBan}
                onActivate={onActivate}
              />
              
              <DonorPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount || 0}
                itemsPerPage={itemsPerPage}
                onPageChange={onPageChange}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDonorsSection;
