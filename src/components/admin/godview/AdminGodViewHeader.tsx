import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, X, Mail, Ban, CheckCircle, Link2, 
  ChevronLeft, User, Shield, Clock, Loader2
} from 'lucide-react';
import { useAdminDonorSearch, AdminDonorFullData } from '@/hooks/useAdminDonorFullProfile';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

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
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      {/* Top bar with search and back button */}
      <div className="flex items-center gap-4 p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/dashboard')}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Admin</span>
        </Button>

        {/* Universal Search */}
        <div ref={searchRef} className="relative flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              placeholder="Search donors... (Ctrl+K)"
              className="pl-10 pr-10"
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
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-80 overflow-y-auto z-50">
              {isSearching ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                <ul className="py-1" role="listbox">
                  {searchResults.map((result: Record<string, unknown>) => (
                    <li
                      key={result.id as string}
                      className="px-3 py-2 hover:bg-muted cursor-pointer flex items-center gap-3"
                      onClick={() => handleSelectDonor(result.id as string)}
                      role="option"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={result.avatar_url as string} />
                        <AvatarFallback className="text-xs">
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
                        <Badge variant="secondary" className="text-xs">Linked</Badge>
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
      </div>

      {/* Identity Strip */}
      {donor && (
        <div className="flex flex-wrap items-center gap-4 px-4 pb-4">
          {/* Avatar and Name */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage src={profile?.avatar_url || donor.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-semibold leading-tight">{displayName}</h1>
              <p className="text-sm text-muted-foreground">{donor.email}</p>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-2">
            {stats?.hasAuthAccount ? (
              <Badge variant="default" className="bg-green-600 hover:bg-green-700 gap-1">
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
              <Badge variant="outline" className="gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                Since {new Date(stats.memberSince).getFullYear()}
              </Badge>
            )}

            {donor.deleted && (
              <Badge variant="destructive">Deleted</Badge>
            )}

            {donor.admin && (
              <Badge variant="default" className="bg-purple-600">Admin</Badge>
            )}
          </div>

          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-4 ml-auto text-sm">
            <div className="text-center">
              <p className="text-lg font-bold text-primary">${stats?.totalDonated.toLocaleString() || 0}</p>
              <p className="text-xs text-muted-foreground">Total Donated</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{stats?.pledgeCount || 0}</p>
              <p className="text-xs text-muted-foreground">Pledges</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{stats?.campaignsSupported || 0}</p>
              <p className="text-xs text-muted-foreground">Campaigns</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 ml-auto md:ml-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onMessageDonor}
              className="gap-1"
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
                className="gap-1"
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
                className="gap-1 text-green-600 hover:text-green-700"
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
                className="gap-1 text-destructive hover:text-destructive"
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
        <div className="flex items-center gap-3 px-4 pb-4">
          <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-40 bg-muted animate-pulse rounded" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGodViewHeader;
