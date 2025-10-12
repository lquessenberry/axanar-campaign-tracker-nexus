import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminDonorsData } from "@/hooks/useAdminDonorsData";
import AdminDonorsSection from "@/components/admin/AdminDonorsSection";
import AdminUserProfileManager from "@/components/admin/AdminUserProfileManager";
import { useSearchParams } from "react-router-dom";

const DonorManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "donors";
  
  // Donor state
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDonors, setSelectedDonors] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUserId, setSelectedUserId] = useState<string>(searchParams.get('userId') || '');

  const {
    totalCount,
    authenticatedCount,
    totalRaised,
    donors,
    isLoading: donorsLoading,
    totalPages,
    itemsPerPage,
    isLoadingTotal,
    isLoadingAuthenticated,
    isLoadingRaised,
  } = useAdminDonorsData(currentPage, {
    searchTerm,
    sortBy,
    sortOrder,
    statusFilter
  });

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
      const allIds = new Set<string>(donors?.map(donor => donor.id) || []);
      setSelectedDonors(allIds);
    } else {
      setSelectedDonors(new Set());
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSortBy('created_at');
    setSortOrder('desc');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    const params = new URLSearchParams(searchParams);
    params.set('userId', userId);
    setSearchParams(params);
  };

  const setActiveTab = (tab: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    setSearchParams(params);
  };

  interface Donor {
    id: string;
    email?: string;
    name?: string;
    is_active?: boolean;
    [key: string]: any;
  }

  const handleSendEmail = (donor: Donor) => {
    console.log('Send email to donor:', donor);
  };

  const handleBan = (donor: Donor) => {
    console.log('Ban donor:', donor);
  };

  const handleActivate = (donor: Donor) => {
    console.log('Activate donor:', donor);
  };

  const handleBulkEmail = () => {
    console.log('Bulk email to', selectedDonors.size, 'donors');
  };

  const handleBulkExport = () => {
    console.log('Bulk export', selectedDonors.size, 'donors');
  };

  const handleBulkCreateAccounts = () => {
    console.log('Bulk create accounts for', selectedDonors.size, 'donors');
  };

  const handleBulkDelete = () => {
    console.log('Bulk delete', selectedDonors.size, 'donors');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Donor Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage donor records, user profiles, and account information.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="donors">Donor Records</TabsTrigger>
          <TabsTrigger value="profiles">User Profiles</TabsTrigger>
        </TabsList>

        <TabsContent value="donors" className="space-y-6 mt-6">
          <AdminDonorsSection
            totalCount={totalCount || 0}
            authenticatedCount={authenticatedCount || 0}
            totalRaised={totalRaised || 0}
            donors={donors || []}
            isLoadingTotal={isLoadingTotal}
            isLoadingAuthenticated={isLoadingAuthenticated}
            isLoadingRaised={isLoadingRaised}
            donorsLoading={donorsLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            selectedDonors={selectedDonors}
            searchTerm={searchTerm}
            sortBy={sortBy}
            sortOrder={sortOrder}
            statusFilter={statusFilter}
            onPageChange={setCurrentPage}
            onSelectDonor={handleSelectDonor}
            onSelectAll={handleSelectAll}
            onSearchChange={setSearchTerm}
            onSortChange={setSortBy}
            onSortOrderToggle={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            onStatusFilterChange={setStatusFilter}
            onClearFilters={handleClearFilters}
            onSendEmail={handleSendEmail}
            onBan={handleBan}
            onActivate={handleActivate}
            onBulkEmail={handleBulkEmail}
            onBulkExport={handleBulkExport}
            onBulkCreateAccounts={handleBulkCreateAccounts}
            onBulkDelete={handleBulkDelete}
          />
        </TabsContent>

        <TabsContent value="profiles" className="space-y-6 mt-6">
          <AdminUserProfileManager
            selectedUserId={selectedUserId}
            onUserSelect={handleUserSelect}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DonorManagement;
