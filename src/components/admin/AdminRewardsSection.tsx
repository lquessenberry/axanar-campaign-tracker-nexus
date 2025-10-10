import { useState } from "react";
import { useAdminRewardsData } from "@/hooks/useAdminRewardsData";
import { useAdminRewardMutations } from "@/hooks/useAdminRewardMutations";
import RewardStatsCards from "@/components/admin/RewardStatsCards";
import RewardTable from "@/components/admin/RewardTable";
import RewardSearchAndFilters from "@/components/admin/RewardSearchAndFilters";
import RewardPagination from "@/components/admin/RewardPagination";
import RewardDialog from "@/components/admin/RewardDialog";
import RewardBulkActions from "@/components/admin/RewardBulkActions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Types - matching the actual database schema
interface Reward {
  id: string;
  name: string;
  description?: string;
  minimum_amount: number;
  campaign_id: string;
  created_at: string;
  updated_at?: string;
  legacy_id?: number;
  campaign?: {
    name: string;
  };
}

const AdminRewardsSection = () => {
  // State for pagination, search, filters, and sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "unavailable">("all");
  const [campaignFilter, setCampaignFilter] = useState("");

  // State for reward operations
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [rewardToDelete, setRewardToDelete] = useState<string | null>(null);
  const [selectedRewards, setSelectedRewards] = useState<string[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  // Fetch rewards data
  const {
    rewards,
    totalPages,
    currentPage: fetchedPage,
    isLoading,
    isError,
    rewardStats,
    campaigns,
    isLoadingCampaigns,
  } = useAdminRewardsData(currentPage, {
    searchTerm,
    sortBy,
    sortOrder,
    statusFilter,
    campaignId: campaignFilter,
  });

  // Get reward mutations
  const {
    createReward,
    updateReward,
    deleteReward,
    bulkDeleteRewards,
  } = useAdminRewardMutations();

  // Handle search and filters
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handleSortOrderToggle = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: "all" | "available" | "unavailable") => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleCampaignFilterChange = (campaignId: string) => {
    setCampaignFilter(campaignId);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSortBy("created_at");
    setSortOrder("desc");
    setStatusFilter("all");
    setCampaignFilter("");
    setCurrentPage(1);
  };

  // Handle reward CRUD operations
  const handleCreateReward = (data: Omit<Reward, "created_at" | "id" | "updated_at" | "claimed">) => {
    createReward.mutate(data as any, {
      onSuccess: () => {
        setShowRewardDialog(false);
      },
    });
  };

  const handleUpdateReward = (data: Partial<Reward>) => {
    if (!editingReward) return;
    
    updateReward.mutate(
      {
        rewardId: editingReward.id,
        data,
      },
      {
        onSuccess: () => {
          setShowRewardDialog(false);
          setEditingReward(null);
        },
      }
    );
  };

  const handleRewardSubmit = (data: any) => {
    if (editingReward) {
      handleUpdateReward(data);
    } else {
      handleCreateReward(data);
    }
  };

  const handleEditReward = (reward: Reward) => {
    setEditingReward(reward);
    setShowRewardDialog(true);
  };

  const handleDeleteReward = (rewardId: string) => {
    setRewardToDelete(rewardId);
  };

  const confirmDeleteReward = () => {
    if (rewardToDelete) {
      deleteReward.mutate(rewardToDelete, {
        onSuccess: () => {
          setRewardToDelete(null);
        },
      });
    }
  };

  // Handle reward selection and bulk actions
  const handleRewardSelection = (rewardIds: string[]) => {
    setSelectedRewards(rewardIds);
  };

  const handleBulkDelete = () => {
    setShowBulkDeleteDialog(true);
  };

  const confirmBulkDelete = () => {
    bulkDeleteRewards.mutate(selectedRewards, {
      onSuccess: () => {
        setSelectedRewards([]);
        setShowBulkDeleteDialog(false);
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <RewardStatsCards
        totalCount={rewardStats?.totalCount || 0}
        availableCount={rewardStats?.availableCount || 0}
        totalClaims={rewardStats?.totalClaims || 0}
        isLoadingStats={isLoading}
      />

      {/* Action Bar */}
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => setShowRewardDialog(true)}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Reward
        </Button>
      </div>

      {/* Bulk Actions Bar (shown when rewards are selected) */}
      {selectedRewards.length > 0 && (
        <RewardBulkActions
          selectedCount={selectedRewards.length}
          onDelete={handleBulkDelete}
        />
      )}

      {/* Search and Filters */}
      <RewardSearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        sortOrder={sortOrder}
        onSortOrderToggle={handleSortOrderToggle}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        campaignFilter={campaignFilter}
        onCampaignFilterChange={handleCampaignFilterChange}
        campaigns={campaigns}
        isLoadingCampaigns={isLoadingCampaigns}
        onClearFilters={handleClearFilters}
      />

      {/* Rewards Table */}
      <RewardTable
        rewards={rewards}
        selectedRewardIds={selectedRewards}
        onSelectionChange={handleRewardSelection}
        onEdit={handleEditReward}
        onDelete={handleDeleteReward}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <RewardPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Create/Edit Reward Dialog */}
      <RewardDialog
        isOpen={showRewardDialog}
        onClose={() => {
          setShowRewardDialog(false);
          setEditingReward(null);
        }}
        onSubmit={handleRewardSubmit}
        editingReward={editingReward as Reward}
        campaigns={campaigns}
        isLoadingCampaigns={isLoadingCampaigns}
      />

      {/* Confirm Delete Reward Dialog */}
      <AlertDialog
        open={!!rewardToDelete}
        onOpenChange={(open) => !open && setRewardToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the reward.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteReward} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Bulk Delete Dialog */}
      <AlertDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bulk Delete Rewards</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedRewards.length} reward{selectedRewards.length !== 1 ? 's' : ''}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminRewardsSection;
