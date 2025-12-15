import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, LayoutDashboard, DollarSign, Gift, MapPin, History, Settings } from 'lucide-react';
import { useAdminDonorFullProfile } from '@/hooks/useAdminDonorFullProfile';
import AdminGodViewHeader from '@/components/admin/godview/AdminGodViewHeader';
import AdminGodViewOverview from '@/components/admin/godview/AdminGodViewOverview';
import AdminGodViewPledges from '@/components/admin/godview/AdminGodViewPledges';
import AdminGodViewRewards from '@/components/admin/godview/AdminGodViewRewards';
import AdminGodViewAddresses from '@/components/admin/godview/AdminGodViewAddresses';
import AdminGodViewAuditLog from '@/components/admin/godview/AdminGodViewAuditLog';
import AdminGodViewActions from '@/components/admin/godview/AdminGodViewActions';
import LCARSCommandPalette from '@/components/admin/lcars/LCARSCommandPalette';
import Navigation from '@/components/Navigation';
import { toast } from '@/components/ui/use-toast';

const TABS = [
  { value: 'overview', label: 'Overview', icon: LayoutDashboard },
  { value: 'pledges', label: 'Pledges', icon: DollarSign },
  { value: 'rewards', label: 'Rewards', icon: Gift },
  { value: 'addresses', label: 'Addresses', icon: MapPin },
  { value: 'audit', label: 'Audit Log', icon: History },
  { value: 'actions', label: 'Actions', icon: Settings },
];

