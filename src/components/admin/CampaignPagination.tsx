import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface CampaignPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const CampaignPagination = ({
  currentPage,
  totalPages,
  totalCount,
  itemsPerPage,
  onPageChange
}: CampaignPaginationProps) => {
  const startItem = ((currentPage - 1) * itemsPerPage) + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);
  
  // Create an array of page numbers to display
  const getPageNumbers = () => {
    const pageNumbers: number[] = [];
    const maxButtons = 5; // Maximum number of page buttons to show
    
    if (totalPages <= maxButtons) {
      // If total pages is less than or equal to max buttons, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);
      
      // Calculate start and end of page numbers around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Add ellipsis if needed
      if (start > 2) {
        pageNumbers.push(-1); // -1 represents ellipsis
      }
      
      // Add page numbers around current page
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pageNumbers.push(-2); // -2 represents ellipsis at the end
      }
      
      // Always include last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 pt-2">
      <div className="text-sm text-muted-foreground">
        {totalCount > 0 ? (
          <>Showing {startItem} to {endItem} of {totalCount} campaigns</>
        ) : (
          <>No campaigns found</>
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <span className="sr-only">First page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {getPageNumbers().map((page, index) => {
            if (page < 0) {
              // Render ellipsis
              return (
                <Button
                  key={page}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 cursor-default"
                  disabled
                >
                  <span className="sr-only">More pages</span>
                  <span>...</span>
                </Button>
              );
            }
            
            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(page)}
                disabled={currentPage === page}
              >
                <span className="sr-only">Page {page}</span>
                <span>{page}</span>
              </Button>
            );
          })}
          
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default CampaignPagination;
