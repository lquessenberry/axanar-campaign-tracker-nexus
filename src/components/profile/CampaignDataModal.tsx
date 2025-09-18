import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  ExternalLink,
  Target,
  Award,
  Activity
} from 'lucide-react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useUserCampaigns } from '@/hooks/useUserCampaigns';
import { useCampaignTotals } from '@/hooks/useCampaignTotals';
import { Button } from '@/components/ui/button';

interface CampaignDataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CampaignDataModal({ open, onOpenChange }: CampaignDataModalProps) {
  const { data: allCampaigns = [], isLoading: isLoadingAll } = useCampaigns();
  const { data: userCampaigns = [], isLoading: isLoadingUser } = useUserCampaigns();
  const { data: campaignTotals = [], isLoading: isLoadingTotals } = useCampaignTotals();

  // Calculate overall statistics
  const totalRaised = campaignTotals.reduce((sum, campaign) => sum + campaign.total_amount, 0);
  const totalBackers = campaignTotals.reduce((sum, campaign) => sum + campaign.backers_count, 0);
  const activeCampaigns = allCampaigns.filter(c => c.status === 'active').length;
  
  // User-specific statistics
  const userTotalPledged = userCampaigns.reduce((sum, campaign) => sum + campaign.current_amount, 0);
  const userCampaignsCount = userCampaigns.length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPlatformColor = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'kickstarter': return 'bg-green-100 text-green-800';
      case 'indiegogo': return 'bg-pink-100 text-pink-800';
      case 'paypal': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Campaign Overview
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Statistics */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Platform Statistics
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalRaised)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Raised</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">
                    {totalBackers.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Backers</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">
                    {allCampaigns.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Campaigns</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-600">
                    {activeCampaigns}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Campaigns</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* User's Campaign Involvement */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Your Campaign Activity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-primary">
                    {userCampaignsCount}
                  </p>
                  <p className="text-sm text-muted-foreground">Campaigns Backed</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(userTotalPledged)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Pledged</p>
                </CardContent>
              </Card>
            </div>

            {/* User's Campaigns List */}
            {userCampaigns.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium">Your Backed Campaigns</h4>
                <div className="grid gap-3">
                  {userCampaigns.slice(0, 5).map((campaign) => (
                    <Card key={campaign.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              {campaign.image_url && (
                                <img
                                  src={campaign.image_url}
                                  alt={campaign.title}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <h5 className="font-medium">{campaign.title}</h5>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge 
                                    variant="secondary" 
                                    className={getPlatformColor(campaign.category)}
                                  >
                                    {campaign.category}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    Your pledge: {formatCurrency(campaign.current_amount)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {campaign.web_url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a 
                                href={campaign.web_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {userCampaigns.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center">
                    +{userCampaigns.length - 5} more campaigns
                  </p>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    You haven't backed any campaigns yet. 
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Explore the campaigns below to get started!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <Separator />

          {/* All Campaigns */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              All Active Campaigns
            </h3>

            {allCampaigns.length > 0 ? (
              <div className="grid gap-4">
                {allCampaigns.slice(0, 6).map((campaign) => (
                  <Card key={campaign.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            {campaign.image_url && (
                              <img
                                src={campaign.image_url}
                                alt={campaign.title}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <h5 className="font-medium">{campaign.title}</h5>
                              <div className="flex items-center gap-4 mt-2">
                                <Badge 
                                  variant="secondary" 
                                  className={getPlatformColor(campaign.platform)}
                                >
                                  {campaign.platform}
                                </Badge>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {formatCurrency(campaign.current_amount)} raised
                                </span>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {campaign.backers_count} backers
                                </span>
                                {campaign.end_date && (
                                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Ends {formatDate(campaign.end_date)}
                                  </span>
                                )}
                              </div>
                              {campaign.goal_amount > 0 && (
                                <div className="mt-2">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Progress</span>
                                    <span>{Math.round((campaign.current_amount / campaign.goal_amount) * 100)}%</span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-2">
                                    <div 
                                      className="bg-primary h-2 rounded-full transition-all"
                                      style={{ 
                                        width: `${Math.min((campaign.current_amount / campaign.goal_amount) * 100, 100)}%` 
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No active campaigns at the moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}