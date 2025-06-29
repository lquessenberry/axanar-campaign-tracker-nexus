import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Plus, Trash, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import CampaignStatsCards from "./CampaignStatsCards";
import CampaignTable from "./CampaignTable";
import CampaignPagination from "./CampaignPagination";
import CampaignSearchAndFilters from "./CampaignSearchAndFilters";
import CampaignDialog from "./CampaignDialog";
import CampaignBulkActions from "./CampaignBulkActions";

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

interface AdminCampaignsSectionProps {
  campaigns: Campaign[];
  totalCount: number;
  activeCount: number;
  totalRaised: number;
  isLoading: boolean;
  isLoadingStats: boolean;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  searchTerm: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  statusFilter: string;
  selectedCampaignIds: string[];
  onPageChange: (page: number) => void;
  onSearchChange: (term: string) => void;
  onSortChange: (sortBy: string) => void;
  onSortOrderToggle: () => void;
  onStatusFilterChange: (status: string) => void;
  onClearFilters: () => void;
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaignId: string) => void;
  onToggleStatus: (campaignId: string, active: boolean) => void;
  onCreate: (campaign: Partial<Campaign>) => void;
  onSelectionChange: (campaignIds: string[]) => void;
  onBulkDelete: () => void;
  onBulkActivate: () => void;
  onBulkDeactivate: () => void;
}

const AdminCampaignsSection = ({
  campaigns,
  totalCount,
  activeCount,
  totalRaised,
  isLoading,
  isLoadingStats,
  currentPage,
  totalPages,
  itemsPerPage,
  searchTerm,
  sortBy,
  sortOrder,
  statusFilter,
  selectedCampaignIds,
  onPageChange,
  onSearchChange,
  onSortChange,
  onSortOrderToggle,
  onStatusFilterChange,
  onClearFilters,
  onEdit,
  onDelete,
  onToggleStatus,
  onCreate,
  onSelectionChange,
  onBulkDelete,
  onBulkActivate,
  onBulkDeactivate
}: AdminCampaignsSectionProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const hasSelection = selectedCampaignIds.length > 0;

  return (
    <div className="space-y-6">
      <CampaignStatsCards
        totalCount={totalCount}
        activeCount={activeCount}
        totalRaised={totalRaised}
        isLoadingStats={isLoadingStats}
      />
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Campaign Management
            </CardTitle>
            <CardDescription>
              Create and manage fundraising campaigns
            </CardDescription>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-4">
            <CampaignSearchAndFilters 
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
            
            {hasSelection && (
              <CampaignBulkActions 
                selectedCount={selectedCampaignIds.length}
                onDelete={onBulkDelete}
                onActivate={onBulkActivate}
                onDeactivate={onBulkDeactivate}
              />
            )}
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">Loading campaigns...</div>
          ) : (
            <>
              <CampaignTable
                campaigns={campaigns}
                selectedCampaignIds={selectedCampaignIds}
                onSelectionChange={onSelectionChange}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
              />
              
              <CampaignPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                itemsPerPage={itemsPerPage}
                onPageChange={onPageChange}
              />
            </>
          )}
        </CardContent>
      </Card>
      
      <CampaignDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreate={onCreate}
      />
    </div>
  );
};

export default AdminCampaignsSection;
