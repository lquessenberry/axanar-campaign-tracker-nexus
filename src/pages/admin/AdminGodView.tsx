import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, LayoutDashboard, DollarSign, Gift, MapPin, History, Settings } from 'lucide-react';
import { useAdminDonorFullProfile } from '@/hooks/useAdminDonorFullProfile';
import AdminGodViewHeader from '@/components/admin/godview/AdminGodViewHeader';
import AdminGodViewOverview from '@/components/admin/godview/AdminGodViewOverview';
import AdminGodViewPledges from '@/components/admin/godview/AdminGodViewPledges';
import Navigation from '@/components/Navigation';
import { toast } from '@/components/ui/use-toast';

const AdminGodView = () => {
  const { donorId } = useParams<{ donorId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: donorData, isLoading, error } = useAdminDonorFullProfile(donorId || null);

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
    toast({
      title: 'Ban User',
      description: 'Ban functionality coming soon.',
    });
  };

  const handleActivateDonor = () => {
    toast({
      title: 'Activate User',
      description: 'Activate functionality coming soon.',
    });
  };

  const handleLinkAccount = () => {
    toast({
      title: 'Link Account',
      description: 'Account linking functionality coming soon.',
    });
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
          <div className="container mx-auto">
            <TabsList className="w-full justify-start h-12 bg-transparent rounded-none gap-0">
              <TabsTrigger
                value="overview"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="pledges"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Pledges</span>
                <span className="text-xs text-muted-foreground">({donorData.pledges.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="rewards"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Gift className="h-4 w-4" />
                <span className="hidden sm:inline">Rewards</span>
              </TabsTrigger>
              <TabsTrigger
                value="addresses"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Addresses</span>
                <span className="text-xs text-muted-foreground">({donorData.addresses.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="audit"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">Audit Log</span>
              </TabsTrigger>
              <TabsTrigger
                value="actions"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Actions</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="container mx-auto">
          <TabsContent value="overview" className="mt-0">
            <AdminGodViewOverview donorData={donorData} />
          </TabsContent>

          <TabsContent value="pledges" className="mt-0">
            <AdminGodViewPledges donorData={donorData} />
          </TabsContent>

          <TabsContent value="rewards" className="mt-0">
            <div className="p-4">
              <p className="text-muted-foreground text-center py-8">
                Rewards tab coming in Phase 3
              </p>
            </div>
          </TabsContent>

          <TabsContent value="addresses" className="mt-0">
            <div className="p-4">
              <p className="text-muted-foreground text-center py-8">
                Addresses tab coming in Phase 3
              </p>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="mt-0">
            <div className="p-4">
              <p className="text-muted-foreground text-center py-8">
                Audit Log tab coming in Phase 4
              </p>
            </div>
          </TabsContent>

          <TabsContent value="actions" className="mt-0">
            <div className="p-4">
              <p className="text-muted-foreground text-center py-8">
                Actions tab coming in Phase 4
              </p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AdminGodView;
