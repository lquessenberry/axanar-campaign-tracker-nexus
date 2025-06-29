import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash, Power, PowerOff } from "lucide-react";

interface CampaignBulkActionsProps {
  selectedCount: number;
  onDelete: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
}

const CampaignBulkActions = ({
  selectedCount,
  onDelete,
  onActivate,
  onDeactivate
}: CampaignBulkActionsProps) => {
  return (
    <Card className="p-2 bg-muted/50 border-dashed flex flex-wrap gap-2 items-center">
      <span className="text-sm font-medium ml-2 mr-auto">
        {selectedCount} campaign{selectedCount !== 1 ? 's' : ''} selected
      </span>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={onActivate}
      >
        <Power className="h-4 w-4" />
        <span>Activate</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={onDeactivate}
      >
        <PowerOff className="h-4 w-4" />
        <span>Deactivate</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1 text-red-600"
        onClick={onDelete}
      >
        <Trash className="h-4 w-4" />
        <span>Delete</span>
      </Button>
    </Card>
  );
};

export default CampaignBulkActions;
