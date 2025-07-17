
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { 
  Users, 
  DollarSign, 
  BarChart3,
  Gift,
  TrendingUp,
  Award,
  Target
} from "lucide-react";

interface AdminOverviewProps {
  onSectionChange: (section: string) => void;
}

const AdminOverview = ({ onSectionChange }: AdminOverviewProps) => {
  const { data: analytics, isLoading, error, isUsingFallback } = useAdminAnalytics();

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
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {overview.totalDonors?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">All registered donors</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Donors</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {overview.activeDonors?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">Donors with pledges</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              ${overview.totalRaised?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">Across all campaigns</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {overview.conversionRate?.toFixed(1)}%
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400">Active vs total donors</p>
          </CardContent>
        </Card>

        {/* Additional Enhanced Metrics */}
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900 border-teal-200 dark:border-teal-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Donation</CardTitle>
            <Target className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">
              ${overview.averageDonation?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-teal-600 dark:text-teal-400">Per active donor</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200 dark:border-indigo-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
              {overview.totalCampaigns?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-indigo-600 dark:text-indigo-400">
              {overview.activeCampaigns || 0} active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <Gift className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {overview.totalRewards?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400">Available rewards</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900 border-rose-200 dark:border-rose-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pledges</CardTitle>
            <BarChart3 className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-700 dark:text-rose-300">
              {overview.totalPledges?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-400">All time pledges</p>
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
                <div key={donor.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-axanar-gold/20 rounded-full flex items-center justify-center text-base font-bold text-axanar-gold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-base">{donor.name}</p>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
