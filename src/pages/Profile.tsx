
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CampaignCard from "@/components/CampaignCard";
import { Calendar, User, CreditCard, Heart, Package, Settings } from "lucide-react";

// Mock data
const userProfile = {
  name: "Alex Rodriguez",
  email: "alex.rodriguez@example.com",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
  joinDate: "March 2023",
  campaigns: 2,
  backed: 5,
};

const backedCampaigns = [
  {
    id: "axanar-film",
    title: "Axanar: The Feature Film",
    description: "Axanar takes place 21 years before the events of "Where no man has gone before", the first Star Trek episode.",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    creator: "Axanar Productions",
    category: "Film & Video",
    current: 750000,
    goal: 1000000,
    backers: 8423,
    daysLeft: 18
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
];

const createdCampaigns = [
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

const perks = [
  {
    id: "perk-1",
    title: "Digital Supporter",
    campaign: "Axanar: The Feature Film",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    status: "Confirmed",
    deliveryDate: "October 2025",
    tier: "Digital Supporter ($25)",
    items: ["Digital download", "Name in credits"],
  },
  {
    id: "perk-2",
    title: "Collector's Edition",
    campaign: "Four Years War: The Game",
    image: "https://images.unsplash.com/photo-1493962853295-0fd70327578a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    status: "Processing",
    deliveryDate: "December 2025",
    tier: "Early Bird ($65)",
    items: ["Game box", "Exclusive faction cards", "Digital art book"],
  },
];

const paymentMethods = [
  {
    id: "card-1",
    type: "Visa",
    last4: "4242",
    expiry: "04/26",
    isDefault: true,
  },
  {
    id: "card-2",
    type: "Mastercard",
    last4: "8123",
    expiry: "09/27",
    isDefault: false,
  },
];

const Profile = () => {
  const [activeTab, setActiveTab] = useState("backed");
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        {/* Profile Header */}
        <section className="bg-axanar-dark text-white">
          <div className="container mx-auto px-4 py-10">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-24 h-24 rounded-full ring-4 ring-axanar-teal"
              />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{userProfile.name}</h1>
                <p className="text-axanar-silver/80 mt-1">Member since {userProfile.joinDate}</p>
                <div className="flex space-x-6 mt-3">
                  <div>
                    <p className="text-lg font-bold">{userProfile.backed}</p>
                    <p className="text-xs text-axanar-silver/60">Projects Backed</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{userProfile.campaigns}</p>
                    <p className="text-xs text-axanar-silver/60">Campaigns Created</p>
                  </div>
                </div>
              </div>
              <div className="md:ml-auto">
                <Button className="bg-axanar-teal hover:bg-axanar-teal/90">
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Profile Content */}
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Sidebar */}
              <div className="w-full md:w-64 space-y-4">
                <div className="bg-card rounded-lg border shadow p-4">
                  <h3 className="font-medium mb-4">Profile Navigation</h3>
                  <div className="space-y-2">
                    <Button 
                      variant={activeTab === "backed" ? "default" : "ghost"}
                      className={activeTab === "backed" ? "bg-axanar-teal w-full justify-start" : "w-full justify-start"}
                      onClick={() => setActiveTab("backed")}
                    >
                      <Heart className="h-4 w-4 mr-2" /> Backed Projects
                    </Button>
                    <Button 
                      variant={activeTab === "created" ? "default" : "ghost"}
                      className={activeTab === "created" ? "bg-axanar-teal w-full justify-start" : "w-full justify-start"}
                      onClick={() => setActiveTab("created")}
                    >
                      <Calendar className="h-4 w-4 mr-2" /> Created Campaigns
                    </Button>
                    <Button 
                      variant={activeTab === "perks" ? "default" : "ghost"}
                      className={activeTab === "perks" ? "bg-axanar-teal w-full justify-start" : "w-full justify-start"}
                      onClick={() => setActiveTab("perks")}
                    >
                      <Package className="h-4 w-4 mr-2" /> My Perks
                    </Button>
                    <Button 
                      variant={activeTab === "payments" ? "default" : "ghost"}
                      className={activeTab === "payments" ? "bg-axanar-teal w-full justify-start" : "w-full justify-start"}
                      onClick={() => setActiveTab("payments")}
                    >
                      <CreditCard className="h-4 w-4 mr-2" /> Payment Methods
                    </Button>
                    <Button 
                      variant={activeTab === "settings" ? "default" : "ghost"}
                      className={activeTab === "settings" ? "bg-axanar-teal w-full justify-start" : "w-full justify-start"}
                      onClick={() => setActiveTab("settings")}
                    >
                      <Settings className="h-4 w-4 mr-2" /> Account Settings
                    </Button>
                  </div>
                </div>
                
                <div className="bg-card rounded-lg border shadow p-4">
                  <h3 className="font-medium mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      Start a Campaign
                    </Button>
                    <Button variant="outline" className="w-full">
                      Explore Projects
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="flex-1">
                {activeTab === "backed" && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Projects You've Backed</h2>
                    {backedCampaigns.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {backedCampaigns.map((campaign) => (
                          <CampaignCard key={campaign.id} {...campaign} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-muted/30 rounded-lg">
                        <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">You haven't backed any projects yet</h3>
                        <p className="text-muted-foreground mb-6">
                          Discover exciting Axanar projects and show your support
                        </p>
                        <Button className="bg-axanar-teal hover:bg-axanar-teal/90">
                          Explore Campaigns
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === "created" && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">Your Campaigns</h2>
                      <Button className="bg-axanar-teal hover:bg-axanar-teal/90">
                        Create New Campaign
                      </Button>
                    </div>
                    
                    {createdCampaigns.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {createdCampaigns.map((campaign) => (
                          <CampaignCard key={campaign.id} {...campaign} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-muted/30 rounded-lg">
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">You haven't created any campaigns yet</h3>
                        <p className="text-muted-foreground mb-6">
                          Share your Axanar project with the world and gather support
                        </p>
                        <Button className="bg-axanar-teal hover:bg-axanar-teal/90">
                          Start Your First Campaign
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === "perks" && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Your Perks</h2>
                    
                    {perks.length > 0 ? (
                      <div className="space-y-4">
                        {perks.map((perk) => (
                          <Card key={perk.id} className="overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                              <div className="w-full md:w-32 h-24 md:h-auto">
                                <img 
                                  src={perk.image} 
                                  alt={perk.title}
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                              <CardContent className="flex-1 p-4">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={`badge ${
                                        perk.status === "Confirmed" 
                                          ? "bg-green-100 text-green-700" 
                                          : "bg-amber-100 text-amber-700"
                                      } text-xs`}>
                                        {perk.status}
                                      </span>
                                      <span className="text-muted-foreground text-xs">
                                        Est. delivery: {perk.deliveryDate}
                                      </span>
                                    </div>
                                    <h3 className="font-bold">{perk.title}</h3>
                                    <p className="text-sm text-muted-foreground mb-2">
                                      From <span className="font-medium">{perk.campaign}</span>
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {perk.tier}
                                    </p>
                                    <ul className="text-xs text-muted-foreground mt-2">
                                      {perk.items.map((item, index) => (
                                        <li key={index}>• {item}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <Button variant="outline" size="sm" className="md:self-start">
                                    View Details
                                  </Button>
                                </div>
                              </CardContent>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-muted/30 rounded-lg">
                        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No perks yet</h3>
                        <p className="text-muted-foreground mb-6">
                          Back a project to receive exclusive perks and rewards
                        </p>
                        <Button className="bg-axanar-teal hover:bg-axanar-teal/90">
                          Explore Campaigns
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === "payments" && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Payment Methods</h2>
                    
                    <div className="space-y-4 mb-8">
                      {paymentMethods.map((method) => (
                        <Card key={method.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md flex items-center justify-center text-white font-bold">
                                  {method.type}
                                </div>
                                <div>
                                  <p className="font-medium">{method.type} •••• {method.last4}</p>
                                  <p className="text-sm text-muted-foreground">Expires {method.expiry}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {method.isDefault && (
                                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">Default</span>
                                )}
                                <Button variant="ghost" size="sm">
                                  Edit
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <Button className="bg-axanar-teal hover:bg-axanar-teal/90">
                      Add Payment Method
                    </Button>
                  </div>
                )}
                
                {activeTab === "settings" && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                    
                    <div className="space-y-8">
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-lg font-bold mb-4">Personal Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Full Name</label>
                              <input 
                                type="text" 
                                className="w-full rounded-md border px-3 py-2"
                                defaultValue={userProfile.name}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Email Address</label>
                              <input 
                                type="email" 
                                className="w-full rounded-md border px-3 py-2"
                                defaultValue={userProfile.email}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Profile Photo</label>
                              <div className="flex items-center gap-4">
                                <img 
                                  src={userProfile.avatar} 
                                  alt={userProfile.name}
                                  className="w-12 h-12 rounded-full" 
                                />
                                <Button variant="outline" size="sm">
                                  Change Photo
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="mt-6">
                            <Button className="bg-axanar-teal hover:bg-axanar-teal/90">
                              Save Changes
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-lg font-bold mb-4">Security</h3>
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Change Password</label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input 
                                  type="password" 
                                  className="w-full rounded-md border px-3 py-2"
                                  placeholder="Current Password"
                                />
                                <input 
                                  type="password" 
                                  className="w-full rounded-md border px-3 py-2"
                                  placeholder="New Password"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <input 
                                type="checkbox" 
                                id="two-factor" 
                                className="rounded text-axanar-teal"
                              />
                              <label htmlFor="two-factor" className="text-sm font-medium">
                                Enable Two-Factor Authentication
                              </label>
                            </div>
                          </div>
                          <div className="mt-6">
                            <Button className="bg-axanar-teal hover:bg-axanar-teal/90">
                              Update Security Settings
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-lg font-bold mb-4">Notification Preferences</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Campaign Updates</p>
                                <p className="text-sm text-muted-foreground">
                                  Receive updates about campaigns you've backed
                                </p>
                              </div>
                              <input 
                                type="checkbox" 
                                className="rounded text-axanar-teal"
                                defaultChecked
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">New Campaigns</p>
                                <p className="text-sm text-muted-foreground">
                                  Get notified about new Axanar campaigns
                                </p>
                              </div>
                              <input 
                                type="checkbox" 
                                className="rounded text-axanar-teal"
                              />
                            </div>
                          </div>
                          <div className="mt-6">
                            <Button className="bg-axanar-teal hover:bg-axanar-teal/90">
                              Save Preferences
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
