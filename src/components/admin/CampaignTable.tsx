import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import CampaignActions from "./CampaignActions";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

interface Campaign {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  goal_amount: number | null;
  current_amount: number | null;
  active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at?: string;
  provider?: string;
  external_id?: string;
  pledge_count?: number;
}

interface CampaignTableProps {
  campaigns: Campaign[];
  selectedCampaignIds?: string[];
  onSelectionChange?: (campaignIds: string[]) => void;
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaignId: string) => void;
  onToggleStatus: (campaignId: string, active: boolean) => void;
}

const CampaignTable = ({ 
  campaigns, 
  selectedCampaignIds = [],
  onSelectionChange,
  onEdit,
  onDelete,
  onToggleStatus
}: CampaignTableProps) => {
  const [selected, setSelected] = useState<string[]>(selectedCampaignIds);
  
  // Update local state when prop changes
  useEffect(() => {
    setSelected(selectedCampaignIds);
  }, [selectedCampaignIds]);
  
  // Handle selection changes
  const handleSelect = (campaignId: string, isChecked: boolean) => {
    const updatedSelection = isChecked
      ? [...selected, campaignId]
      : selected.filter(id => id !== campaignId);
    
    setSelected(updatedSelection);
    onSelectionChange?.(updatedSelection);
  };
  
  // Handle select all checkbox
  const handleSelectAll = (isChecked: boolean) => {
    const allIds = isChecked ? campaigns.map(campaign => campaign.id) : [];
    setSelected(allIds);
    onSelectionChange?.(allIds);
  };
  
  const isAllSelected = 
    campaigns.length > 0 && selected.length === campaigns.length;
  
  const isIndeterminate = 
    selected.length > 0 && selected.length < campaigns.length;
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            {onSelectionChange && (
              <TableHead className="w-12">
                <Checkbox 
                  checked={isAllSelected}
                  data-state={isIndeterminate ? "indeterminate" : undefined}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
            )}
            <TableHead className="text-muted-foreground">Campaign</TableHead>
            <TableHead className="text-muted-foreground">Progress</TableHead>
            <TableHead className="text-muted-foreground">Pledges</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-muted-foreground">Created</TableHead>
            <TableHead className="text-muted-foreground w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No campaigns found
              </TableCell>
            </TableRow>
          ) : (
            campaigns.map((campaign) => {
              // Calculate progress percentage
              const goalAmount = campaign.goal_amount || 0;
              const currentAmount = campaign.current_amount || 0;
              const progressPercentage = goalAmount > 0 
                ? Math.min(100, (currentAmount / goalAmount) * 100) 
                : 0;
                
              return (
                <TableRow key={campaign.id} className="border-border">
                  {onSelectionChange && (
                    <TableCell className="w-12">
                      <Checkbox 
                        checked={selected.includes(campaign.id)}
                        onCheckedChange={(checked) => handleSelect(campaign.id, !!checked)}
                      />
                    </TableCell>
                  )}
                  <TableCell className="text-card-foreground">
                    <div className="flex items-center space-x-3">
                      {campaign.image_url ? (
                        <div className="h-10 w-10 rounded overflow-hidden flex-shrink-0">
                          <img 
                            src={campaign.image_url} 
                            alt={campaign.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                          <span className="text-muted-foreground text-xs">No img</span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{campaign.name}</div>
                        {campaign.provider && (
                          <div className="text-xs text-muted-foreground">
                            Provider: {campaign.provider}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-card-foreground">
                    <div className="space-y-1 w-full max-w-[180px]">
                      <Progress value={progressPercentage} className="h-2" />
                      <div className="flex justify-between text-xs">
                        <span>${currentAmount.toLocaleString()}</span>
                        <span>${goalAmount.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {progressPercentage.toFixed(1)}% Complete
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-card-foreground">
                    <Badge variant="outline">
                      {campaign.pledge_count || 0} pledges
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={campaign.active ? "default" : "secondary"}
                      className={campaign.active 
                        ? "bg-green-600 text-white" 
                        : "bg-gray-500 text-white"
                      }
                    >
                      {campaign.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-card-foreground">
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <CampaignActions
                      campaign={campaign}
                      onEdit={() => onEdit(campaign)}
                      onDelete={() => onDelete(campaign.id)}
                      onToggleStatus={() => onToggleStatus(campaign.id, !campaign.active)}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CampaignTable;
