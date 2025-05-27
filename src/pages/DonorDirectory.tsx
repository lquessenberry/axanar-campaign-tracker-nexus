// Donor Directory for viewing and managing donor profiles
// cspell:ignore supabase,axanar
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Import the server-side API handler for fetching donors
import { fetchDonors as fetchDonorsFromAPI, SortableDonorColumns, SortOrder } from '../api/donors';

// Temporary imports until proper components are created
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";

// Define types for our data based on Supabase schema and component needs
interface ProfileFromDB { // Represents a row in the 'donor_profiles' table
  id: string;
  legacy_user_id: number | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
  donor_name: string | null;
  last_login: string | null; 
  created_at: string; 
}

interface DonorProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  donor_name: string | null;
  last_login: string | null;
  created_at: string;
  display_name: string; // Computed display name
  total_donated: number; // Real donation total from API
  pledge_count: number; // Real pledge count from API
}

// Format currency values
const formatCurrency = (value: number | undefined | null) => {
  console.log('FORMATTING CURRENCY:', value, 'TYPE:', typeof value);
  if (value == null) return "$0.00"; // Handle null or undefined
  
  // Ensure value is a number (convert from string if needed)
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Format as currency
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numValue);
  console.log('FORMATTED CURRENCY:', formatted);
  return formatted;
};

// Format date values
const formatDate = (dateString: string | undefined) => {
  console.log('FORMAT DATE INPUT:', dateString);
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    console.log('PARSED DATE OBJECT:', date);
    const formatted = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    console.log('FORMATTED DATE OUTPUT:', formatted);
    return formatted;
  } catch (e) {
    console.error('DATE FORMATTING ERROR:', e);
    return "Invalid Date";
  }
};

