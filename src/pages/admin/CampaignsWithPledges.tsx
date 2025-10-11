import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminCampaignsData } from "@/hooks/useAdminCampaignsData";
import { useAdminCampaignMutations } from "@/hooks/useAdminCampaignMutations";
import { CreateCampaignParams } from "@/types/admin";
import AdminCampaignsSection from "@/components/admin/AdminCampaignsSection";
import AdminPledgesSection from "@/components/admin/AdminPledgesSection";

const CampaignsWithPledges = () => {
  const [campaignPage, setCampaignPage] = useState(1);
  const [campaignSearchTerm, setCampaignSearchTerm] = useState('');
  const [campaignSortBy, setCampaignSortBy] = useState<string>('created_at');
  const [campaignSortOrder, setCampaignSortOrder] = useState<'asc' | 'desc'>('desc');
  const [campaignStatusFilter, setCampaignStatusFilter] = useState<string>('all');
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);

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

  const {
    createCampaign,
    toggleCampaignStatus,
    bulkToggleCampaignStatus
  } = useAdminCampaignMutations();

  interface DashboardCampaign {
    id: string;
    name: string;
    description?: string;
    image_url?: string;
    goal_amount: number;
    current_amount?: number;
    active: boolean;
    start_date?: string;
    end_date?: string;
    created_at: string;
    updated_at?: string;
    provider?: string;
    external_id?: string;
    pledge_count?: number;
    [key: string]: any;
  }

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
      web_url: campaignData.image_url
    };
    createCampaign.mutate(createParams);
  };

  const handleEditCampaign = (campaign: DashboardCampaign) => {
    console.log('Edit campaign:', campaign);
  };

  const handleDeleteCampaign = (campaignId: string) => {
    console.log('Delete campaign:', campaignId);
  };

  const handleToggleCampaignStatus = (campaignId: string, active: boolean) => {
    toggleCampaignStatus.mutate({ campaignId, active });
  };

  const handleCampaignSelectionChange = (campaignIds: string[]) => {
    setSelectedCampaignIds(campaignIds);
  };

  const handleBulkDeleteCampaigns = () => {
    console.log('Bulk delete campaigns:', selectedCampaignIds);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Campaign Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage campaigns, track pledges, and monitor fundraising progress.
        </p>
      </div>

      <Tabs defaultValue="campaigns">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="pledges">Pledges</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6 mt-6">
          <AdminCampaignsSection 
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
          />
        </TabsContent>

        <TabsContent value="pledges" className="space-y-6 mt-6">
          <AdminPledgesSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampaignsWithPledges;
