// Pledge Manager for viewing and managing 18,000+ pledges
// cspell:ignore supabase,axanar
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Calendar, Download, ArrowUpDown, Filter, DollarSign, Tag, Package } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Types
interface Pledge {
  id: string;
  amount: number;
  campaign_id: string;
  donor_id: string;
  perk_id?: string;
  created_at: string;
  status?: string;
  // Joined data
  donor?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  campaign?: {
    id: string;
    name?: string;
  };
  perk?: {
    id: string;
    name?: string;
    amount?: number;
  };
}

interface Campaign {
  id: string;
  name: string;
}

interface Perk {
  id: string;
  name: string;
  campaign_id: string;
}

interface FilterState {
  search: string;
  campaign: string;
  perk: string;
  minAmount: number | null;
  maxAmount: number | null;
  startDate: string;
  endDate: string;
  status: string;
  sortBy: 'date' | 'amount' | 'donor';
  sortOrder: 'asc' | 'desc';
}

// Format currency values
const formatCurrency = (value: number | undefined) => {
  if (value === undefined) return "$0.00";
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

// Format date values
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Main component
const PledgeManager = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [perks, setPerks] = useState<Perk[]>([]);
  const [totalPledges, setTotalPledges] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    campaign: '',
    perk: '',
    minAmount: null,
    maxAmount: null,
    startDate: '',
    endDate: '',
    status: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  
  // Fetch reference data (campaigns, perks)
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        // Fetch campaigns
        const { data: campaignData, error: campaignError } = await supabase
          .from('campaigns')
          .select('id, name');
          
        if (campaignError) {
          console.error('Error fetching campaigns:', campaignError);
        } else if (campaignData) {
          setCampaigns(campaignData);
        }
        
        // Fetch perks
        const { data: perkData, error: perkError } = await supabase
          .from('perks')
          .select('id, name, campaign_id');
          
        if (perkError) {
          console.error('Error fetching perks:', perkError);
        } else if (perkData) {
          setPerks(perkData);
        }
      } catch (err) {
        console.error('Error fetching reference data:', err);
      }
    };
    
    fetchReferenceData();
  }, []);
  
  // Load pledge data with pagination and filtering
  useEffect(() => {
    const fetchPledges = async () => {
      setLoading(true);
      
      try {
        // Get total count for pagination
        let countQuery = supabase
          .from('pledges')
          .select('*', { count: 'exact', head: true });
          
        // Apply campaign filter if selected
        if (filters.campaign) {
          countQuery = countQuery.eq('campaign_id', filters.campaign);
        }
        
        // Apply perk filter if selected
        if (filters.perk) {
          countQuery = countQuery.eq('perk_id', filters.perk);
        }
        
        // Apply status filter if selected
        if (filters.status) {
          countQuery = countQuery.eq('status', filters.status);
        }
        
        // Apply amount filters if present
        if (filters.minAmount !== null) {
          countQuery = countQuery.gte('amount', filters.minAmount);
        }
        
        if (filters.maxAmount !== null) {
          countQuery = countQuery.lte('amount', filters.maxAmount);
        }
        
        // Apply date filters if present
        if (filters.startDate) {
          countQuery = countQuery.gte('created_at', filters.startDate);
        }
        
        if (filters.endDate) {
          countQuery = countQuery.lte('created_at', filters.endDate);
        }
        
        const { count, error: countError } = await countQuery;
          
        if (countError) {
          console.error('Error getting pledge count:', countError);
        } else {
          setTotalPledges(count || 0);
        }
        
        // Build query with filters and joins
        let query = supabase
          .from('pledges')
          .select(`
            id, amount, created_at, status,
            donor:donor_id(id, first_name, last_name, email),
            campaign:campaign_id(id, name),
            perk:perk_id(id, name, amount)
          `);
          
        // Apply same filters as count query
        if (filters.campaign) {
          query = query.eq('campaign_id', filters.campaign);
        }
        
        if (filters.perk) {
          query = query.eq('perk_id', filters.perk);
        }
        
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        
        if (filters.minAmount !== null) {
          query = query.gte('amount', filters.minAmount);
        }
        
        if (filters.maxAmount !== null) {
          query = query.lte('amount', filters.maxAmount);
        }
        
        if (filters.startDate) {
          query = query.gte('created_at', filters.startDate);
        }
        
        if (filters.endDate) {
          query = query.lte('created_at', filters.endDate);
        }
        
        // Apply sorting
        const { sortBy, sortOrder } = filters;
        if (sortBy === 'date') {
          query = query.order('created_at', { ascending: sortOrder === 'asc' });
        } else if (sortBy === 'amount') {
          query = query.order('amount', { ascending: sortOrder === 'asc' });
        }
        
        // Apply pagination
        query = query
          .range((page - 1) * pageSize, page * pageSize - 1);
          
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching pledges:', error);
          toast({
            title: "Error loading pledges",
            description: error.message,
            variant: "destructive"
          });
        } else if (data) {
          setPledges(data);
          
          // Calculate total amount (across all pledges, not just current page)
          const { data: amountData, error: amountError } = await supabase
            .from('pledges')
            .select('amount');
            
          if (amountData) {
            const total = amountData.reduce((sum, pledge) => sum + Number(pledge.amount || 0), 0);
            setTotalAmount(total);
          }
        }
      } catch (err) {
        console.error('Error in fetchPledges:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPledges();
  }, [page, pageSize, filters, toast]);
  
  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when changing filters
  };
  
  // Handle sort toggle
  const toggleSort = (sortKey: FilterState['sortBy']) => {
    if (filters.sortBy === sortKey) {
      // Toggle order if already sorting by this field
      handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to descending
      setFilters(prev => ({ ...prev, sortBy: sortKey, sortOrder: 'desc' }));
    }
  };
  
  // Handle pagination
  const nextPage = () => {
    if (page * pageSize < totalPledges) {
      setPage(p => p + 1);
    }
  };
  
  const prevPage = () => {
    if (page > 1) {
      setPage(p => p - 1);
    }
  };
  
  // Check if user has admin access
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Access Restricted</CardTitle>
                <CardDescription>
                  You need administrator privileges to access the pledge manager.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Please contact the system administrator if you believe this is an error.</p>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Pledge Manager</h1>
              <p className="text-muted-foreground">
                {totalPledges.toLocaleString()} pledges totaling {formatCurrency(totalAmount)}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button className="bg-axanar-teal hover:bg-axanar-teal/90">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Filters</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced Filters</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <Label htmlFor="campaign">Campaign</Label>
                      <Select
                        value={filters.campaign}
                        onValueChange={(value) => handleFilterChange('campaign', value)}
                      >
                        <SelectTrigger id="campaign">
                          <SelectValue placeholder="All Campaigns" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Campaigns</SelectItem>
                          {campaigns.map((campaign) => (
                            <SelectItem key={campaign.id} value={campaign.id}>
                              {campaign.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="minAmount">Min Amount</Label>
                      <Input
                        id="minAmount"
                        type="number"
                        placeholder="$0"
                        value={filters.minAmount || ''}
                        onChange={(e) => handleFilterChange('minAmount', e.target.value ? Number(e.target.value) : null)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="maxAmount">Max Amount</Label>
                      <Input
                        id="maxAmount"
                        type="number"
                        placeholder="Any"
                        value={filters.maxAmount || ''}
                        onChange={(e) => handleFilterChange('maxAmount', e.target.value ? Number(e.target.value) : null)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={filters.status}
                        onValueChange={(value) => handleFilterChange('status', value)}
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Statuses</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <Label htmlFor="perk">Perk</Label>
                      <Select
                        value={filters.perk}
                        onValueChange={(value) => handleFilterChange('perk', value)}
                      >
                        <SelectTrigger id="perk">
                          <SelectValue placeholder="All Perks" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Perks</SelectItem>
                          {perks.map((perk) => (
                            <SelectItem key={perk.id} value={perk.id}>
                              {perk.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="search">Search</Label>
                      <Input
                        id="search"
                        placeholder="Donor name, email..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Pledge Table */}
          <Card>
            <CardHeader>
              <CardTitle>Pledges</CardTitle>
              <CardDescription>
                Showing {pledges.length} of {totalPledges} pledges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">
                      <Button variant="ghost" onClick={() => toggleSort('date')} className="flex items-center px-0">
                        Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-[180px]">Donor</TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => toggleSort('amount')} className="flex items-center px-0">
                        Amount
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Perk</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={`skeleton-${i}`}>
                        <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[150px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[120px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-6 w-[80px] ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : pledges.length > 0 ? (
                    pledges.map((pledge) => (
                      <TableRow key={pledge.id}>
                        <TableCell>
                          {formatDate(pledge.created_at)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {pledge.donor ? (
                            <>
                              <Link to={`/donor/${pledge.donor.id}`} className="hover:underline">
                                {pledge.donor.first_name} {pledge.donor.last_name}
                              </Link>
                              {pledge.donor.email && (
                                <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                                  {pledge.donor.email}
                                </p>
                              )}
                            </>
                          ) : (
                            <span className="text-muted-foreground">Unknown donor</span>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(pledge.amount)}
                        </TableCell>
                        <TableCell>
                          {pledge.campaign?.name || 'Unknown Campaign'}
                        </TableCell>
                        <TableCell>
                          {pledge.perk?.name ? (
                            <div className="flex items-center">
                              <Package className="mr-2 h-3 w-3" />
                              <span>{pledge.perk.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">No perk</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${pledge.status === 'completed' ? 'bg-green-500' : pledge.status === 'pending' ? 'bg-yellow-500' : pledge.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'}`}>
                            {pledge.status || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                  <circle cx="12" cy="12" r="1" />
                                  <circle cx="12" cy="5" r="1" />
                                  <circle cx="12" cy="19" r="1" />
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Link to={`/pledge/${pledge.id}`} className="w-full">
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>Edit Pledge</DropdownMenuItem>
                              <DropdownMenuItem>Update Status</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No pledges found matching your filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing page {page} of {Math.ceil(totalPledges / pageSize)}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevPage}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextPage}
                    disabled={page * pageSize >= totalPledges}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PledgeManager;
