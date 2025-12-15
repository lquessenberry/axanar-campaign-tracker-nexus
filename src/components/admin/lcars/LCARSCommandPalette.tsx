import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Search, User, Shield, Mail, Ban, CheckCircle, Link2, 
  History, Package, Gift, MapPin, Settings, Home, 
  DollarSign, Loader2, Clock 
} from 'lucide-react';
import { useAdminDonorSearch } from '@/hooks/useAdminDonorFullProfile';
import { useDebounce } from '@/hooks/useDebounce';

interface LCARSCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDonorId?: string;
  currentDonorName?: string;
  onAction?: (action: string) => void;
}

interface RecentDonor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  viewedAt: number;
}

const STORAGE_KEY = 'lcars_recent_donors';
const MAX_RECENT = 5;

// Quick actions that are always available
const GLOBAL_ACTIONS = [
  { id: 'goto-dashboard', label: 'Go to Admin Dashboard', icon: Home, keywords: 'home admin dashboard' },
  { id: 'goto-donors', label: 'Go to Donor Management', icon: User, keywords: 'donors list management' },
  { id: 'goto-pledges', label: 'Go to Pledges', icon: DollarSign, keywords: 'pledges donations money' },
  { id: 'goto-rewards', label: 'Go to Rewards', icon: Gift, keywords: 'rewards perks items' },
];

// Context-aware actions when viewing a donor
const DONOR_ACTIONS = [
  { id: 'message-donor', label: 'Send Message', icon: Mail, keywords: 'email contact message' },
  { id: 'view-pledges', label: 'View Pledges', icon: DollarSign, keywords: 'donations money pledges' },
  { id: 'view-rewards', label: 'View Rewards', icon: Gift, keywords: 'perks rewards items' },
  { id: 'view-addresses', label: 'View Addresses', icon: MapPin, keywords: 'shipping address location' },
  { id: 'view-audit', label: 'View Audit Log', icon: History, keywords: 'history log audit' },
  { id: 'link-account', label: 'Link Auth Account', icon: Link2, keywords: 'link connect auth' },
  { id: 'ban-donor', label: 'Ban Account', icon: Ban, keywords: 'ban block disable', variant: 'destructive' },
];

