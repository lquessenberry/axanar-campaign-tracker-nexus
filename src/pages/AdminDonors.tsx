
import { useState } from 'react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdminDonorsData } from '@/hooks/useAdminDonorsData';
import DonorStatsCards from '@/components/admin/DonorStatsCards';
import DonorTable from '@/components/admin/DonorTable';
import DonorPagination from '@/components/admin/DonorPagination';

const AdminDonors = () => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const {
    totalCount,
    activeDonorsCount,
    totalRaised,
    donors,
    isLoading,
    totalPages,
    itemsPerPage,
    isLoadingTotal,
    isLoadingActive,
    isLoadingRaised
  } = useAdminDonorsData(currentPage);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading donors...</div>
      </div>
    );
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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

        <DonorStatsCards 
          totalCount={totalCount || 0}
          activeDonorsCount={activeDonorsCount || 0}
          totalRaised={totalRaised || 0}
          isLoadingTotal={isLoadingTotal}
          isLoadingActive={isLoadingActive}
          isLoadingRaised={isLoadingRaised}
        />

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              All Donors (Page {currentPage} of {totalPages})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DonorTable donors={donors || []} />
            
            <DonorPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount || 0}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDonors;
