
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Download, UserPlus, Trash2 } from "lucide-react";

interface DonorBulkActionsProps {
  selectedCount: number;
  onSelectAll: (checked: boolean) => void;
  onBulkEmail: () => void;
  onBulkExport: () => void;
  onBulkCreateAccounts: () => void;
  onBulkDelete: () => void;
  totalCount: number;
  allSelected: boolean;
}

const DonorBulkActions = ({
  selectedCount,
  onSelectAll,
  onBulkEmail,
  onBulkExport,
  onBulkCreateAccounts,
  onBulkDelete,
  totalCount,
  allSelected
}: DonorBulkActionsProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg mb-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allSelected}
            onCheckedChange={onSelectAll}
          />
          <span className="text-sm text-muted-foreground">
            {selectedCount > 0 ? `${selectedCount} selected` : 'Select all'}
          </span>
        </div>
        
        {selectedCount > 0 && (
          <div className="text-sm text-muted-foreground">
            {selectedCount} of {totalCount} donors selected
          </div>
        )}
      </div>
      
      {selectedCount > 0 && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onBulkEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Email ({selectedCount})
          </Button>
          <Button variant="outline" size="sm" onClick={onBulkExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={onBulkCreateAccounts}>
            <UserPlus className="h-4 w-4 mr-2" />
            Create Accounts
          </Button>
          <Button variant="destructive" size="sm" onClick={onBulkDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      )}
    </div>
  );
};

export default DonorBulkActions;
