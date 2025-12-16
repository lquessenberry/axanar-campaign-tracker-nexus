import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Send, Download, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

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
    <div className="lcars-panel lcars-panel-left p-4 bg-card">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* LCARS-styled Search Input */}
        <div className="flex-1 relative">
          <div className="lcars-search flex items-center">
            <div className="absolute left-0 top-0 bottom-0 w-14 bg-primary rounded-l-full flex items-center justify-center z-10">
              <Search className="h-5 w-5 text-primary-foreground" />
            </div>
            <Input
              placeholder="Search donors by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-16 h-12 bg-background border-none rounded-l-full rounded-r-sm focus-visible:ring-primary"
            />
          </div>
          
          {/* Search Results Dropdown */}
          {debouncedSearch.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border-l-4 border-l-primary shadow-lg z-50 max-h-64 overflow-auto">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">Searching...</div>
              ) : results && results.length > 0 ? (
                results.map(result => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="lcars-queue-item w-full text-left"
                  >
                    <div className="font-semibold text-foreground">{result.name}</div>
                    <div className="text-sm text-muted-foreground">{result.email}</div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">No results found</div>
              )}
            </div>
          )}
        </div>

        {/* LCARS-styled Quick Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate('/admin/send-announcement')}
            className="lcars-btn-pill-l gap-2 h-12"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Announce</span>
          </Button>
          <Button 
            onClick={() => navigate('/admin/dashboard?section=donor-management')}
            className="h-12 gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-sm"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button 
            onClick={() => navigate('/admin/dashboard?section=utilities')}
            className="lcars-btn-pill-r gap-2 h-12"
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Invite</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
