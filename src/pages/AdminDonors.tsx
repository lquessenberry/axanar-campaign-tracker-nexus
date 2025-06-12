
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 50;

const AdminDonors = () => {
  const [currentPage, setCurrentPage] = useState(1);

  // Get total count of donors
  const { data: totalCount } = useQuery({
    queryKey: ['donors-total-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('donors')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    },
  });

  // Get total count of active donors (those with pledges) - using aggregation to avoid pagination
  const { data: activeDonorsCount } = useQuery({
    queryKey: ['active-donors-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pledges')
        .select('donor_id')
        .not('donor_id', 'is', null);

      if (error) throw error;
      
      // Get unique donor IDs from pledges
      const uniqueDonorIds = new Set(data.map(pledge => pledge.donor_id));
      return uniqueDonorIds.size;
    },
  });

  // Get total amount raised - this already fetches all pledges correctly
  const { data: totalRaised } = useQuery({
    queryKey: ['total-raised'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pledges')
        .select('amount');

      if (error) throw error;
      
      const total = data.reduce((sum, pledge) => sum + Number(pledge.amount), 0);
      return total;
    },
  });

  // Get paginated donors with their accurate pledge totals
  const { data: donors, isLoading } = useQuery({
    queryKey: ['admin-donors', currentPage],
    queryFn: async () => {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // First get the donors for this page
      const { data: donorData, error: donorError } = await supabase
        .from('donors')
        .select('*')
        .range(from, to)
        .order('created_at', { ascending: false });

      if (donorError) throw donorError;

      // Then get pledge totals for these specific donors
      const donorIds = donorData.map(donor => donor.id);
      
      const { data: pledgeData, error: pledgeError } = await supabase
        .from('pledges')
        .select('donor_id, amount')
        .in('donor_id', donorIds);

      if (pledgeError) throw pledgeError;

      // Calculate totals for each donor
      const pledgeTotals = pledgeData.reduce((acc, pledge) => {
        if (!acc[pledge.donor_id]) {
          acc[pledge.donor_id] = { total: 0, count: 0 };
        }
        acc[pledge.donor_id].total += Number(pledge.amount);
        acc[pledge.donor_id].count += 1;
        return acc;
      }, {} as Record<string, { total: number; count: number }>);

      // Combine donor data with pledge totals
      const donorsWithTotals = donorData.map(donor => ({
        ...donor,
        totalPledges: pledgeTotals[donor.id]?.total || 0,
        pledgeCount: pledgeTotals[donor.id]?.count || 0
      }));
      
      return donorsWithTotals;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading donors...</div>
      </div>
    );
  }

  const totalPages = Math.ceil((totalCount || 0) / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPaginationItems = () => {
    const items = [];
    const showEllipsis = totalPages > 7;
    
    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          items.push(i);
        }
        items.push('ellipsis');
        items.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        items.push(1);
        items.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          items.push(i);
        }
      } else {
        items.push(1);
        items.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          items.push(i);
        }
        items.push('ellipsis');
        items.push(totalPages);
      }
    }
    
    return items;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/admin" className="inline-flex items-center text-primary hover:text-primary/80 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-4 text-foreground">Manage Donors</h1>
          <p className="text-muted-foreground">View and manage donor information</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Total Donors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{totalCount?.toLocaleString() || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Active Donors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">
                {activeDonorsCount?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Total Raised</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                ${totalRaised?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              All Donors (Page {currentPage} of {totalPages})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Name</TableHead>
                    <TableHead className="text-muted-foreground">Email</TableHead>
                    <TableHead className="text-muted-foreground">Pledges</TableHead>
                    <TableHead className="text-muted-foreground">Total Donated</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donors?.map((donor) => (
                    <TableRow key={donor.id} className="border-border">
                      <TableCell className="text-card-foreground">
                        {donor.first_name && donor.last_name 
                          ? `${donor.first_name} ${donor.last_name}`
                          : donor.full_name || donor.donor_name || 'Unknown'
                        }
                      </TableCell>
                      <TableCell className="text-card-foreground">{donor.email}</TableCell>
                      <TableCell className="text-card-foreground">{donor.pledgeCount}</TableCell>
                      <TableCell className="text-card-foreground">
                        ${donor.totalPledges.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={donor.auth_user_id ? "default" : "secondary"}
                          className={donor.auth_user_id 
                            ? "bg-green-600 text-white" 
                            : "bg-yellow-600 text-white"
                          }
                        >
                          {donor.auth_user_id ? "Registered" : "Legacy"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-card-foreground">
                        {donor.created_at ? new Date(donor.created_at).toLocaleDateString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount || 0)} of {totalCount?.toLocaleString() || 0} donors
              </div>
              
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="gap-1 pl-2.5"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                  </PaginationItem>
                  
                  {getPaginationItems().map((item, index) => (
                    <PaginationItem key={index}>
                      {item === 'ellipsis' ? (
                        <span className="flex h-9 w-9 items-center justify-center">...</span>
                      ) : (
                        <PaginationLink
                          isActive={currentPage === item}
                          onClick={() => handlePageChange(item as number)}
                          className="cursor-pointer"
                        >
                          {item}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="gap-1 pr-2.5"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDonors;
