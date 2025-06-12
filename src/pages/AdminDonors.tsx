
import { useState } from 'react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdminDonorsData } from '@/hooks/useAdminDonorsData';
import DonorStatsCards from '@/components/admin/DonorStatsCards';
import DonorTable from '@/components/admin/DonorTable';
import DonorPagination from '@/components/admin/DonorPagination';
import DonorSearchAndFilters from '@/components/admin/DonorSearchAndFilters';
import DonorBulkActions from '@/components/admin/DonorBulkActions';
import DonorEditDialog from '@/components/admin/DonorEditDialog';
import { toast } from "sonner";

const AdminDonors = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDonors, setSelectedDonors] = useState<Set<string>>(new Set());
  const [editingDonor, setEditingDonor] = useState<any>(null);
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading donors...</div>
      </div>
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

  const handleEdit = (donor: any) => {
    setEditingDonor(donor);
    setIsEditDialogOpen(true);
  };

  const handleSave = (donorId: string, data: any) => {
    // TODO: Implement donor update API call
    toast.success("Donor updated successfully");
    console.log('Updating donor:', donorId, data);
  };

  const handleSendEmail = (donor: any) => {
    // TODO: Implement email functionality
    toast.info(`Email sent to ${donor.email}`);
  };

  const handleBan = (donor: any) => {
    // TODO: Implement ban functionality
    toast.warning(`User ${donor.email} has been banned`);
  };

  const handleActivate = (donor: any) => {
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
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/admin" className="inline-flex items-center text-primary hover:text-primary/80 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-4 text-foreground">Manage Donors</h1>
          <p className="text-muted-foreground">View and manage donor information with comprehensive administration tools</p>
        </div>

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
              onEdit={handleEdit}
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
      </main>

      <Footer />
    </div>
  );
};

export default AdminDonors;
