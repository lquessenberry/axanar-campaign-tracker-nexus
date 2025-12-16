import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Send, Download, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";

interface SearchResult {
  id: string;
  name: string;
  email: string;
  type: 'donor';
}

export const AdminQuickSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const navigate = useNavigate();

  const { data: results, isLoading } = useQuery({
    queryKey: ['admin-quick-search', debouncedSearch],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!debouncedSearch || debouncedSearch.length < 2) return [];

      const { data, error } = await supabase
        .from('donors')
        .select('id, email, first_name, last_name, donor_name')
        .or(`email.ilike.%${debouncedSearch}%,first_name.ilike.%${debouncedSearch}%,last_name.ilike.%${debouncedSearch}%,donor_name.ilike.%${debouncedSearch}%`)
        .limit(5);

      if (error) throw error;

      return data.map(d => ({
        id: d.id,
        name: d.donor_name || `${d.first_name || ''} ${d.last_name || ''}`.trim() || d.email,
        email: d.email,
        type: 'donor' as const,
      }));
    },
    enabled: debouncedSearch.length >= 2,
  });

  const handleResultClick = (result: SearchResult) => {
    navigate(`/admin/donor/${result.id}`);
    setSearchTerm("");
  };

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search donors by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12"
          />
          
          {/* Search Results Dropdown */}
          {debouncedSearch.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg z-50 max-h-64 overflow-auto">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">Searching...</div>
              ) : results && results.length > 0 ? (
                results.map(result => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b last:border-0"
                  >
                    <div className="font-medium">{result.name}</div>
                    <div className="text-sm text-muted-foreground">{result.email}</div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">No results found</div>
              )}
            </div>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/send-announcement')}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Announcement</span>
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/admin/dashboard?section=donor-management')}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/admin/dashboard?section=utilities')}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Invite</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
