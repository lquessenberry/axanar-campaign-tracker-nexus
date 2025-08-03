import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminDonorsData } from '@/hooks/useAdminDonorsData';
import DonorStatsCards from '@/components/admin/DonorStatsCards';
import DonorTable from '@/components/admin/DonorTable';
import DonorPagination from '@/components/admin/DonorPagination';
import DonorSearchAndFilters from '@/components/admin/DonorSearchAndFilters';
import DonorBulkActions from '@/components/admin/DonorBulkActions';
import DonorEditDialog from '@/components/admin/DonorEditDialog';
import { toast } from "sonner";

// Define proper types for donors to match the components' expectations
interface Donor {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  status: string;
  total_donated: number;
  totalPledges: number;
  pledgeCount: number;
  // Add any other required properties from the components
  [key: string]: any; // For additional properties we might not be aware of
}

const Donors = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDonors, setSelectedDonors] = useState<Set<string>>(new Set());
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const {
    totalCount,
    activeDonorsCount,
    totalRaised,
    donors,
    isLoading,
    totalPages,
    itemsPerPage,
    isLoadingTotal,
    isLoadingActive,
    isLoadingRaised
  } = useAdminDonorsData(currentPage, {
    searchTerm,
    sortBy,
    sortOrder,
    statusFilter
  });

  if (isLoading) {
    return (
      <AdminLayout title="Manage Donors">
        <div className="flex items-center justify-center h-64">
          <div className="text-foreground">Loading donors...</div>
        </div>
      </AdminLayout>
    );
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSortBy('created_at');
    setSortOrder('desc');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const handleSelectDonor = (donorId: string, checked: boolean) => {
    const newSelected = new Set(selectedDonors);
    if (checked) {
      newSelected.add(donorId);
    } else {
      newSelected.delete(donorId);
    }
    setSelectedDonors(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(donors?.map(donor => donor.id) || []);
      setSelectedDonors(allIds);
    } else {
      setSelectedDonors(new Set());
    }
  };

  const handleEdit = (donor: Donor) => {
    setEditingDonor(donor);
    setIsEditDialogOpen(true);
  };

  const handleSave = (donorId: string, data: Partial<Donor>) => {
    // TODO: Implement donor update API call
    toast.success("Donor updated successfully");
    console.log('Updating donor:', donorId, data);
  };

  const handleSendEmail = (donor: Donor) => {
    // TODO: Implement email functionality
    toast.info(`Email sent to ${donor.email}`);
  };

  const handleBan = (donor: Donor) => {
    // TODO: Implement ban functionality
    toast.warning(`User ${donor.email} has been banned`);
  };

  const handleActivate = (donor: Donor) => {
    // TODO: Implement account creation functionality
    toast.success(`Account created for ${donor.email}`);
  };

  const handleBulkEmail = () => {
    toast.info(`Sending email to ${selectedDonors.size} donors`);
  };

  const handleBulkExport = () => {
    toast.info(`Exporting ${selectedDonors.size} donors`);
  };

  const handleBulkCreateAccounts = () => {
    toast.success(`Creating accounts for ${selectedDonors.size} donors`);
  };

  const handleBulkDelete = () => {
    toast.warning(`Deleting ${selectedDonors.size} donors`);
  };

  const allSelected = donors?.length > 0 && selectedDonors.size === donors.length;

  return (
    <AdminLayout 
      title="Manage Donors" 
      description="View and manage donor information with comprehensive administration tools"
    >
      <DonorStatsCards 
        totalCount={totalCount || 0}
        activeDonorsCount={activeDonorsCount || 0}
        totalRaised={totalRaised || 0}
        isLoadingTotal={isLoadingTotal}
        isLoadingActive={isLoadingActive}
        isLoadingRaised={isLoadingRaised}
      />

      <DonorSearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderToggle={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClearFilters={handleClearFilters}
      />

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">
            All Donors (Page {currentPage} of {totalPages})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DonorBulkActions
            selectedCount={selectedDonors.size}
            onSelectAll={handleSelectAll}
            onBulkEmail={handleBulkEmail}
            onBulkExport={handleBulkExport}
            onBulkCreateAccounts={handleBulkCreateAccounts}
            onBulkDelete={handleBulkDelete}
            totalCount={totalCount || 0}
            allSelected={allSelected}
          />

          <DonorTable 
            donors={donors || []} 
            selectedDonors={selectedDonors}
            onSelectDonor={handleSelectDonor}
            onSendEmail={handleSendEmail}
            onBan={handleBan}
            onActivate={handleActivate}
          />
          
          <DonorPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount || 0}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>

      <DonorEditDialog
        donor={editingDonor}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSave}
      />
    </AdminLayout>
  );
};

export default Donors;
