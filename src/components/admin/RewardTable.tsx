import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Reward {
  id: string;
  name: string;
  description?: string;
  minimum_amount: number;
  campaign_id: string;
  created_at: string;
  updated_at?: string;
  campaign?: {
    name: string;
  };
  legacy_reward?: {
    amount: number;
  } | null;
}

interface RewardTableProps {
  rewards: Reward[];
  selectedRewardIds?: string[];
  onSelectionChange?: (rewardIds: string[]) => void;
  onEdit: (reward: Reward) => void;
  onDelete: (rewardId: string) => void;
}

const RewardTable = ({
  rewards,
  selectedRewardIds = [],
  onSelectionChange,
  onEdit,
  onDelete
}: RewardTableProps) => {
  const [selected, setSelected] = useState<string[]>(selectedRewardIds);
  
  // Update local state when prop changes
  useEffect(() => {
    setSelected(selectedRewardIds);
  }, [selectedRewardIds]);
  
  // Handle selection changes
  const handleSelect = (rewardId: string, isChecked: boolean) => {
    const updatedSelection = isChecked
      ? [...selected, rewardId]
      : selected.filter(id => id !== rewardId);
    
    setSelected(updatedSelection);
    onSelectionChange?.(updatedSelection);
  };
  
  // Handle select all checkbox
  const handleSelectAll = (isChecked: boolean) => {
    const allIds = isChecked ? rewards.map(reward => reward.id) : [];
    setSelected(allIds);
    onSelectionChange?.(allIds);
  };
  
  const isAllSelected = 
    rewards.length > 0 && selected.length === rewards.length;
  
  const isIndeterminate = 
    selected.length > 0 && selected.length < rewards.length;

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
            <TableHead className="text-muted-foreground">Reward</TableHead>
            <TableHead className="text-muted-foreground">Minimum Amount</TableHead>
            <TableHead className="text-muted-foreground">Campaign</TableHead>
            <TableHead className="text-muted-foreground w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rewards.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={onSelectionChange ? 5 : 4} 
                className="h-24 text-center text-muted-foreground"
              >
                No rewards found.
              </TableCell>
            </TableRow>
          ) : (
            rewards.map(reward => (
              <TableRow key={reward.id} className="border-border">
                {onSelectionChange && (
                  <TableCell className="w-12">
                    <Checkbox 
                      checked={selected.includes(reward.id)}
                      onCheckedChange={(checked) => handleSelect(reward.id, !!checked)}
                    />
                  </TableCell>
                )}
                <TableCell className="text-card-foreground">
                  <div>
                    <div className="font-medium">{reward.name}</div>
                    {reward.description && (
                      <div className="text-xs text-muted-foreground truncate max-w-xs">
                        {reward.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(reward.legacy_reward?.amount || reward.minimum_amount)}</TableCell>
                <TableCell>
                  <span className="text-sm">
                    {reward.campaign?.name || "Unknown Campaign"}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(reward)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Reward
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(reward.id)} className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default RewardTable;
