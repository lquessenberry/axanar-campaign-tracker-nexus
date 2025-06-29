import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Search, ArrowUpDown } from "lucide-react";

interface CampaignSearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderToggle: () => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onClearFilters: () => void;
}

const CampaignSearchAndFilters = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderToggle,
  statusFilter,
  onStatusFilterChange,
  onClearFilters
}: CampaignSearchAndFiltersProps) => {
  const hasActiveFilters = searchTerm || sortBy !== 'created_at' || sortOrder !== 'desc' || statusFilter !== 'all';

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-grow">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Search campaigns..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-7 w-7 rounded-full p-0"
            onClick={() => onSearchChange('')}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Date Created</SelectItem>
            <SelectItem value="name">Campaign Name</SelectItem>
            <SelectItem value="current_amount">Amount Raised</SelectItem>
            <SelectItem value="goal_amount">Goal Amount</SelectItem>
          </SelectContent>
        </Select>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onSortOrderToggle}
          className="h-10 w-10"
        >
          <ArrowUpDown className={`h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
        </Button>
        
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="completed">Completed Only</SelectItem>
          </SelectContent>
        </Select>
        
        {hasActiveFilters && (
          <Button variant="ghost" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

export default CampaignSearchAndFilters;
