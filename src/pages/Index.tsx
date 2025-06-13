
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FeaturedCampaign from "@/components/FeaturedCampaign";
import CampaignCard from "@/components/CampaignCard";
import WarpfieldStars from "@/components/WarpfieldStars";
import { Search } from "lucide-react";
import { useCampaigns, useFeaturedCampaign } from "@/hooks/useCampaigns";

const campaignCategories = ["All", "Kickstarter", "Indiegogo", "PayPal", "General"];

const Index = () => {
  const [selectedTab, setSelectedTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns();
  const { data: featuredCampaign, isLoading: featuredLoading } = useFeaturedCampaign();
  
  const filteredCampaigns = campaigns.filter(campaign => {
    // Filter by category
    if (selectedTab !== "All" && campaign.platform !== selectedTab) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !campaign.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const calculateDaysLeft = (endDate: string) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="hero-gradient py-16 px-4 relative overflow-hidden">
          <WarpfieldStars />
          <div className="container mx-auto text-center text-white relative z-10">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Fund the Future of <span className="text-axanar-teal">Axanar</span>
            </h1>
            <p className="text-lg md:text-xl text-axanar-silver max-w-2xl mx-auto mb-8">
              Join thousands of fans supporting the Axanar Universe. Back projects, track your perks, and become part of sci-fi history.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/campaigns">
                <Button className="bg-axanar-teal hover:bg-axanar-teal/90 h-12 px-8">
                  Explore Campaigns
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" className="border-white/30 hover:bg-white/10 h-12 px-8 text-foreground">
                  Start a Campaign
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Featured Campaign */}
        {!featuredLoading && featuredCampaign && (
          <section className="py-12 px-4">
            <div className="container mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-8">
                Featured Campaign
              </h2>
              <FeaturedCampaign 
                id={featuredCampaign.id}
                title={featuredCampaign.title}
                description={featuredCampaign.description || 'Support the Axanar project'}
                image={featuredCampaign.image_url || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b'}
                creator="Axanar Productions"
                category={featuredCampaign.category}
                current={featuredCampaign.current_amount}
                goal={featuredCampaign.goal_amount || 100000}
                backers={featuredCampaign.backers_count}
                daysLeft={calculateDaysLeft(featuredCampaign.end_date)}
              />
            </div>
          </section>
        )}
        
        {/* Browse Campaigns */}
        <section className="py-12 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Browse Campaigns</h2>
                <p className="text-muted-foreground mt-1">Discover and support Axanar projects</p>
              </div>
              
              <div className="mt-4 md:mt-0 relative">
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-full pl-10 pr-4 py-2 border border-input bg-background w-full md:w-80"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
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
                  <div className="text-center py-16">
                    <p className="text-muted-foreground">Loading campaigns...</p>
                  </div>
                ) : filteredCampaigns.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCampaigns.map((campaign) => (
                      <CampaignCard 
                        key={campaign.id} 
                        id={campaign.id}
                        title={campaign.title}
                        description={campaign.description || 'Support this Axanar project'}
                        image={campaign.image_url || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b'}
                        creator="Axanar Productions"
                        category={campaign.category}
                        current={campaign.current_amount}
                        goal={campaign.goal_amount || 50000}
                        backers={campaign.backers_count}
                        daysLeft={calculateDaysLeft(campaign.end_date)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <h3 className="text-xl font-medium mb-2">No campaigns found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filters</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <div className="text-center mt-10">
              <Link to="/campaigns">
                <Button variant="outline" className="border-axanar-teal text-axanar-teal hover:bg-axanar-teal/10">
                  View All Campaigns
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* How It Works */}
        <section className="py-16 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
              Our platform makes it easy to fund and track Axanar projects
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-lg bg-card border">
                <div className="w-16 h-16 rounded-full bg-axanar-teal/10 text-axanar-teal flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Discover Projects</h3>
                <p className="text-muted-foreground">
                  Browse campaigns from the Axanar universe and find projects you want to support.
                </p>
              </div>
              
              <div className="p-6 rounded-lg bg-card border">
                <div className="w-16 h-16 rounded-full bg-axanar-teal/10 text-axanar-teal flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Back Campaigns</h3>
                <p className="text-muted-foreground">
                  Pledge your support and select perks that interest you from various reward tiers.
                </p>
              </div>
              
              <div className="p-6 rounded-lg bg-card border">
                <div className="w-16 h-16 rounded-full bg-axanar-teal/10 text-axanar-teal flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Track & Collect</h3>
                <p className="text-muted-foreground">
                  Monitor campaign progress and receive updates on your perks and rewards.
                </p>
              </div>
            </div>
            
            <div className="mt-12">
              <Link to="/how-it-works">
                <Button variant="outline" className="border-axanar-teal text-axanar-teal hover:bg-axanar-teal/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
