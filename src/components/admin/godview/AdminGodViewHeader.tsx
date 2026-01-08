import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, X, Mail, Ban, CheckCircle, Link2, 
  ChevronLeft, User, Shield, Clock, Loader2, DollarSign, Gift, UserCheck
} from 'lucide-react';
import { useAdminDonorSearch, AdminDonorFullData } from '@/hooks/useAdminDonorFullProfile';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import LCARSThemeSwitcher from '@/components/admin/lcars/LCARSThemeSwitcher';
import { useImpersonation } from '@/contexts/ImpersonationContext';
import { useToast } from '@/hooks/use-toast';

interface AdminGodViewHeaderProps {
  donorData: AdminDonorFullData | null;
  isLoading: boolean;
  onMessageDonor?: () => void;
  onBanDonor?: () => void;
  onActivateDonor?: () => void;
  onLinkAccount?: () => void;
}

const AdminGodViewHeader = ({
  donorData,
  isLoading,
  onMessageDonor,
  onBanDonor,
  onActivateDonor,
  onLinkAccount,
}: AdminGodViewHeaderProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { data: searchResults, isLoading: isSearching } = useAdminDonorSearch(debouncedSearch);
  const searchRef = useRef<HTMLDivElement>(null);
  const { startImpersonation } = useImpersonation();
  const { toast } = useToast();

  const handleViewAsUser = () => {
    const donor = donorData?.donor;
    const profile = donorData?.profile;
    
    if (!donor?.auth_user_id) {
      toast({
        title: "Cannot View as User",
        description: "This donor doesn't have a linked account yet.",
        variant: "destructive",
      });
      return;
    }
    
    startImpersonation({
      id: donor.auth_user_id,
      username: profile?.username || undefined,
      full_name: profile?.full_name || donor.donor_name || donor.full_name || undefined,
      email: donor.email,
      donor_id: donor.id,
    });
    
    toast({
      title: "Impersonation Started",
      description: `Now viewing site as ${donor.donor_name || donor.full_name || donor.email}`,
    });
    
    navigate('/profile');
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const input = searchRef.current?.querySelector('input');
        input?.focus();
        setShowResults(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectDonor = (donorId: string) => {
    navigate(`/admin/donor/${donorId}`);
    setSearchTerm('');
    setShowResults(false);
  };

  const donor = donorData?.donor;
  const profile = donorData?.profile;
  const stats = donorData?.stats;

  const displayName = donor?.donor_name || 
    (donor?.first_name && donor?.last_name ? `${donor.first_name} ${donor.last_name}` : null) ||
    donor?.full_name || 
    donor?.email?.split('@')[0] || 
    'Unknown';

  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="sticky top-0 z-10 bg-background border-b border-border">
      {/* LCARS-style accent bar */}
      <div className="h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
      
      {/* Top bar with search and back button */}
      <div className="flex items-center gap-4 p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/dashboard')}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Admin</span>
        </Button>

        {/* Universal Search */}
        <div ref={searchRef} className="relative flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              placeholder="Search donors... (⌘K)"
              className="pl-10 pr-10 bg-muted/50 border-border/50 focus:border-primary"
              aria-label="Search donors"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => {
                  setSearchTerm('');
                  setShowResults(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && debouncedSearch.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
              {isSearching ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                <ul className="py-1" role="listbox">
                  {searchResults.map((result: Record<string, unknown>) => (
                    <li
                      key={result.id as string}
                      className="px-3 py-2.5 hover:bg-muted cursor-pointer flex items-center gap-3 border-b border-border/50 last:border-0"
                      onClick={() => handleSelectDonor(result.id as string)}
                      role="option"
                    >
                      <Avatar className="h-9 w-9 border border-border">
                        <AvatarImage src={result.avatar_url as string} />
                        <AvatarFallback className="text-xs bg-muted">
                          {((result.first_name as string)?.[0] || (result.email as string)?.[0] || 'U').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {String(result.donor_name || 
                           (result.first_name && result.last_name 
                             ? `${result.first_name} ${result.last_name}` 
                             : result.full_name || 'Unknown'))}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{String(result.email)}</p>
                      </div>
                      {result.auth_user_id && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <Shield className="h-3 w-3" />
                          Linked
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No donors found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme Switcher */}
        <LCARSThemeSwitcher />

        {/* God View Title */}
        <Badge variant="outline" className="hidden md:flex gap-1 text-primary border-primary/50">
          <Shield className="h-3 w-3" />
          God View
        </Badge>
      </div>

      {/* Identity Strip */}
      {donor && (
        <div className="flex flex-wrap items-center gap-4 px-4 pb-4 bg-gradient-to-r from-muted/30 to-transparent">
          {/* Avatar and Name */}
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-primary/30 shadow-[0_0_15px_hsl(var(--primary)/0.2)]">
              <AvatarImage src={profile?.avatar_url || donor.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold leading-tight">{displayName}</h1>
              <p className="text-sm text-muted-foreground">{donor.email}</p>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {stats?.hasAuthAccount ? (
              <Badge className="bg-green-600/20 text-green-400 border border-green-600/30 gap-1">
                <Shield className="h-3 w-3" />
                Linked
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <User className="h-3 w-3" />
                Legacy
              </Badge>
            )}
            
            {stats?.memberSince && (
              <Badge variant="outline" className="gap-1 text-muted-foreground border-border/50">
                <Clock className="h-3 w-3" />
                Since {new Date(stats.memberSince).getFullYear()}
              </Badge>
            )}

            {donor.deleted && (
              <Badge variant="destructive">Banned</Badge>
            )}

            {donor.admin && (
              <Badge className="bg-purple-600/20 text-purple-400 border border-purple-600/30">Admin</Badge>
            )}
          </div>

          {/* Quick Stats - LCARS Style */}
          <div className="hidden lg:flex items-center gap-1 ml-auto">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-l-full border border-primary/30">
              <DollarSign className="h-4 w-4 text-primary" />
              <div className="text-right">
                <p className="text-lg font-bold text-primary tabular-nums">${stats?.totalDonated.toLocaleString() || 0}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-y border-border/50">
              <Gift className="h-4 w-4 text-muted-foreground" />
              <div className="text-right">
                <p className="text-lg font-bold tabular-nums">{stats?.pledgeCount || 0}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Pledges</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-r-full border border-border/50">
              <div className="text-right">
                <p className="text-lg font-bold tabular-nums">{stats?.campaignsSupported || 0}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Campaigns</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 ml-auto lg:ml-0">
            {stats?.hasAuthAccount && (
              <Button
                variant="default"
                size="sm"
                onClick={handleViewAsUser}
                className="gap-1.5 bg-amber-500 hover:bg-amber-600 text-black"
                title="View site as this user"
              >
                <UserCheck className="h-4 w-4" />
                <span className="hidden sm:inline">View as User</span>
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={onMessageDonor}
              className="gap-1.5"
              title="Send Message"
            >
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Message</span>
            </Button>

            {!stats?.hasAuthAccount && (
              <Button
                variant="outline"
                size="sm"
                onClick={onLinkAccount}
                className="gap-1.5"
                title="Link Auth Account"
              >
                <Link2 className="h-4 w-4" />
                <span className="hidden sm:inline">Link</span>
              </Button>
            )}

            {donor.deleted ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onActivateDonor}
                className="gap-1.5 text-green-500 hover:text-green-600 border-green-500/30"
                title="Activate Account"
              >
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Activate</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onBanDonor}
                className="gap-1.5 text-destructive hover:text-destructive border-destructive/30"
                title="Ban Account"
              >
                <Ban className="h-4 w-4" />
                <span className="hidden sm:inline">Ban</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center gap-4 px-4 pb-4">
          <div className="h-14 w-14 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-36 bg-muted animate-pulse rounded" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGodViewHeader;
