
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useUserCampaigns } from "@/hooks/useUserCampaigns";
import { useUserPledges } from "@/hooks/useUserPledges";
import { useUserProfile } from "@/hooks/useUserProfile";
import { 
  Plus, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar, 
  Heart,
  Package,
  BarChart3
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const { data: campaigns, isLoading: campaignsLoading } = useUserCampaigns();
  const { data: pledges, isLoading: pledgesLoading } = useUserPledges();
  const { data: profile, isLoading: profileLoading } = useUserProfile();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please log in to access your dashboard</h1>
            <Link to="/auth">
              <Button className="bg-axanar-teal hover:bg-axanar-teal/90">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const totalCampaigns = campaigns?.length || 0;
  const totalRaised = campaigns?.reduce((sum, campaign) => sum + Number(campaign.current_amount), 0) || 0;
  const totalBackers = campaigns?.reduce((sum, campaign) => sum + (campaign.backers_count || 0), 0) || 0;
  const totalPledged = pledges?.reduce((sum, pledge) => sum + Number(pledge.amount), 0) || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow bg-background">
        {/* Header */}
        <section className="bg-axanar-dark text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name || profile?.username || 'Creator'}!</h1>
                <p className="text-axanar-silver/80 mt-2">
                  Manage your campaigns and track your progress
                </p>
              </div>
              <Link to="/create-campaign">
                <Button className="bg-axanar-teal hover:bg-axanar-teal/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCampaigns}</div>
                  <p className="text-xs text-muted-foreground">
                    Active campaigns you've created
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalRaised.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all your campaigns
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Backers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalBackers}</div>
                  <p className="text-xs text-muted-foreground">
                    People supporting your work
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pledged</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalPledged.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Amount you've backed
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="pb-8">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="campaigns" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="campaigns">My Campaigns</TabsTrigger>
                <TabsTrigger value="backed">Backed Projects</TabsTrigger>
              </TabsList>

              <TabsContent value="campaigns" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Your Campaigns</h2>
                  <Link to="/create-campaign">
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      New Campaign
                    </Button>
                  </Link>
                </div>

                {campaignsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="animate-pulse">
                        <div className="h-48 bg-muted rounded-t-lg"></div>
                        <CardContent className="p-4">
                          <div className="h-4 bg-muted rounded mb-2"></div>
                          <div className="h-3 bg-muted rounded mb-4"></div>
                          <div className="h-2 bg-muted rounded"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : campaigns && campaigns.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map((campaign) => (
                      <Card key={campaign.id} className="overflow-hidden">
                        <div className="h-48 bg-muted overflow-hidden">
                          {campaign.image_url ? (
                            <img 
                              src={campaign.image_url} 
                              alt={campaign.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-axanar-teal/20 to-axanar-dark/20 flex items-center justify-center">
                              <Package className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold truncate">{campaign.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded ${
                              campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                              campaign.status === 'funded' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {campaign.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {campaign.description}
                          </p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Raised: ${Number(campaign.current_amount).toLocaleString()}</span>
                              <span>Goal: ${Number(campaign.goal_amount).toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-axanar-teal h-2 rounded-full" 
                                style={{ 
                                  width: `${Math.min((Number(campaign.current_amount) / Number(campaign.goal_amount)) * 100, 100)}%` 
                                }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{campaign.backers_count} backers</span>
                              <span>{Math.ceil((new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left</span>
                            </div>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Link to={`/campaign/${campaign.id}`} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full">
                                View
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm" className="flex-1">
                              Edit
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/30 rounded-lg">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Create your first campaign to start fundraising for your Axanar project
                    </p>
                    <Link to="/create-campaign">
                      <Button className="bg-axanar-teal hover:bg-axanar-teal/90">
                        Create Your First Campaign
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="backed" className="space-y-6">
                <h2 className="text-2xl font-bold">Projects You've Backed</h2>

                {pledgesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="w-16 h-16 bg-muted rounded"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-muted rounded mb-2"></div>
                              <div className="h-3 bg-muted rounded mb-2"></div>
                              <div className="h-3 bg-muted rounded w-1/2"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : pledges && pledges.length > 0 ? (
                  <div className="space-y-4">
                    {pledges.map((pledge) => (
                      <Card key={pledge.id}>
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                              {pledge.campaigns?.image_url ? (
                                <img 
                                  src={pledge.campaigns.image_url} 
                                  alt={pledge.campaigns.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-axanar-teal/20 to-axanar-dark/20 flex items-center justify-center">
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold">{pledge.campaigns?.title}</h3>
                                <span className="text-lg font-bold text-axanar-teal">
                                  ${Number(pledge.amount).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Pledged on {new Date(pledge.created_at).toLocaleDateString()}
                              </p>
                              {pledge.message && (
                                <p className="text-sm bg-muted/50 p-2 rounded italic">
                                  "{pledge.message}"
                                </p>
                              )}
                              <div className="mt-2">
                                <Link to={`/campaign/${pledge.campaign_id}`}>
                                  <Button variant="outline" size="sm">
                                    View Campaign
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/30 rounded-lg">
                    <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No backed projects yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Discover and support exciting Axanar campaigns
                    </p>
                    <Link to="/">
                      <Button className="bg-axanar-teal hover:bg-axanar-teal/90">
                        Explore Campaigns
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
