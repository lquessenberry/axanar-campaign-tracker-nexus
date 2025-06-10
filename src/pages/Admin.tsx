
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Gift, DollarSign, Settings, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useAdminCheck();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!adminLoading && !isAdmin && user) {
      navigate('/');
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-axanar-dark flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-axanar-dark text-white">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-axanar-silver">Manage your platform data and settings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-axanar-light border-axanar-silver/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <DollarSign className="h-5 w-5 text-axanar-teal" />
                Manage Pledges
              </CardTitle>
              <CardDescription className="text-axanar-silver">
                View, edit, and manage all campaign pledges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/pledges">
                <Button className="w-full bg-axanar-teal hover:bg-axanar-teal/90">
                  Manage Pledges
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-axanar-light border-axanar-silver/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Gift className="h-5 w-5 text-axanar-teal" />
                Manage Rewards
              </CardTitle>
              <CardDescription className="text-axanar-silver">
                Create and manage campaign rewards/perks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/rewards">
                <Button className="w-full bg-axanar-teal hover:bg-axanar-teal/90">
                  Manage Rewards
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-axanar-light border-axanar-silver/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-axanar-teal" />
                Manage Donors
              </CardTitle>
              <CardDescription className="text-axanar-silver">
                View and manage donor information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/donors">
                <Button className="w-full bg-axanar-teal hover:bg-axanar-teal/90">
                  Manage Donors
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-axanar-light border-axanar-silver/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="h-5 w-5 text-axanar-teal" />
                Campaign Stats
              </CardTitle>
              <CardDescription className="text-axanar-silver">
                View campaign performance and statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/stats">
                <Button className="w-full bg-axanar-teal hover:bg-axanar-teal/90">
                  View Statistics
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-axanar-light border-axanar-silver/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Settings className="h-5 w-5 text-axanar-teal" />
                Platform Settings
              </CardTitle>
              <CardDescription className="text-axanar-silver">
                Configure platform-wide settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/settings">
                <Button className="w-full bg-axanar-teal hover:bg-axanar-teal/90">
                  Platform Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
