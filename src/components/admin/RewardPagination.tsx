import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface RewardPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const RewardPagination = ({
  currentPage,
  totalPages,
  onPageChange
}: RewardPaginationProps) => {
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  // Create page items for display
  const getPageItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    // If we have few pages, show all
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Show a window around current page
      const leftOffset = Math.max(0, Math.min(totalPages - maxVisiblePages, currentPage - 3));
      const rightOffset = Math.min(totalPages, Math.max(maxVisiblePages, currentPage + 2));
      
      if (leftOffset > 0) {
        items.push(1);
        if (leftOffset > 1) {
          items.push('...');
        }
      }
      
      for (let i = Math.max(1, leftOffset); i <= Math.min(totalPages, rightOffset); i++) {
        items.push(i);
      }
      
      if (rightOffset < totalPages) {
        if (rightOffset < totalPages - 1) {
          items.push('...');
        }
        items.push(totalPages);
      }
    }
    
    return items;
  };

  return (
    <div className="flex justify-between items-center mt-4">
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="hidden sm:flex"
        >
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">First page</span>
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>
        
        <div className="flex items-center space-x-1">
          {getPageItems().map((item, index) => (
            typeof item === 'number' ? (
              <Button
                key={index}
                variant={currentPage === item ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(item)}
                className="hidden sm:flex"
              >
                {item}
              </Button>
            ) : (
              <span key={index} className="px-2">
                {item}
              </span>
            )
          ))}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="hidden sm:flex"
        >
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">Last page</span>
        </Button>
      </div>
    </div>
  );
};

export default RewardPagination;
