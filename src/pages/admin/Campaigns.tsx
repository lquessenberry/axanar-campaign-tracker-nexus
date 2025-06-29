import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminCampaignsSection from "@/components/admin/AdminCampaignsSection";
import { useAdminCampaignsData } from "@/hooks/useAdminCampaignsData";
import { useAdminCampaignMutations } from "@/hooks/useAdminCampaignMutations";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CampaignDialog from "@/components/admin/CampaignDialog";

// Types
interface Campaign {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  goal_amount: number;
  current_amount: number;
  active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at?: string;
  provider?: string;
  external_id?: string;
  pledge_count?: number;
}

const AdminCampaigns = () => {
  // Admin check
  useAdminCheck();

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected campaign for edit/delete
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Selected campaign IDs for bulk actions
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

  // Get campaign data
  const {
    campaigns,
    totalCount,
    totalPages,
    currentPage: dataCurrentPage,
    isLoading,
    campaignStats,
    isLoadingStats,
    itemsPerPage
  } = useAdminCampaignsData(currentPage, {
    searchTerm,
    sortBy,
    sortOrder,
    statusFilter: statusFilter as "all" | "active" | "completed"
  });

  // Campaign mutations
  const {
    createCampaign,
    updateCampaign,
    deleteCampaign,
    toggleCampaignStatus,
    bulkDeleteCampaigns,
    bulkToggleCampaignStatus
  } = useAdminCampaignMutations();

  // Handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  };

  const handleSortOrderToggle = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSortBy("created_at");
    setSortOrder("desc");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  // Campaign CRUD handlers
  const handleCreateCampaign = (campaignData: any) => {
    createCampaign.mutate(campaignData);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsEditDialogOpen(true);
  };

  const handleSaveCampaign = (campaignId: string, data: any) => {
    updateCampaign.mutate({ campaignId, data });
    setIsEditDialogOpen(false);
    setSelectedCampaign(null);
  };

  const handleDeleteCampaign = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    setSelectedCampaign(campaign || null);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCampaign = () => {
    if (selectedCampaign) {
      deleteCampaign.mutate(selectedCampaign.id);
      setIsDeleteDialogOpen(false);
      setSelectedCampaign(null);
    }
  };

  const handleToggleCampaignStatus = (campaignId: string, active: boolean) => {
    toggleCampaignStatus.mutate({ campaignId, active });
  };

  // Bulk action handlers
  const handleBulkDelete = () => {
    setIsBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = () => {
    if (selectedCampaignIds.length > 0) {
      bulkDeleteCampaigns.mutate(selectedCampaignIds);
      setIsBulkDeleteDialogOpen(false);
      setSelectedCampaignIds([]);
    }
  };

  const handleBulkActivate = () => {
    if (selectedCampaignIds.length > 0) {
      bulkToggleCampaignStatus.mutate({ campaignIds: selectedCampaignIds, active: true });
      setSelectedCampaignIds([]);
    }
  };

  const handleBulkDeactivate = () => {
    if (selectedCampaignIds.length > 0) {
      bulkToggleCampaignStatus.mutate({ campaignIds: selectedCampaignIds, active: false });
      setSelectedCampaignIds([]);
    }
  };

  const handleSelectionChange = (campaignIds: string[]) => {
    setSelectedCampaignIds(campaignIds);
  };

  return (
    <AdminLayout>
      <AdminCampaignsSection
        campaigns={campaigns}
        totalCount={totalCount}
        activeCount={campaignStats.activeCount}
        totalRaised={campaignStats.totalRaised}
        isLoading={isLoading}
        isLoadingStats={isLoadingStats}
        currentPage={dataCurrentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        searchTerm={searchTerm}
        sortBy={sortBy}
        sortOrder={sortOrder}
        statusFilter={statusFilter}
        onPageChange={handlePageChange}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onSortOrderToggle={handleSortOrderToggle}
        onStatusFilterChange={handleStatusFilterChange}
        onClearFilters={handleClearFilters}
        onEdit={handleEditCampaign}
        onDelete={handleDeleteCampaign}
        onToggleStatus={handleToggleCampaignStatus}
        onCreate={handleCreateCampaign}
        onSelectionChange={handleSelectionChange}
        selectedCampaignIds={selectedCampaignIds}
        onBulkDelete={handleBulkDelete}
        onBulkActivate={handleBulkActivate}
        onBulkDeactivate={handleBulkDeactivate}
      />

      {/* Edit Campaign Dialog */}
      <CampaignDialog
        campaign={selectedCampaign}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveCampaign}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the campaign 
              "{selectedCampaign?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteCampaign}>
              Delete Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Multiple Campaigns</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedCampaignIds.length} selected 
              campaign{selectedCampaignIds.length !== 1 ? 's' : ''}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmBulkDelete}>
              Delete Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCampaigns;
