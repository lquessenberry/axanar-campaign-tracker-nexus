
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
  Eye,
  ChevronDown
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
        <Card 
          className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
          onClick={() => onSectionChange("donor-management")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Imported Email Addresses
              <ExternalLink className="h-3 w-3 opacity-50" />
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {overview.totalDonors?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-primary/70">Total imported email addresses</p>
          </CardContent>
        </Card>
        
        <Card 
          className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20 cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
          onClick={() => onSectionChange("donor-management")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Active Donors
              <ExternalLink className="h-3 w-3 opacity-50" />
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-secondary-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary-foreground">
              {overview.activeDonors?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">Donors with pledges</p>
          </CardContent>
        </Card>
        
        <Card 
          className="relative overflow-hidden border-accent/20 cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
          onClick={() => onSectionChange("campaigns")}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
          >
            <source src="https://vsarkftwkontkfcodbyk.supabase.co/storage/v1/object/public/backgrounds/grok-video-be4a776d-a380-4dc5-8ad8-145f731c927f(2).mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/30 backdrop-blur-sm z-10"></div>
          <CardHeader className="relative z-20 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Total Raised
              <ExternalLink className="h-3 w-3 opacity-50" />
            </CardTitle>
            <DollarSign className="h-4 w-4 text-accent-foreground" />
          </CardHeader>
          <CardContent className="relative z-20">
            <div className="text-2xl font-bold text-accent-foreground">
              ${overview.totalRaised?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-accent-foreground/70">Across all campaigns</p>
          </CardContent>
        </Card>
        
        <Card 
          className="bg-gradient-to-br from-muted/5 to-muted/10 border-muted-foreground/20 cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
          onClick={() => onSectionChange("donor-management")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Activation Rate
              <ExternalLink className="h-3 w-3 opacity-50" />
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {overview.conversionRate?.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Email addresses who became active donors with pledges</p>
          </CardContent>
        </Card>

        {/* Additional Enhanced Metrics */}
        <Card 
          className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
          onClick={() => onSectionChange("donor-management")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Avg Donation
              <ExternalLink className="h-3 w-3 opacity-50" />
            </CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${overview.averageDonation?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-primary/70">Per active donor</p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/30 cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
          onClick={() => onSectionChange("campaigns")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Total Campaigns
              <ExternalLink className="h-3 w-3 opacity-50" />
            </CardTitle>
            <Award className="h-4 w-4 text-secondary-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary-foreground">
              {overview.totalCampaigns?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {overview.activeCampaigns || 0} active
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30 cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
          onClick={() => onSectionChange("pledges-rewards")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Total Rewards
              <ExternalLink className="h-3 w-3 opacity-50" />
            </CardTitle>
            <Gift className="h-4 w-4 text-accent-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-foreground">
              {overview.totalRewards?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-accent-foreground/70">Available rewards</p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/30 cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
          onClick={() => onSectionChange("campaigns")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Total Pledges
              <ExternalLink className="h-3 w-3 opacity-50" />
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {overview.totalPledges?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-destructive/70">All time pledges</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Metrics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Donors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-accent-foreground" />
              Top Donors
            </CardTitle>
            <CardDescription>Highest contributing donors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topMetrics.topDonors?.slice(0, 5).map((donor, index) => (
                <div key={donor.id} className="flex items-center justify-between group hover:bg-muted/50 p-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center text-base font-bold text-accent-foreground">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/u/${donor.username || donor.name?.replace(/\s+/g, '').toLowerCase() || 'user'}`}
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
                    <p className="font-bold text-accent-foreground">
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
              <Target className="h-5 w-5 text-primary" />
              Top Campaigns
            </CardTitle>
            <CardDescription>Best performing campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topMetrics.topCampaigns?.slice(0, 5).map((campaign, index) => (
                <div key={campaign.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-base font-bold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-base">{campaign.name}</p>
                      <p className="text-sm text-muted-foreground">{campaign.donorCount} donors</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
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
        <Card className="border-2 border-border bg-card">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-2xl font-bold tracking-wider uppercase text-foreground">
              Quick Actions
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              <button
                onClick={() => onSectionChange("donor-management")}
                className="w-full flex items-center justify-between px-6 py-5 hover:bg-accent/10 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center ring-2 ring-primary/30 group-hover:ring-primary/60 transition-all">
                    <Users className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                    Manage Donors
                  </span>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors -rotate-90" />
              </button>
              
              <button
                onClick={() => onSectionChange("pledges-rewards")}
                className="w-full flex items-center justify-between px-6 py-5 hover:bg-accent/10 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center ring-2 ring-secondary/30 group-hover:ring-secondary/60 transition-all">
                    <DollarSign className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <span className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                    Pledges & Rewards
                  </span>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors -rotate-90" />
              </button>
              
              <button
                onClick={() => onSectionChange("titles")}
                className="w-full flex items-center justify-between px-6 py-5 hover:bg-accent/10 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center ring-2 ring-accent/30 group-hover:ring-accent/60 transition-all">
                    <Award className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <span className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                    Titles & Perks
                  </span>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors -rotate-90" />
              </button>
              
              <button
                onClick={() => onSectionChange("campaigns")}
                className="w-full flex items-center justify-between px-6 py-5 hover:bg-accent/10 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-destructive flex items-center justify-center ring-2 ring-destructive/30 group-hover:ring-destructive/60 transition-all">
                    <BarChart3 className="h-5 w-5 text-destructive-foreground" />
                  </div>
                  <span className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                    Campaigns
                  </span>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors -rotate-90" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