const LCARSCommandPalette = ({
  open,
  onOpenChange,
  currentDonorId,
  currentDonorName,
  onAction,
}: LCARSCommandPaletteProps) => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue, 300);
  const [recentDonors, setRecentDonors] = useState<RecentDonor[]>([]);
  
  // Only search if we have 2+ chars and it's not a command prefix
  const shouldSearch = debouncedSearch.length >= 2 && !debouncedSearch.startsWith('>');
  const { data: searchResults, isLoading: isSearching } = useAdminDonorSearch(
    shouldSearch ? debouncedSearch : ''
  );

  // Load recent donors from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentDonors(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load recent donors:', e);
    }
  }, [open]);

  // Add to recent donors
  const addToRecent = useCallback((donor: RecentDonor) => {
    setRecentDonors(prev => {
      const filtered = prev.filter(d => d.id !== donor.id);
      const updated = [{ ...donor, viewedAt: Date.now() }, ...filtered].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save recent donors:', e);
      }
      return updated;
    });
  }, []);

  const handleSelect = (value: string) => {
    // Handle navigation actions
    if (value.startsWith('goto-')) {
      const routes: Record<string, string> = {
        'goto-dashboard': '/admin/dashboard',
        'goto-donors': '/admin/dashboard?section=donor-management',
        'goto-pledges': '/admin/dashboard?section=pledges',
        'goto-rewards': '/admin/dashboard?section=rewards',
      };
      if (routes[value]) {
        navigate(routes[value]);
        onOpenChange(false);
      }
      return;
    }

    // Handle donor selection
    if (value.startsWith('donor-')) {
      const donorId = value.replace('donor-', '');
      const donor = searchResults?.find((d: Record<string, unknown>) => d.id === donorId) || 
                    recentDonors.find(d => d.id === donorId);
      if (donor) {
        addToRecent({
          id: donorId,
          name: String((donor as Record<string, unknown>).donor_name || (donor as Record<string, unknown>).full_name || (donor as Record<string, unknown>).name || 'Unknown'),
          email: String((donor as Record<string, unknown>).email),
          avatar: (donor as Record<string, unknown>).avatar_url as string | undefined,
          viewedAt: Date.now(),
        });
      }
      navigate(`/admin/donor/${donorId}`);
      onOpenChange(false);
      return;
    }

    // Handle donor-specific actions
    if (onAction && DONOR_ACTIONS.some(a => a.id === value)) {
      onAction(value);
      onOpenChange(false);
      return;
    }
  };

  const isCommand = searchValue.startsWith('>');
  const commandSearch = isCommand ? searchValue.slice(1).trim().toLowerCase() : '';

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="relative">
        {/* LCARS accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
        
        <Command className="rounded-lg border-primary/30 bg-background/95 backdrop-blur-xl">
          <CommandInput 
            placeholder={isCommand ? "Type a command..." : "Search donors or type > for commands..."}
            value={searchValue}
            onValueChange={setSearchValue}
            className="border-0"
          />
          <CommandList className="max-h-[400px]">
            <CommandEmpty>
              {isSearching ? (
                <div className="flex items-center justify-center py-6 gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Searching...</span>
                </div>
              ) : (
                <span>No results found.</span>
              )}
            </CommandEmpty>

            {/* Search Results */}
            {shouldSearch && searchResults && searchResults.length > 0 && (
              <CommandGroup heading="Donors">
                {searchResults.slice(0, 8).map((donor: Record<string, unknown>) => (
                  <CommandItem
                    key={donor.id as string}
                    value={`donor-${donor.id}`}
                    onSelect={handleSelect}
                    className="flex items-center gap-3 py-3"
                  >
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarImage src={donor.avatar_url as string} />
                      <AvatarFallback className="text-xs">
                        {((donor.first_name as string)?.[0] || (donor.email as string)?.[0] || 'U').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {String(donor.donor_name || donor.full_name || 'Unknown')}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{String(donor.email)}</p>
                    </div>
                    {donor.auth_user_id && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Shield className="h-3 w-3" />
                        Linked
                      </Badge>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Recent Donors - show when no search */}
            {!shouldSearch && !isCommand && recentDonors.length > 0 && (
              <>
                <CommandGroup heading="Recent Donors">
                  {recentDonors.map((donor) => (
                    <CommandItem
                      key={donor.id}
                      value={`donor-${donor.id}`}
                      onSelect={handleSelect}
                      className="flex items-center gap-3 py-2"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Avatar className="h-7 w-7 border border-border">
                        <AvatarImage src={donor.avatar} />
                        <AvatarFallback className="text-xs">
                          {donor.name[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{donor.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{donor.email}</p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Context Actions - when viewing a donor */}
            {currentDonorId && !searchValue && (
              <>
                <CommandGroup heading={`Actions for ${currentDonorName || 'Current Donor'}`}>
                  {DONOR_ACTIONS.map((action) => (
                    <CommandItem
                      key={action.id}
                      value={action.id}
                      onSelect={handleSelect}
                      className={action.variant === 'destructive' ? 'text-destructive' : ''}
                    >
                      <action.icon className="mr-2 h-4 w-4" />
                      {action.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Global Navigation */}
            {(isCommand || (!shouldSearch && !searchValue)) && (
              <CommandGroup heading="Navigation">
                {GLOBAL_ACTIONS
                  .filter(a => !commandSearch || a.label.toLowerCase().includes(commandSearch) || a.keywords.includes(commandSearch))
                  .map((action) => (
                    <CommandItem
                      key={action.id}
                      value={action.id}
                      onSelect={handleSelect}
                    >
                      <action.icon className="mr-2 h-4 w-4" />
                      {action.label}
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}
          </CommandList>
          
          {/* Footer hint */}
          <div className="border-t border-border/50 px-3 py-2 text-xs text-muted-foreground flex items-center gap-4">
            <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↵</kbd> Select</span>
            <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Esc</kbd> Close</span>
            <span className="ml-auto"><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">&gt;</kbd> Commands</span>
          </div>
        </Command>
      </div>
    </CommandDialog>
  );
};

export default LCARSCommandPalette;
