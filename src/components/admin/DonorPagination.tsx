
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

interface DonorPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  totalEmailAddresses: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const DonorPagination = ({ 
  currentPage, 
  totalPages, 
  totalCount,
  totalEmailAddresses, 
  itemsPerPage, 
  onPageChange 
}: DonorPaginationProps) => {
  const getPaginationItems = () => {
    const items = [];
    const showEllipsis = totalPages > 7;
    
    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          items.push(i);
        }
        items.push('ellipsis');
        items.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        items.push(1);
        items.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          items.push(i);
        }
      } else {
        items.push(1);
        items.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          items.push(i);
        }
        items.push('ellipsis');
        items.push(totalPages);
      }
    }
    
    return items;
  };

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-muted-foreground">
        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount || 0)} of {totalCount?.toLocaleString() || 0} active donors ({totalEmailAddresses?.toLocaleString() || 0} total emails)
      </div>
      
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="gap-1 pl-2.5"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
          </PaginationItem>
          
          {getPaginationItems().map((item, index) => (
            <PaginationItem key={index}>
              {item === 'ellipsis' ? (
                <span className="flex h-9 w-9 items-center justify-center">...</span>
              ) : (
                <PaginationLink
                  isActive={currentPage === item}
                  onClick={() => onPageChange(item as number)}
                  className="cursor-pointer"
                >
                  {item}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="gap-1 pr-2.5"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default DonorPagination;
