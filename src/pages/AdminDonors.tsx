
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDonors = () => {
  const { data: donors, isLoading } = useQuery({
    queryKey: ['admin-donors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('donors')
        .select(`
          *,
          pledges (amount)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Calculate total pledges for each donor
      const donorsWithTotals = data.map(donor => ({
        ...donor,
        totalPledges: donor.pledges?.reduce((sum: number, pledge: any) => sum + Number(pledge.amount), 0) || 0,
        pledgeCount: donor.pledges?.length || 0
      }));
      
      return donorsWithTotals;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-axanar-dark flex items-center justify-center">
        <div className="text-white">Loading donors...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-axanar-dark text-white">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/admin" className="inline-flex items-center text-axanar-teal hover:text-axanar-teal/80 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-4">Manage Donors</h1>
          <p className="text-axanar-silver">View and manage donor information</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-axanar-light border-axanar-silver/20">
            <CardHeader>
              <CardTitle className="text-white">Total Donors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-axanar-teal">{donors?.length || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-axanar-light border-axanar-silver/20">
            <CardHeader>
              <CardTitle className="text-white">Active Donors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">
                {donors?.filter(donor => donor.pledgeCount > 0).length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-axanar-light border-axanar-silver/20">
            <CardHeader>
              <CardTitle className="text-white">Total Raised</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-axanar-teal">
                ${donors?.reduce((sum, donor) => sum + donor.totalPledges, 0).toFixed(2) || '0.00'}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-axanar-light border-axanar-silver/20">
          <CardHeader>
            <CardTitle className="text-white">All Donors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-axanar-silver/20">
                    <TableHead className="text-axanar-silver">Name</TableHead>
                    <TableHead className="text-axanar-silver">Email</TableHead>
                    <TableHead className="text-axanar-silver">Pledges</TableHead>
                    <TableHead className="text-axanar-silver">Total Donated</TableHead>
                    <TableHead className="text-axanar-silver">Status</TableHead>
                    <TableHead className="text-axanar-silver">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donors?.map((donor) => (
                    <TableRow key={donor.id} className="border-axanar-silver/20">
                      <TableCell className="text-white">
                        {donor.first_name && donor.last_name 
                          ? `${donor.first_name} ${donor.last_name}`
                          : donor.full_name || donor.donor_name || 'Unknown'
                        }
                      </TableCell>
                      <TableCell className="text-white">{donor.email}</TableCell>
                      <TableCell className="text-white">{donor.pledgeCount}</TableCell>
                      <TableCell className="text-white">${donor.totalPledges.toFixed(2)}</TableCell>
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
                      <TableCell className="text-white">
                        {new Date(donor.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDonors;
