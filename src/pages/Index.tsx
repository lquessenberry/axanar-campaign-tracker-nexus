import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FeaturedCampaign from "@/components/FeaturedCampaign";
import CampaignCard from "@/components/CampaignCard";
import { Search } from "lucide-react";

// Mock data for demo
const featuredCampaign = {
  id: "axanar-film",
  title: "Axanar: The Feature Film",
  description: "Axanar takes place 21 years before the events of \"Where no man has gone before\", the first Star Trek episode, and tells the story of Garth of Izar and his crew during the Four Years War, the war with the Klingon Empire that almost tore the Federation apart.",
  image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
  creator: "Axanar Productions",
  category: "Film & Video",
  current: 750000,
  goal: 1000000,
  backers: 8423,
  daysLeft: 18
};

const campaignCategories = ["All", "Film & Video", "Publishing", "Games", "Technology", "Art", "Music", "Comics"];

const campaigns = [
  {
    id: "prelude",
    title: "Prelude to Axanar",
    description: "A short film that sets up the feature film Axanar, detailing the historical events leading up to the Battle of Axanar.",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80",
    creator: "Axanar Productions",
    category: "Film & Video",
    current: 125000,
    goal: 100000,
    backers: 2187,
    daysLeft: 0
  },
  {
    id: "interlude",
    title: "Interlude",
    description: "A bridge between Prelude to Axanar and the feature film, continuing the story of the Four Years War.",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1172&q=80",
    creator: "Axanar Productions",
    category: "Film & Video",
    current: 85000,
    goal: 75000,
    backers: 943,
    daysLeft: 0
  },
  {
    id: "the-icarus-maneuver",
    title: "The Icarus Maneuver",
    description: "A tactical novel set during the Four Years War, detailing a critical battle in the Axanar universe.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    creator: "Axanar Books",
    category: "Publishing",
    current: 45000,
    goal: 50000,
    backers: 524,
    daysLeft: 12
  },
  {
    id: "daedalus",
    title: "Daedalus: Starship Model",
    description: "Limited edition collector's model of the USS Daedalus from the Axanar universe, with detailed paint and lighting.",
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    creator: "Axanar Props",
    category: "Art",
    current: 65000,
    goal: 80000,
    backers: 320,
    daysLeft: 22
  },
  {
    id: "four-years-war",
    title: "Four Years War: The Game",
    description: "A strategic board game set during the Four Years War in the Axanar universe. Command Federation or Klingon forces in epic battles.",
    image: "https://images.unsplash.com/photo-1493962853295-0fd70327578a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    creator: "Axanar Games",
    category: "Games",
    current: 120000,
    goal: 150000,
    backers: 1670,
    daysLeft: 25
  },
  {
    id: "axanar-soundtrack",
    title: "Axanar: Original Soundtrack",
    description: "The complete original soundtrack to Axanar, featuring orchestral compositions inspired by classic sci-fi themes.",
    image: "https://images.unsplash.com/photo-1517022812141-23620dba5c23?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    creator: "Axanar Music",
    category: "Music",
    current: 25000,
    goal: 30000,
    backers: 412,
    daysLeft: 8
  },
];

const Index = () => {
  const [selectedTab, setSelectedTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
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
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="hero-gradient py-16 px-4">
          <div className="container mx-auto text-center text-white">
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
              <Link to="/register">
                <Button variant="outline" className="border-white/30 hover:bg-white/10 h-12 px-8">
                  Start a Campaign
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Featured Campaign */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">
              Featured Campaign
            </h2>
            <FeaturedCampaign {...featuredCampaign} />
          </div>
        </section>
        
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
                {filteredCampaigns.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCampaigns.map((campaign) => (
                      <CampaignCard key={campaign.id} {...campaign} />
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