const DonorDirectory: React.FC = () => {
  console.log('DonorDirectory component rendering/re-rendering...');

  // Hooks
  const { toast } = useToast();
  const { user } = useAuth(); // Assuming 'user' is needed, e.g., for role-based checks not yet implemented
  const navigate = useNavigate();
  
  // State management
  const [donors, setDonors] = useState<DonorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalDonors, setTotalDonors] = useState(0);
  
  // Search and Filtering
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sorting
  const [sortField, setSortField] = useState<SortableDonorColumns>('total_donated'); // Default to total_donated, using imported type
  const [sortDirection, setSortDirection] = useState<SortOrder>('desc'); // Default to descending, using imported type
  
  // Pledge statistics
  const [pledgeStats, setPledgeStats] = useState<{total: number; average: number; max: number}>({
    total: 0,
    average: 0,
    max: 0
  });
  
  // Calculate pagination values
  const totalPages = Math.ceil(totalDonors / pageSize);
  
  // Get environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  // Define type for API response to avoid 'any'
  type DonorProfileApiResponse = {
    id: string;
    legacy_user_id: string | number | null;
    email: string;
    first_name: string | null;
    last_name: string | null;
    donor_name: string | null;
    last_login: string | null;
    created_at: string;
    pledge_count: number;
    total_donated: number;
  };

  // Handle sorting when header is clicked
  const handleSort = (field: SortableDonorColumns | 'display_name') => { // Allow 'display_name' for UI purposes
    let apiSortField: SortableDonorColumns = field as SortableDonorColumns;
    if (field === 'display_name') {
      apiSortField = 'donor_name'; // Map UI 'display_name' to 'donor_name' for the API
    }

    if (apiSortField === sortField) {
      setSortDirection(prevDirection => (prevDirection === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(apiSortField);
      setSortDirection('asc'); // Default to ascending when changing field
    }
    setPage(1); // Reset to first page on sort change
  };

  // Fetch donor data with pagination and search
  const fetchDonors = useCallback(async () => {
    console.log(`Fetching donors: Page ${page}, Size ${pageSize}, Search: '${searchQuery}', Sort: ${sortField} ${sortDirection}`);
    setLoading(true);
    setError(null);
    
    try {
      console.log('STEP 2: Setting initial states');
      
      // Check if user is authenticated
      if (!user) {
        console.log('User not authenticated, showing error');
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to view donor data.',
          variant: 'destructive',
        });
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      console.log('STEP 3: Fetching data via server-side API');
      
      // Call the server-side API handler
      const { data, count } = await fetchDonorsFromAPI(page, pageSize, searchQuery, sortField, sortDirection);
      
      console.log(`STEP 4: Processing ${data.length} donor records`);
      
      // Transform data to match our interface
      const transformedDonors = data.map(profile => {
        console.log(`Raw created_at for donor ${profile.id || profile.email}:`, profile.created_at); // DEBUG LOG
        // Create a display name from available fields
        const firstName = profile.first_name || '';
        const lastName = profile.last_name || '';
        const donorName = profile.donor_name || '';
        
        // Prefer donor_name if available, otherwise use first_name + last_name
        // If neither is available, use email or 'Unknown'
        let displayName = donorName;
        if (!displayName && (firstName || lastName)) {
          displayName = `${firstName} ${lastName}`.trim();
        }
        if (!displayName) {
          displayName = profile.email.split('@')[0] || 'Unknown';
        }
        
        return {
          ...profile,
          // Ensure we have types that match our interface
          display_name: displayName,
          // Use the actual values from the API response
          total_donated: profile.total_donated || 0,
          pledge_count: profile.pledge_count || 0
        } as DonorProfile;
      });
      
      // Set state with transformed data
      setDonors(transformedDonors);
      setTotalDonors(count);
      console.log('State updated with donor data');
      
      toast({
        title: 'Data Loaded',
        description: `Loaded ${data.length} donor records.`,
        variant: 'default',
      });
      
    } catch (err: unknown) {
      console.error('Error in fetchDonors:', err);
      console.error('Error type:', typeof err);
      
      // Try to extract more information from the error
      let errorMessage = 'An unexpected error occurred. Check console for details.';
      let errorDetails = '';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        errorDetails = JSON.stringify(err, Object.getOwnPropertyNames(err));
        console.error('Error details:', errorDetails);
      } else if (err instanceof Response) {
        errorMessage = `HTTP Error: ${err.status} ${err.statusText}`;
        console.error('Response error:', errorMessage);
      } else {
        // Try to stringify the error for inspection
        try {
          errorDetails = JSON.stringify(err);
          console.error('Stringified error:', errorDetails);
        } catch (jsonError) {
          console.error('Could not stringify error object');
        }
      }
      
      // Check for common error patterns
      if (errorMessage.includes('NetworkError') || errorMessage.includes('CORS')) {
        errorMessage = 'Network or CORS error. The API endpoint may be inaccessible or blocking requests.';
      } else if (errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Failed to connect to the API. Check your network connection or API endpoint.';
      }
      
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery, user, sortField, sortDirection, toast]); // Include all necessary dependencies
  
  // Handle donor click navigation
  const handleDonorClick = useCallback((donorId: string) => {
    navigate(`/donor/${donorId}`);
  }, [navigate]);
  
  // Handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page on search change
  };
  
  // Handle page change
  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };
  
  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };
  
  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setPage(1); // Reset to first page on page size change
  };
  
  // Effect hook for initial data fetch and refetch on dependency changes
  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  // JSX for rendering the table rows or loading/error/empty states
  const renderTableContent = () => {
    if (loading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={`loading-${index}`}>
          <TableCell colSpan={4}>
            <Skeleton className="h-10 w-full" />
          </TableCell>
        </TableRow>
      ));
    }
    
    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
            <div className="flex flex-col items-center justify-center gap-2">
              <p>Error loading donor data.</p>
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchDonors()}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </TableCell>
        </TableRow>
      );
    }
    
    if (!donors.length) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
            No donors found.{searchQuery && ' Try adjusting your search criteria.'}
          </TableCell>
        </TableRow>
      );
    }

    return donors.map((donor: DonorProfile) => (
      <TableRow 
        key={donor.id} 
        onClick={() => handleDonorClick(donor.id)} 
        className="cursor-pointer hover:bg-muted/50 transition-colors"
      >
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{(donor.display_name[0] || '?').toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{donor.display_name}</div>
              <div className="text-sm text-muted-foreground">{donor.email || 'N/A'}</div>
            </div>
          </div>
        </TableCell>
        <TableCell className="text-center">
          <div className="flex items-center justify-center">
            <div className="relative">
              <span className="font-medium">{donor.pledge_count}</span>
              {donor.pledge_count > 0 && (
                <div className="absolute -top-1 -right-4 flex">
                  {Array.from({ length: Math.min(donor.pledge_count, 5) }).map((_, i) => (
                    <div 
                      key={i} 
                      className="h-1.5 w-1.5 rounded-full bg-axanar-teal/80 ml-0.5"
                      style={{ opacity: 1 - (i * 0.15) }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell className="text-right">{formatCurrency(donor.total_donated)}</TableCell>
        <TableCell>{formatDate(donor.created_at)}</TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="flex-1 py-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="border-b">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <CardTitle>All Donors</CardTitle>
                  <CardDescription>
                    {totalDonors > 0 
                      ? `${totalDonors} donor${totalDonors === 1 ? '' : 's'} found.` 
                      : loading ? 'Loading donors...' : 'No donors yet.'}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <div className="relative flex-grow sm:flex-grow-0">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search by name or email..."
                      className="pl-8 w-full sm:w-64 md:w-80"
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      aria-label="Search donors"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 transition-colors w-[30%]" 
                        onClick={() => handleSort('display_name')} // UI uses 'display_name'
                      >
                        Name / Email
                        {sortField === 'donor_name' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 transition-colors text-center w-[15%]"
                        onClick={() => handleSort('pledge_count')}
                      >
                        Pledges
                        {sortField === 'pledge_count' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 transition-colors text-right w-[20%]"
                        onClick={() => handleSort('total_donated')}
                      >
                        Total Donated
                        {sortField === 'total_donated' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 transition-colors text-center hidden md:table-cell w-[20%]"
                        onClick={() => handleSort('created_at')}
                      >
                        Date Joined
                        {sortField === 'created_at' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                      </TableHead>
                      <TableHead className="text-center w-[15%]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderTableContent()}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pledge statistics summary - always visible when data is loaded */}
              {!loading && !error && donors.length > 0 && (
                <div className="mt-4 p-3 bg-muted/30 rounded-md flex flex-wrap gap-4 justify-around items-center text-sm">
                  <div className="flex flex-col items-center">
                    <span className="text-muted-foreground">Total Pledges</span>
                    <span className="text-lg font-semibold text-axanar-teal">{pledgeStats.total}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-muted-foreground">Avg Per Donor</span>
                    <span className="text-lg font-semibold text-axanar-teal">{pledgeStats.average.toFixed(1)}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-muted-foreground">Max Pledges</span>
                    <span className="text-lg font-semibold text-axanar-teal">{pledgeStats.max}</span>
                  </div>
                  
                  {/* Debug info - temporarily display raw data */}
                  <details className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
                    <summary>Debug Data</summary>
                    <pre className="overflow-auto max-h-40 p-2">
                      {JSON.stringify(donors.slice(0, 3), null, 2)}
                    </pre>
                  </details>
                </div>
              )}
              
              {/* Pagination controls - only visible when multiple pages */}
              {totalDonors > 0 && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                  <div className="text-sm text-muted-foreground">
                    Page {page} of {totalPages} ({totalDonors} total donors)
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={page === 1 || loading}
                      aria-label="Go to previous page"
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={page >= totalPages || loading}
                      aria-label="Go to next page"
                    >
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="pageSizeSelect" className="text-sm font-normal whitespace-nowrap">Rows:</Label>
                    <Select value={String(pageSize)} onValueChange={handlePageSizeChange} disabled={loading}>
                      <SelectTrigger id="pageSizeSelect" className="w-20 h-9" aria-label="Select number of rows per page">
                        <SelectValue placeholder={pageSize} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DonorDirectory;
