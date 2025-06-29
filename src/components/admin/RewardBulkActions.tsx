import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash, CheckCircle, XCircle } from "lucide-react";

interface RewardBulkActionsProps {
  selectedCount: number;
  onDelete: () => void;
  onMakeAvailable: () => void;
  onMakeUnavailable: () => void;
}

const RewardBulkActions = ({
  selectedCount,
  onDelete,
  onMakeAvailable,
  onMakeUnavailable
}: RewardBulkActionsProps) => {
  return (
    <Card className="p-2 bg-muted/50 border-dashed flex flex-wrap gap-2 items-center">
      <span className="text-sm font-medium ml-2 mr-auto">
        {selectedCount} reward{selectedCount !== 1 ? 's' : ''} selected
      </span>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={onMakeAvailable}
      >
        <CheckCircle className="h-4 w-4" />
        <span>Make Available</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={onMakeUnavailable}
      >
        <XCircle className="h-4 w-4" />
        <span>Make Unavailable</span>
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

export default RewardBulkActions;
