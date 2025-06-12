
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAuth } from "@/contexts/AuthContext";
import { useSuperAdminCheck } from "@/hooks/useSuperAdminCheck";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, UserPlus, Shield, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AdminUser {
  user_id: string;
  is_super_admin: boolean;
  is_content_manager: boolean;
  created_at: string;
  email?: string;
}

// Type for the get_admin_users function response
interface GetAdminUsersResponse {
  user_id: string;
  is_super_admin: boolean;
  is_content_manager: boolean;
  created_at: string;
  updated_at: string;
}

const AdminManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useAdminCheck();
  const { data: isSuperAdmin, isLoading: superAdminLoading } = useSuperAdminCheck();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!adminLoading && !isAdmin && user) {
      navigate('/');
    } else if (!superAdminLoading && !isSuperAdmin && user && isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin, isSuperAdmin, authLoading, adminLoading, superAdminLoading, navigate]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdmins();
    }
  }, [isSuperAdmin]);

  const debugQuery = async () => {
    try {
      console.log('Starting debug query...');
      
      // Test the new security definer function
      const { data: functionTest, error: functionError } = await supabase
        .rpc('check_user_is_super_admin', { user_uuid: user?.id });
      
      console.log('Security function test:', { functionTest, functionError });
      
      // Test the new get_admin_users function
      const { data: adminUsers, error: adminError } = await supabase
        .rpc('get_admin_users');
      
      console.log('Get admin users result:', { adminUsers, adminError });
      
      setDebugInfo(`
        Function test: ${functionError ? `Error: ${functionError.message}` : `Result: ${functionTest}`}
        Admin users: ${adminError ? `Error: ${adminError.message}` : `Success: Found ${Array.isArray(adminUsers) ? adminUsers.length : 0} admins`}
        Current user ID: ${user?.id}
      `);
      
    } catch (error) {
      console.error('Debug query failed:', error);
      setDebugInfo(`Debug failed: ${error}`);
    }
  };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      console.log('Fetching admins using new function...');
      
      const { data: adminData, error } = await supabase
        .rpc('get_admin_users');

      console.log('Fetch admins result:', { adminData, error });

      if (error) {
        console.error('Error fetching admins:', error);
        throw error;
      }

      console.log('Successfully fetched admin users:', adminData);
      
      const adminsWithDisplayData = (Array.isArray(adminData) ? adminData : []).map((admin: GetAdminUsersResponse) => ({
        ...admin,
        email: 'Email not available'
      }));

      setAdmins(adminsWithDisplayData);
    } catch (error: any) {
      console.error('Error in fetchAdmins:', error);
      toast({
        title: "Error",
        description: `Failed to fetch admin users: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addAdmin = async () => {
    if (!newAdminEmail.trim()) return;

    try {
      const { error } = await supabase.rpc('add_admin_by_email', {
        admin_email: newAdminEmail.trim()
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Admin access granted to ${newAdminEmail}`,
      });

      setNewAdminEmail("");
      fetchAdmins();
    } catch (error: any) {
      console.error('Error adding admin:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add admin",
        variant: "destructive",
      });
    }
  };

  const removeAdmin = async (userId: string, email: string) => {
    if (userId === user?.id) {
      toast({
        title: "Error",
        description: "You cannot remove yourself as an admin",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Admin access removed from ${email}`,
      });

      fetchAdmins();
    } catch (error) {
      console.error('Error removing admin:', error);
      toast({
        title: "Error",
        description: "Failed to remove admin",
        variant: "destructive",
      });
    }
  };

  if (authLoading || adminLoading || superAdminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin || !isSuperAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-foreground">Admin Management</h1>
          <p className="text-muted-foreground">Manage admin users and their permissions</p>
        </div>

        <div className="grid gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={debugQuery} className="mb-4">
                Run Debug Query
              </Button>
              {debugInfo && (
                <pre className="bg-muted p-4 rounded text-sm whitespace-pre-wrap">
                  {debugInfo}
                </pre>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <UserPlus className="h-5 w-5 text-primary" />
                Add New Admin
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Grant admin access to existing users by their email address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Enter user email address"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addAdmin()}
                />
                <Button onClick={addAdmin} disabled={!newAdminEmail.trim()}>
                  Add Admin
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Shield className="h-5 w-5 text-primary" />
                Current Admins
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage existing admin users and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading admin users...</div>
              ) : admins.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No admin users found</div>
              ) : (
                <div className="space-y-4">
                  {admins.map((admin) => (
                    <div
                      key={admin.user_id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium">{admin.user_id}</div>
                          <div className="text-sm text-muted-foreground">
                            Added {new Date(admin.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {admin.is_super_admin && (
                            <Badge variant="default" className="flex items-center gap-1">
                              <ShieldCheck className="h-3 w-3" />
                              Super Admin
                            </Badge>
                          )}
                          {admin.is_content_manager && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              Content Manager
                            </Badge>
                          )}
                          {!admin.is_super_admin && !admin.is_content_manager && (
                            <Badge variant="outline">Admin</Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeAdmin(admin.user_id, admin.user_id)}
                        disabled={admin.user_id === user?.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
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

export default AdminManagement;
