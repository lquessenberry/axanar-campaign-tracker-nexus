import { useState } from "react";
import { useAdminDonorsData } from "@/hooks/useAdminDonorsData";
import { useAdminCampaignsData } from "@/hooks/useAdminCampaignsData";
import { CreateCampaignParams } from "@/types/admin";
import { useAdminCampaignMutations } from "@/hooks/useAdminCampaignMutations";
import Navigation from "@/components/Navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { 
  DollarSign, 
  Gift, 
  BarChart3, 
  UserCog,
  Bell,
  FileText,
  Settings
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminDonorsSection from "@/components/admin/AdminDonorsSection";
import AdminPlaceholderSection from "@/components/admin/AdminPlaceholderSection";
import AdminRewardsSection from "@/components/admin/AdminRewardsSection";
import AdminCampaignsSection from "@/components/admin/AdminCampaignsSection";
import AdminAdminsSection from "@/components/admin/AdminAdminsSection";
import AdminPledgesSection from "@/components/admin/AdminPledgesSection";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");
  
  // Donor state
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDonors, setSelectedDonors] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Campaign state
  const [campaignPage, setCampaignPage] = useState(1);
  const [campaignSearchTerm, setCampaignSearchTerm] = useState('');
  const [campaignSortBy, setCampaignSortBy] = useState<string>('created_at');
  const [campaignSortOrder, setCampaignSortOrder] = useState<'asc' | 'desc'>('desc');
  const [campaignStatusFilter, setCampaignStatusFilter] = useState<string>('all');
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);

  // Donor data
  const {
    totalCount,
    activeDonorsCount,
    totalRaised,
    donors,
    isLoading: donorsLoading,
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
  
  // Campaign data
  const {
    campaigns,
    totalCount: campaignTotalCount,
    totalPages: campaignTotalPages,
    itemsPerPage: campaignItemsPerPage,
    isLoading: campaignsLoading,
    campaignStats,
    isLoadingStats: campaignStatsLoading
  } = useAdminCampaignsData(campaignPage, {
    searchTerm: campaignSearchTerm,
    sortBy: campaignSortBy,
    sortOrder: campaignSortOrder,
    statusFilter: campaignStatusFilter as "all" | "active" | "completed"
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

  interface Donor {
    id: string;
    email?: string;
    name?: string;
    is_active?: boolean;
    [key: string]: any; // For other properties
  }
  
  // Define our local interface for campaigns
  interface DashboardCampaign {
    id: string;
    name: string;
    description?: string;
    image_url?: string;
    goal_amount: number;
    current_amount?: number; // Making this optional since it might be calculated differently in API
    active: boolean;
    start_date?: string;
    end_date?: string;
    created_at: string;
    updated_at?: string;
    provider?: string;
    external_id?: string;
    pledge_count?: number;
    [key: string]: any; // For other properties that might come from API
  }

  const handleEdit = (donor: Donor) => {
    console.log('Edit donor:', donor);
    // TODO: Implement edit functionality
  };

  const handleSendEmail = (donor: Donor) => {
    console.log('Send email to donor:', donor);
    // TODO: Implement email functionality
  };

  const handleBan = (donor: Donor) => {
    console.log('Ban donor:', donor);
    // TODO: Implement ban functionality
  };

  const handleActivate = (donor: Donor) => {
    console.log('Activate donor:', donor);
    // TODO: Implement activate functionality
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
  
  // Campaign handlers
  const handleCampaignPageChange = (page: number) => {
    setCampaignPage(page);
  };
  
  const handleCampaignSearchChange = (term: string) => {
    setCampaignSearchTerm(term);
    setCampaignPage(1);
  };
  
  const handleCampaignSortChange = (sort: string) => {
    setCampaignSortBy(sort);
    setCampaignPage(1);
  };
  
  const handleCampaignSortOrderToggle = () => {
    setCampaignSortOrder(campaignSortOrder === "asc" ? "desc" : "asc");
    setCampaignPage(1);
  };
  
  const handleCampaignStatusFilterChange = (status: string) => {
    setCampaignStatusFilter(status);
    setCampaignPage(1);
  };
  
  const handleCampaignClearFilters = () => {
    setCampaignSearchTerm("");
    setCampaignSortBy("created_at");
    setCampaignSortOrder("desc");
    setCampaignStatusFilter("all");
    setCampaignPage(1);
  };
  
  const handleCreateCampaign = (campaignData: Partial<DashboardCampaign>) => {
    const createParams: CreateCampaignParams = {
      name: campaignData.name || '',
      goal_amount: campaignData.goal_amount || 0,
      active: campaignData.active ?? true,
      description: campaignData.description,
      image_url: campaignData.image_url,
      start_date: campaignData.start_date,
      end_date: campaignData.end_date,
      provider: campaignData.provider,
      status: campaignData.active ? 'active' : 'inactive',
      web_url: campaignData.image_url // Assuming web_url maps to image_url for now
    };
    createCampaign.mutate(createParams);
  };
  
  const handleEditCampaign = (campaign: DashboardCampaign) => {
    console.log('Edit campaign:', campaign);
    // Implementation would go here
  };
  
  const handleDeleteCampaign = (campaignId: string) => {
    console.log('Delete campaign:', campaignId);
    // Implementation would go here
  };
  
  const handleToggleCampaignStatus = (campaignId: string, active: boolean) => {
    toggleCampaignStatus.mutate({ campaignId, active });
  };
  
  const handleCampaignSelectionChange = (campaignIds: string[]) => {
    setSelectedCampaignIds(campaignIds);
  };
  
  const handleBulkDeleteCampaigns = () => {
    console.log('Bulk delete campaigns:', selectedCampaignIds);
    // Implementation would go here
  };
  
  const handleBulkActivateCampaigns = () => {
    if (selectedCampaignIds.length > 0) {
      bulkToggleCampaignStatus.mutate({ campaignIds: selectedCampaignIds, active: true });
    }
  };
  
  const handleBulkDeactivateCampaigns = () => {
    if (selectedCampaignIds.length > 0) {
      bulkToggleCampaignStatus.mutate({ campaignIds: selectedCampaignIds, active: false });
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSortBy('created_at');
    setSortOrder('desc');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <AdminOverview
            onSectionChange={setActiveSection}
          />
        );
      case "donors":
        return (
          <AdminDonorsSection 
            totalCount={totalCount || 0}
            activeDonorsCount={activeDonorsCount || 0}
            totalRaised={totalRaised || 0}
            donors={donors || []}
            isLoadingTotal={isLoadingTotal}
            isLoadingActive={isLoadingActive}
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
            onEdit={handleEdit}
            onSendEmail={handleSendEmail}
            onBan={handleBan}
            onActivate={handleActivate}
            onBulkEmail={handleBulkEmail}
            onBulkExport={handleBulkExport}
            onBulkCreateAccounts={handleBulkCreateAccounts}
            onBulkDelete={handleBulkDelete}
          />
        );
      case "pledges":
        return <AdminPledgesSection />;
      case "rewards":
        return <AdminRewardsSection />;
      case "campaigns":
        return <AdminCampaignsSection 
          campaigns={campaigns as any || []}
          totalCount={campaignTotalCount || 0}
          activeCount={campaignStats?.activeCount || 0}
          totalRaised={campaignStats?.totalRaised || 0}
          isLoading={campaignsLoading}
          isLoadingStats={campaignStatsLoading}
          currentPage={campaignPage}
          totalPages={campaignTotalPages || 1}
          itemsPerPage={campaignItemsPerPage}
          searchTerm={campaignSearchTerm}
          sortBy={campaignSortBy}
          sortOrder={campaignSortOrder}
          statusFilter={campaignStatusFilter}
          onPageChange={handleCampaignPageChange}
          onSearchChange={handleCampaignSearchChange}
          onSortChange={handleCampaignSortChange}
          onSortOrderToggle={handleCampaignSortOrderToggle}
          onStatusFilterChange={handleCampaignStatusFilterChange}
          onClearFilters={handleCampaignClearFilters}
          onEdit={handleEditCampaign}
          onDelete={handleDeleteCampaign}
          onToggleStatus={handleToggleCampaignStatus}
          onCreate={handleCreateCampaign}
          onSelectionChange={handleCampaignSelectionChange}
          selectedCampaignIds={selectedCampaignIds}
          onBulkDelete={handleBulkDeleteCampaigns}
          onBulkActivate={handleBulkActivateCampaigns}
          onBulkDeactivate={handleBulkDeactivateCampaigns}
        />;
      case "admins":
        return <AdminAdminsSection />;
      case "notifications":
        return <AdminPlaceholderSection title="Notification Center" description="Manage system notifications and alerts" Icon={Bell} />;
      case "reports":
        return <AdminPlaceholderSection title="Reports & Analytics" description="Generate detailed reports and analytics" Icon={FileText} />;
      case "settings":
        return <AdminPlaceholderSection title="Platform Settings" description="Configure platform-wide settings" Icon={Settings} />;
      default:
        return (
          <AdminOverview
            onSectionChange={setActiveSection}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Fixed Navigation Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <Navigation />
      </div>
      
      {/* Full Height Admin Interface */}
      <div className="flex flex-1 min-h-0">
        <SidebarProvider>
          {/* Enhanced Admin Sidebar - Fixed positioning */}
          <div className="relative">
            <AdminSidebar
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-background">
            <div className="flex-1 overflow-auto">
              <div className="p-6">
                <AdminHeader activeSection={activeSection} />
                {renderContent()}
              </div>
            </div>
            
            {/* Inline Footer - Stays within content area */}
            <div className="border-t bg-muted/30 px-6 py-4">
              <div className="text-sm text-muted-foreground text-center">
                © 2025 AXANAR Admin Dashboard. All rights reserved.
              </div>
            </div>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
};

export default Dashboard;