const AdminGodView = () => {
  const { donorId } = useParams<{ donorId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  
  const { data: donorData, isLoading, error } = useAdminDonorFullProfile(donorId || null);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Command palette
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setCommandPaletteOpen(true);
      return;
    }
    // Escape to go back
    if (e.key === 'Escape' && donorId && !commandPaletteOpen) {
      navigate('/admin/dashboard?section=donor-management');
    }
    // Tab navigation with number keys
    if (e.altKey && /^[1-6]$/.test(e.key)) {
      e.preventDefault();
      const tabIndex = parseInt(e.key) - 1;
      if (TABS[tabIndex]) {
        setActiveTab(TABS[tabIndex].value);
      }
    }
  }, [donorId, navigate, commandPaletteOpen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Quick action handlers
  const handleMessageDonor = () => {
    if (donorData?.donor?.auth_user_id) {
      navigate(`/direct-messages?recipient=${donorData.donor.auth_user_id}`);
    } else {
      toast({
        title: 'Cannot Message',
        description: 'This donor does not have a linked auth account.',
        variant: 'destructive',
      });
    }
  };

  const handleBanDonor = () => {
    setActiveTab('actions');
  };

  const handleActivateDonor = () => {
    setActiveTab('actions');
  };

  const handleLinkAccount = () => {
    setActiveTab('actions');
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-2xl font-bold text-destructive">Error Loading Donor</h1>
            <p className="text-muted-foreground">{error.message}</p>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-primary hover:underline"
            >
              Return to Admin Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No donor ID provided - show search interface
  if (!donorId) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <AdminGodViewHeader
          donorData={null}
          isLoading={false}
          onMessageDonor={handleMessageDonor}
          onBanDonor={handleBanDonor}
          onActivateDonor={handleActivateDonor}
          onLinkAccount={handleLinkAccount}
        />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-2">Admin God View</h1>
            <p className="text-muted-foreground">
              Search for a donor above to view and manage their complete profile.
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Tip: Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl+K</kbd> to focus search
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <AdminGodViewHeader
          donorData={null}
          isLoading={true}
          onMessageDonor={handleMessageDonor}
          onBanDonor={handleBanDonor}
          onActivateDonor={handleActivateDonor}
          onLinkAccount={handleLinkAccount}
        />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Donor not found
  if (!donorData?.donor) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <AdminGodViewHeader
          donorData={null}
          isLoading={false}
          onMessageDonor={handleMessageDonor}
          onBanDonor={handleBanDonor}
          onActivateDonor={handleActivateDonor}
          onLinkAccount={handleLinkAccount}
        />
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-2xl font-bold">Donor Not Found</h1>
            <p className="text-muted-foreground">
              No donor found with ID: {donorId}
            </p>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-primary hover:underline"
            >
              Return to Admin Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'pledges': return donorData.pledges.length;
      case 'addresses': return donorData.addresses.length;
      case 'audit': return donorData.auditLog.length;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Fixed Header with Search and Identity */}
      <AdminGodViewHeader
        donorData={donorData}
        isLoading={isLoading}
        onMessageDonor={handleMessageDonor}
        onBanDonor={handleBanDonor}
        onActivateDonor={handleActivateDonor}
        onLinkAccount={handleLinkAccount}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-border bg-background/95 sticky top-[132px] z-10">
          <div className="container mx-auto px-4">
            {/* Desktop Tabs */}
            <TabsList className="w-full justify-start h-12 bg-transparent rounded-none gap-0 hidden md:flex">
              {TABS.map((tab, index) => {
                const Icon = tab.icon;
                const count = getTabCount(tab.value);
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4"
                    title={`Alt+${index + 1}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                    {count !== null && (
                      <span className="text-xs text-muted-foreground">({count})</span>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Mobile Tab Dropdown */}
            <div className="md:hidden py-2">
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(() => {
                      const currentTab = TABS.find(t => t.value === activeTab);
                      if (!currentTab) return 'Select Tab';
                      const Icon = currentTab.icon;
                      const count = getTabCount(activeTab);
                      return (
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {currentTab.label}
                          {count !== null && ` (${count})`}
                        </span>
                      );
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const count = getTabCount(tab.value);
                    return (
                      <SelectItem key={tab.value} value={tab.value}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {tab.label}
                          {count !== null && ` (${count})`}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <TabsContent value="overview" className="mt-0">
            <AdminGodViewOverview donorData={donorData} />
          </TabsContent>

          <TabsContent value="pledges" className="mt-0">
            <AdminGodViewPledges donorData={donorData} />
          </TabsContent>

          <TabsContent value="rewards" className="mt-0 py-4">
            <AdminGodViewRewards
              pledges={donorData.pledges}
              donorId={donorId}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="addresses" className="mt-0 py-4">
            <AdminGodViewAddresses
              addresses={donorData.addresses}
              donorId={donorId}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="audit" className="mt-0 py-4">
            <AdminGodViewAuditLog
              auditLog={donorData.auditLog}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="actions" className="mt-0 py-4">
            <AdminGodViewActions
              donorId={donorId}
              donorEmail={donorData.donor.email}
              donorName={donorData.donor.donor_name || donorData.donor.full_name || donorData.donor.email}
              authUserId={donorData.donor.auth_user_id}
              isDeleted={donorData.donor.deleted || false}
              isLoading={isLoading}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Keyboard shortcuts hint */}
      <div className="fixed bottom-4 right-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/50 hidden lg:block">
        <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">⌘K</kbd> Command •{' '}
        <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Esc</kbd> Back •{' '}
        <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Alt+1-6</kbd> Switch tabs
      </div>

      {/* Command Palette */}
      <LCARSCommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        currentDonorId={donorId}
        currentDonorName={donorData?.donor?.donor_name || donorData?.donor?.full_name || undefined}
        onAction={(action) => {
          switch (action) {
            case 'message-donor':
              handleMessageDonor();
              break;
            case 'view-pledges':
              setActiveTab('pledges');
              break;
            case 'view-rewards':
              setActiveTab('rewards');
              break;
            case 'view-addresses':
              setActiveTab('addresses');
              break;
            case 'view-audit':
              setActiveTab('audit');
              break;
            case 'link-account':
              handleLinkAccount();
              break;
            case 'ban-donor':
              handleBanDonor();
              break;
          }
        }}
      />
    </div>
  );
};

export default AdminGodView;
