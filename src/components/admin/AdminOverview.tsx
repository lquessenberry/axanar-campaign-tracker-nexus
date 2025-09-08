
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  DollarSign, 
  BarChart3,
  Gift,
  TrendingUp,
  Award,
  Target,
  ExternalLink,
  Eye
} from "lucide-react";

interface AdminOverviewProps {
  onSectionChange: (section: string) => void;
}

const AdminOverview = ({ onSectionChange }: AdminOverviewProps) => {
  const { data: analytics, isLoading, error, isUsingFallback } = useAdminAnalytics();
  const navigate = useNavigate();

  const handleViewDonorProfile = (donorId: string) => {
    console.log('handleViewDonorProfile called with donorId:', donorId);
    // Navigate to the profile page with the donor ID (can be auth_user_id or donor_id)
    navigate(`/admin/dashboard?section=user-profiles&userId=${donorId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-destructive mb-2">
          Error loading analytics: {error.message}
        </div>
        <div className="text-sm text-muted-foreground">
          Using fallback data loading system...
        </div>
      </div>
    );
  }

  const { overview, topMetrics } = analytics || { overview: {}, topMetrics: { topDonors: [], topCampaigns: [] } };
  
  console.log('AdminOverview topMetrics.topDonors:', topMetrics.topDonors);

  return (
    <div className="space-y-6">
      {/* Show status indicator if using fallback */}
      {isUsingFallback && (
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Using fallback data system. Edge functions may be warming up.
          </p>
        </div>
      )}
      {/* Enhanced Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 tactical:from-primary/5 tactical:to-primary/10 tactical:border-primary/20 klingon:from-klingon-primary/5 klingon:to-klingon-primary/10 klingon:border-klingon-accent/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium klingon:font-klingon">Total Donors</CardTitle>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400 tactical:text-primary klingon:text-klingon-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 tactical:text-primary klingon:text-klingon-alert klingon:font-klingon">
              {overview.totalDonors?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 tactical:text-primary/70 klingon:text-klingon-accent/70 klingon:font-klingon">All registered donors</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 tactical:from-secondary/5 tactical:to-secondary/10 tactical:border-secondary/20 klingon:from-klingon-accent/5 klingon:to-klingon-accent/10 klingon:border-klingon-primary/20 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium klingon:font-klingon">Active Donors</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 tactical:text-secondary klingon:text-klingon-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300 tactical:text-secondary klingon:text-klingon-alert klingon:font-klingon">
              {overview.activeDonors?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 tactical:text-secondary/70 klingon:text-klingon-primary/70 klingon:font-klingon">Donors with pledges</p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-yellow-200 dark:border-yellow-800">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
          >
            <source src="https://vsarkftwkontkfcodbyk.supabase.co/storage/v1/object/public/backgrounds/grok-video-be4a776d-a380-4dc5-8ad8-145f731c927f(2).mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/80 to-yellow-100/80 dark:from-yellow-950/80 dark:to-yellow-900/80 tactical:from-accent/20 tactical:to-accent/30 klingon:from-klingon-alert/20 klingon:to-klingon-alert/30 z-10"></div>
          <CardHeader className="relative z-20 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium klingon:font-klingon">Total Raised</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600 dark:text-yellow-400 tactical:text-accent klingon:text-klingon-alert" />
          </CardHeader>
          <CardContent className="relative z-20">
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 tactical:text-accent klingon:text-klingon-alert klingon:font-klingon">
              ${overview.totalRaised?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 tactical:text-accent/70 klingon:text-klingon-alert/70 klingon:font-klingon">Across all campaigns</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 tactical:from-muted/5 tactical:to-muted/10 tactical:border-muted-foreground/20 klingon:from-klingon-primary/5 klingon:to-klingon-primary/10 klingon:border-klingon-primary/20 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium klingon:font-klingon">Conversion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400 tactical:text-muted-foreground klingon:text-klingon-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300 tactical:text-muted-foreground klingon:text-klingon-alert klingon:font-klingon">
              {overview.conversionRate?.toFixed(1)}%
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 tactical:text-muted-foreground/70 klingon:text-klingon-primary/70 klingon:font-klingon">Active vs total donors</p>
          </CardContent>
        </Card>

        {/* Additional Enhanced Metrics */}
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900 tactical:from-primary/5 tactical:to-primary/10 tactical:border-primary/20 klingon:from-klingon-accent/5 klingon:to-klingon-accent/10 klingon:border-klingon-accent/20 border-teal-200 dark:border-teal-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium klingon:font-klingon">Avg Donation</CardTitle>
            <Target className="h-4 w-4 text-teal-600 dark:text-teal-400 tactical:text-primary klingon:text-klingon-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-700 dark:text-teal-300 tactical:text-primary klingon:text-klingon-alert klingon:font-klingon">
              ${overview.averageDonation?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-teal-600 dark:text-teal-400 tactical:text-primary/70 klingon:text-klingon-accent/70 klingon:font-klingon">Per active donor</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 tactical:from-secondary/5 tactical:to-secondary/10 tactical:border-secondary/20 klingon:from-klingon-primary/5 klingon:to-klingon-primary/10 klingon:border-klingon-primary/20 border-indigo-200 dark:border-indigo-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium klingon:font-klingon">Total Campaigns</CardTitle>
            <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400 tactical:text-secondary klingon:text-klingon-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 tactical:text-secondary klingon:text-klingon-alert klingon:font-klingon">
              {overview.totalCampaigns?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 tactical:text-secondary/70 klingon:text-klingon-primary/70 klingon:font-klingon">
              {overview.activeCampaigns || 0} active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 tactical:from-accent/5 tactical:to-accent/10 tactical:border-accent/20 klingon:from-klingon-alert/5 klingon:to-klingon-alert/10 klingon:border-klingon-alert/20 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium klingon:font-klingon">Total Rewards</CardTitle>
            <Gift className="h-4 w-4 text-orange-600 dark:text-orange-400 tactical:text-accent klingon:text-klingon-alert" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300 tactical:text-accent klingon:text-klingon-alert klingon:font-klingon">
              {overview.totalRewards?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 tactical:text-accent/70 klingon:text-klingon-alert/70 klingon:font-klingon">Available rewards</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900 tactical:from-muted/5 tactical:to-muted/10 tactical:border-muted-foreground/20 klingon:from-klingon-accent/5 klingon:to-klingon-accent/10 klingon:border-klingon-accent/20 border-rose-200 dark:border-rose-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium klingon:font-klingon">Total Pledges</CardTitle>
            <BarChart3 className="h-4 w-4 text-rose-600 dark:text-rose-400 tactical:text-muted-foreground klingon:text-klingon-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-700 dark:text-rose-300 tactical:text-muted-foreground klingon:text-klingon-alert klingon:font-klingon">
              {overview.totalPledges?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-400 tactical:text-muted-foreground/70 klingon:text-klingon-accent/70 klingon:font-klingon">All time pledges</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Metrics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Donors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-axanar-gold" />
              Top Donors
            </CardTitle>
            <CardDescription>Highest contributing donors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topMetrics.topDonors?.slice(0, 5).map((donor, index) => (
                <div key={donor.id} className="flex items-center justify-between group hover:bg-muted/50 p-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 bg-axanar-gold/20 rounded-full flex items-center justify-center text-base font-bold text-axanar-gold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/${donor.username || donor.name?.replace(/\s+/g, '') || 'user'}/profile`}
                          className="font-medium text-base hover:text-primary underline-offset-4 hover:underline text-left transition-colors cursor-pointer"
                          title="View donor profile"
                        >
                          {donor.name}
                        </a>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewDonorProfile(donor.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">{donor.pledgeCount} pledges</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-axanar-gold">
                      ${donor.totalDonated.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-axanar-teal" />
              Top Campaigns
            </CardTitle>
            <CardDescription>Best performing campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topMetrics.topCampaigns?.slice(0, 5).map((campaign, index) => (
                <div key={campaign.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-axanar-teal/20 rounded-full flex items-center justify-center text-base font-bold text-axanar-teal">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-base">{campaign.name}</p>
                      <p className="text-sm text-muted-foreground">{campaign.donorCount} donors</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-axanar-teal">
                      ${campaign.totalRaised.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {campaign.goalAmount ? ((campaign.totalRaised / campaign.goalAmount) * 100).toFixed(0) + '%' : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start bg-gradient-to-r from-axanar-teal/10 to-transparent hover:from-axanar-teal/20 border-axanar-teal/30"
              onClick={() => onSectionChange("donors")}
            >
              <Users className="h-4 w-4 mr-2 text-axanar-teal" />
              Manage Donors
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start bg-gradient-to-r from-axanar-gold/10 to-transparent hover:from-axanar-gold/20 border-axanar-gold/30"
              onClick={() => onSectionChange("pledges")}
            >
              <DollarSign className="h-4 w-4 mr-2 text-axanar-gold" />
              View Pledges
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start bg-gradient-to-r from-axanar-silver/10 to-transparent hover:from-axanar-silver/20 border-axanar-silver/30"
              onClick={() => onSectionChange("rewards")}
            >
              <Gift className="h-4 w-4 mr-2 text-axanar-silver" />
              Manage Rewards
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start bg-gradient-to-r from-axanar-red/10 to-transparent hover:from-axanar-red/20 border-axanar-red/30"
              onClick={() => onSectionChange("campaigns")}
            >
              <BarChart3 className="h-4 w-4 mr-2 text-axanar-red" />
              Manage Campaigns
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start bg-gradient-to-r from-blue-500/10 to-transparent hover:from-blue-500/20 border-blue-500/30"
              onClick={() => onSectionChange("user-profiles")}
            >
              <Eye className="h-4 w-4 mr-2 text-blue-500" />
              View User Profiles
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
