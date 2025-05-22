
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProgressBar from "@/components/ProgressBar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUp, ArrowDown, Users, DollarSign, Clock, Heart, Package, Edit, Info, Plus } from "lucide-react";

// Mock data
const campaignStats = {
  id: "axanar-soundtrack",
  title: "Axanar: Original Soundtrack",
  funds: 25000,
  goal: 30000,
  backers: 412,
  daysLeft: 8,
  percentageToGoal: 83,
  fundingTrend: "+8%",
  averagePledge: "$60.68",
  referralSources: [
    { name: "Direct", value: 45 },
    { name: "Social", value: 28 },
    { name: "Email", value: 15 },
    { name: "Organic", value: 12 },
  ],
  dailyFunding: [
    { name: "May 15", amount: 1200 },
    { name: "May 16", amount: 1800 },
    { name: "May 17", amount: 1500 },
    { name: "May 18", amount: 2200 },
    { name: "May 19", amount: 1900 },
    { name: "May 20", amount: 2500 },
    { name: "May 21", amount: 2800 },
    { name: "May 22", amount: 3100 },
  ],
  perks: [
    { 
      name: "Digital Download", 
      claimed: 220, 
      limit: null, 
      price: 15, 
      total: 3300 
    },
    { 
      name: "Collector's Edition", 
      claimed: 150, 
      limit: 200, 
      price: 50, 
      total: 7500 
    },
    { 
      name: "Signed Vinyl", 
      claimed: 42, 
      limit: 50, 
      price: 100, 
      total: 4200 
    },
  ],
  recentBackers: [
    { 
      name: "Michael Chen", 
      amount: 50, 
      date: "2025-05-22", 
      perk: "Collector's Edition" 
    },
    { 
      name: "Sarah Johnson", 
      amount: 100, 
      date: "2025-05-21", 
      perk: "Signed Vinyl" 
    },
    { 
      name: "David Miller", 
      amount: 15, 
      date: "2025-05-21", 
      perk: "Digital Download" 
    },
    { 
      name: "Emma Wilson", 
      amount: 50, 
      date: "2025-05-20", 
      perk: "Collector's Edition" 
    },
    { 
      name: "James Taylor", 
      amount: 15, 
      date: "2025-05-20", 
      perk: "Digital Download" 
    },
  ],
  updates: [
    { 
      id: 1, 
      title: "Production Progress Update", 
      date: "2025-05-18", 
      comments: 12 
    },
    { 
      id: 2, 
      title: "New Stretch Goals Announced", 
      date: "2025-05-15", 
      comments: 24 
    },
    { 
      id: 3, 
      title: "Recording Session Photos", 
      date: "2025-05-10", 
      comments: 18 
    },
  ],
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        {/* Dashboard Header */}
        <section className="bg-axanar-dark text-white">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge-primary bg-axanar-teal">Active Campaign</span>
                  {campaignStats.daysLeft <= 10 && (
                    <span className="badge-primary bg-amber-400 text-amber-900">Ending Soon</span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">{campaignStats.title}</h1>
                <p className="text-axanar-silver/80 mt-1">Campaign Creator Dashboard</p>
              </div>
              
              <div className="flex gap-2">
                <Link to={`/campaign/${campaignStats.id}`}>
                  <Button variant="outline" className="border-white/30 hover:bg-white/10">
                    View Campaign
                  </Button>
                </Link>
                <Link to={`/campaign/${campaignStats.id}/edit`}>
                  <Button className="bg-axanar-teal hover:bg-axanar-teal/90">
                    Edit Campaign
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Dashboard Tabs */}
        <section className="border-b">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex bg-transparent h-auto py-2 gap-2">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-axanar-teal rounded-none"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="backers" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-axanar-teal rounded-none"
                >
                  Backers
                </TabsTrigger>
                <TabsTrigger 
                  value="perks" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-axanar-teal rounded-none"
                >
                  Perks
                </TabsTrigger>
                <TabsTrigger 
                  value="updates" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-axanar-teal rounded-none"
                >
                  Updates
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-axanar-teal rounded-none"
                >
                  Settings
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </section>
        
        {/* Dashboard Content */}
        <section className="py-8 px-4 bg-muted/10">
          <div className="container mx-auto">
            <TabsContent value="overview" className="mt-0">
              {/* Campaign Progress */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Campaign Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <ProgressBar current={campaignStats.funds} goal={campaignStats.goal} />
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Backers</p>
                        <p className="text-2xl font-bold">{campaignStats.backers}</p>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Days Left</p>
                        <p className="text-2xl font-bold">{campaignStats.daysLeft}</p>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Average Pledge</p>
                        <p className="text-2xl font-bold">{campaignStats.averagePledge}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Funding Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Raised</p>
                          <p className="text-2xl font-bold">${campaignStats.funds.toLocaleString()}</p>
                        </div>
                        <div className={`flex items-center ${campaignStats.fundingTrend.includes('+') ? 'text-green-500' : 'text-red-500'}`}>
                          {campaignStats.fundingTrend.includes('+') ? (
                            <ArrowUp className="h-4 w-4 mr-1" />
                          ) : (
                            <ArrowDown className="h-4 w-4 mr-1" />
                          )}
                          <span>{campaignStats.fundingTrend}</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Referral Sources</p>
                        <div className="space-y-2">
                          {campaignStats.referralSources.map((source, index) => (
                            <div key={index} className="flex items-center">
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="bg-axanar-teal h-2 rounded-full" 
                                  style={{ width: `${source.value}%` }}
                                />
                              </div>
                              <span className="ml-2 text-xs">{source.name} ({source.value}%)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Charts and Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Daily Funding</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={campaignStats.dailyFunding}
                          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => [`$${value}`, 'Amount']}
                            labelFormatter={(label) => `Date: ${label}`}
                          />
                          <Bar dataKey="amount" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {campaignStats.recentBackers.map((backer, index) => (
                        <div key={index} className="flex items-start pb-3 border-b last:border-0">
                          <div className="w-8 h-8 rounded-full bg-axanar-teal/20 flex items-center justify-center mr-3">
                            <Users className="h-4 w-4 text-axanar-teal" />
                          </div>
                          <div>
                            <p className="font-medium">{backer.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Pledged ${backer.amount} for {backer.perk}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(backer.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="backers" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-axanar-teal" />
                      <CardTitle className="text-lg">Total Backers</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{campaignStats.backers}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      <span className="text-green-500">+24</span> in the last week
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-axanar-teal" />
                      <CardTitle className="text-lg">Average Pledge</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{campaignStats.averagePledge}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      <span className="text-green-500">+$5.32</span> from previous average
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-axanar-teal" />
                      <CardTitle className="text-lg">Conversion Rate</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">4.2%</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      <span className="text-red-500">-0.3%</span> from previous week
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Backer Details</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Export CSV</Button>
                      <Button size="sm" className="bg-axanar-teal hover:bg-axanar-teal/90">
                        Add Backer
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-5 bg-muted/30 py-3 px-4 text-sm font-medium">
                      <div>Name</div>
                      <div>Date</div>
                      <div>Amount</div>
                      <div>Perk</div>
                      <div>Actions</div>
                    </div>
                    
                    {campaignStats.recentBackers.concat(campaignStats.recentBackers).map((backer, index) => (
                      <div key={index} className="grid grid-cols-5 py-3 px-4 text-sm border-t">
                        <div>{backer.name}</div>
                        <div>{new Date(backer.date).toLocaleDateString()}</div>
                        <div>${backer.amount}</div>
                        <div>{backer.perk}</div>
                        <div>
                          <Button variant="ghost" size="sm">
                            <Info className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{" "}
                      <span className="font-medium">{campaignStats.backers}</span> results
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" disabled>
                        Previous
                      </Button>
                      <Button variant="outline" size="sm">
                        Next
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="perks" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2">
                      <Package className="h-5 w-5 text-axanar-teal" />
                      <CardTitle className="text-lg">Total Perks</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{campaignStats.perks.length}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      Active perk types in your campaign
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-5 w-5 text-axanar-teal" />
                      <CardTitle className="text-lg">Most Popular</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{campaignStats.perks[0].name}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      {campaignStats.perks[0].claimed} backers selected this perk
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-axanar-teal" />
                      <CardTitle className="text-lg">Total Revenue</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">${campaignStats.funds.toLocaleString()}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      From all perks combined
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Perk Management</CardTitle>
                    <Button className="bg-axanar-teal hover:bg-axanar-teal/90">
                      <Plus className="h-4 w-4 mr-1" /> Add New Perk
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaignStats.perks.map((perk, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold">{perk.name}</h3>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Price</p>
                              <p className="font-medium">${perk.price}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Claimed</p>
                              <p className="font-medium">
                                {perk.claimed}{perk.limit ? `/${perk.limit}` : ""}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Total Revenue</p>
                              <p className="font-medium">${perk.total.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Status</p>
                              <p className="font-medium">
                                {perk.limit && perk.claimed >= perk.limit ? (
                                  <span className="text-amber-600">Sold Out</span>
                                ) : (
                                  <span className="text-green-600">Available</span>
                                )}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            {perk.limit && (
                              <div className="w-full bg-muted rounded-full h-2 mt-2">
                                <div 
                                  className="bg-axanar-teal h-2 rounded-full" 
                                  style={{ width: `${(perk.claimed / perk.limit) * 100}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="updates" className="mt-0">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Campaign Updates</CardTitle>
                    <Button className="bg-axanar-teal hover:bg-axanar-teal/90">
                      <Plus className="h-4 w-4 mr-1" /> Post New Update
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {campaignStats.updates.map((update) => (
                      <div key={update.id} className="border-b pb-6 last:border-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg">{update.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Posted on {new Date(update.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-4">
                          <div className="text-sm">
                            <span className="font-medium">{update.comments}</span> comments
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">254</span> views
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Campaign Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-2">
                          <label className="text-sm font-medium">Campaign Title</label>
                          <input 
                            type="text" 
                            className="w-full rounded-md border px-3 py-2"
                            defaultValue={campaignStats.title}
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <label className="text-sm font-medium">Campaign Description</label>
                          <textarea 
                            className="w-full rounded-md border px-3 py-2 h-32"
                            defaultValue="The complete original soundtrack to Axanar, featuring orchestral compositions inspired by classic sci-fi themes."
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid grid-cols-1 gap-2">
                            <label className="text-sm font-medium">Funding Goal</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                              <input 
                                type="text" 
                                className="w-full rounded-md border px-8 py-2"
                                defaultValue={campaignStats.goal}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            <label className="text-sm font-medium">Campaign End Date</label>
                            <input 
                              type="date" 
                              className="w-full rounded-md border px-3 py-2"
                              defaultValue="2025-05-30"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <Button className="bg-axanar-teal hover:bg-axanar-teal/90 mt-6">
                        Save Campaign Settings
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-2">
                          <label className="text-sm font-medium">Payment Account</label>
                          <input 
                            type="email" 
                            className="w-full rounded-md border px-3 py-2"
                            defaultValue="payments@axanarproductions.com"
                          />
                          <p className="text-xs text-muted-foreground">
                            All funds will be transferred to this account
                          </p>
                        </div>
                        
                        <div className="border-t pt-4 mt-4">
                          <h3 className="font-medium mb-2">Tax Information</h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Tax Forms Submitted</span>
                              <span className="text-sm font-medium text-green-600">Completed</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Tax ID</span>
                              <span className="text-sm font-medium">XX-XXXXXXX</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Button className="bg-axanar-teal hover:bg-axanar-teal/90 mt-6">
                        Update Payment Settings
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Campaign Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="active" 
                            className="rounded text-axanar-teal"
                            defaultChecked
                          />
                          <label htmlFor="active" className="text-sm font-medium">
                            Campaign Active
                          </label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          When disabled, your campaign will not be visible to the public
                        </p>
                      </div>
                      
                      <Button className="bg-destructive hover:bg-destructive/90 w-full mt-6">
                        Cancel Campaign
                      </Button>
                      <p className="text-xs text-center text-muted-foreground mt-2">
                        This action cannot be undone
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="new-backer" 
                            className="rounded text-axanar-teal"
                            defaultChecked
                          />
                          <label htmlFor="new-backer" className="text-sm">
                            New Backer Notifications
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="comments" 
                            className="rounded text-axanar-teal"
                            defaultChecked
                          />
                          <label htmlFor="comments" className="text-sm">
                            Comment Notifications
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="milestones" 
                            className="rounded text-axanar-teal"
                            defaultChecked
                          />
                          <label htmlFor="milestones" className="text-sm">
                            Funding Milestone Alerts
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="daily" 
                            className="rounded text-axanar-teal"
                          />
                          <label htmlFor="daily" className="text-sm">
                            Daily Funding Summaries
                          </label>
                        </div>
                      </div>
                      
                      <Button className="bg-axanar-teal hover:bg-axanar-teal/90 w-full mt-6">
                        Save Notification Settings
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
