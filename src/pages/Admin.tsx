
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Gift, DollarSign, Settings, BarChart3, UserCog } from "lucide-react";
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your platform data and settings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-card border-border md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <BarChart3 className="h-5 w-5 text-primary" />
                Unified Admin Dashboard
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Access all admin features in one comprehensive interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/dashboard">
                <Button className="w-full" size="lg">
                  Open Admin Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <DollarSign className="h-5 w-5 text-primary" />
                Manage Pledges
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                View, edit, and manage all campaign pledges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/pledges">
                <Button className="w-full">
                  Manage Pledges
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Gift className="h-5 w-5 text-primary" />
                Manage Rewards
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Create and manage campaign rewards/perks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/rewards">
                <Button className="w-full">
                  Manage Rewards
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Users className="h-5 w-5 text-primary" />
                Manage Donors
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                View and manage donor information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/donors">
                <Button className="w-full">
                  Manage Donors
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <UserCog className="h-5 w-5 text-primary" />
                Manage Admins
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Add, remove, and manage admin users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/admins">
                <Button className="w-full">
                  Manage Admins
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <BarChart3 className="h-5 w-5 text-primary" />
                Campaign Stats
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                View campaign performance and statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/stats">
                <Button className="w-full">
                  View Statistics
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Settings className="h-5 w-5 text-primary" />
                Platform Settings
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Configure platform-wide settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/settings">
                <Button className="w-full">
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
