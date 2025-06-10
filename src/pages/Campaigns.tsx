
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Search, Filter, Package, Calendar, DollarSign, Users } from "lucide-react";
import { useCampaigns } from "@/hooks/useCampaigns";

const campaignCategories = ["All", "Kickstarter", "Indiegogo", "PayPal", "General"];

const Campaigns = () => {
  const [selectedTab, setSelectedTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns();
  
  const filteredCampaigns = campaigns.filter(campaign => {
    // Filter by category
    if (selectedTab !== "All" && campaign.category !== selectedTab) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !campaign.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    switch (sortBy) {
      case 'created_at':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'current_amount':
        return b.current_amount - a.current_amount;
      case 'backers_count':
        return b.backers_count - a.backers_count;
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const calculateDaysLeft = (endDate: string) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const calculateProgress = (current: number, goal: number) => {
    if (!goal || goal === 0) return 0;
    return Math.min((current / goal) * 100, 100);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        {/* Header */}
        <section className="bg-axanar-dark text-white py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Explore Axanar Campaigns
              </h1>
              <p className="text-xl text-axanar-silver max-w-3xl mx-auto mb-8">
                Discover and support the projects that are building the future of the Axanar universe.
                From films to merchandise, every campaign helps bring our vision to life.
              </p>
              
              <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-full pl-12 pr-4 py-3 border border-white/20 bg-white/10 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-axanar-teal"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-full px-6 py-3 border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-axanar-teal"
                >
                  <option value="created_at" className="text-black">Newest First</option>
                  <option value="current_amount" className="text-black">Most Funded</option>
                  <option value="backers_count" className="text-black">Most Backers</option>
                  <option value="title" className="text-black">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filteredCampaigns.filter(c => c.status === 'active').length}</div>
                  <p className="text-xs text-muted-foreground">Currently accepting pledges</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${filteredCampaigns.reduce((sum, c) => sum + c.current_amount, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Across all campaigns</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Backers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {filteredCampaigns.reduce((sum, c) => sum + c.backers_count, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Supporting these projects</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Campaigns Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="All" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="mb-8 flex flex-wrap h-auto bg-transparent gap-2">
                {campaignCategories.map((category) => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className="rounded-full border data-[state=active]:bg-axanar-teal data-[state=active]:text-white"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value={selectedTab} className="mt-0">
                {campaignsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
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
                ) : sortedCampaigns.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedCampaigns.map((campaign) => (
                      <Link key={campaign.id} to={`/campaign/${campaign.id}`}>
                        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] h-full flex flex-col">
                          <div className="relative h-48 overflow-hidden">
                            {campaign.image_url ? (
                              <img 
                                src={campaign.image_url} 
                                alt={campaign.title}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-axanar-teal/20 to-axanar-dark/20 flex items-center justify-center">
                                <Package className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                            <div className="absolute top-2 left-2">
                              <span className="bg-axanar-teal text-white text-xs px-2 py-1 rounded-full">
                                {campaign.category}
                              </span>
                            </div>
                            <div className="absolute top-2 right-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                campaign.status === 'active' ? 'bg-green-500 text-white' :
                                campaign.status === 'funded' ? 'bg-blue-500 text-white' :
                                'bg-gray-500 text-white'
                              }`}>
                                {campaign.status}
                              </span>
                            </div>
                          </div>
                          
                          <CardContent className="p-4 flex-grow">
                            <h3 className="text-lg font-bold line-clamp-2 mb-2">{campaign.title}</h3>
                            {campaign.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                {campaign.description}
                              </p>
                            )}
                            
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">
                                  ${campaign.current_amount.toLocaleString()}
                                </span>
                                <span className="text-muted-foreground">
                                  Goal: ${campaign.goal_amount.toLocaleString()}
                                </span>
                              </div>
                              
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="bg-axanar-teal h-2 rounded-full transition-all duration-300" 
                                  style={{ 
                                    width: `${calculateProgress(campaign.current_amount, campaign.goal_amount)}%` 
                                  }}
                                ></div>
                              </div>
                              
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {campaign.backers_count} backers
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {calculateDaysLeft(campaign.end_date) > 0 
                                    ? `${calculateDaysLeft(campaign.end_date)} days left`
                                    : "Ended"
                                  }
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No campaigns found</h3>
                    <p className="text-muted-foreground mb-6">
                      {searchQuery 
                        ? "Try adjusting your search terms or filters" 
                        : "There are no campaigns in this category yet"
                      }
                    </p>
                    {searchQuery && (
                      <Button 
                        variant="outline" 
                        onClick={() => setSearchQuery("")}
                        className="border-axanar-teal text-axanar-teal hover:bg-axanar-teal/10"
                      >
                        Clear Search
                      </Button>
                    )}
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

export default Campaigns;
