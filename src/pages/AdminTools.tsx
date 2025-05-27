import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, CheckCircle, Shield, UserCog, Link } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminTools() {
  const { user, isAdmin, donorProfile, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState<string>('lquessenberry@gmail.com'); // Default to your email
  const [donorEmail, setDonorEmail] = useState<string>('lee@bbqberry.com'); // Default to your donor email

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin && user) {
      toast({
        title: 'Access Denied',
        description: 'You need administrator privileges to access this page.',
        variant: 'destructive',
      });
      navigate('/');
    }

    // Load admin users
    loadAdminUsers();
  }, [isAdmin, user, navigate]);

  const loadAdminUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_admin', true);

      if (error) throw error;
      setAdminUsers(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load admin users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const grantAdminAccess = async () => {
    try {
      setLoading(true);
      
      // Find user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (userError) {
        if (userError.code === 'PGRST116') {
          toast({
            title: 'User Not Found',
            description: `No user found with email ${userEmail}`,
            variant: 'destructive',
          });
        } else {
          throw userError;
        }
        return;
      }

      // Grant admin access
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', userData.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Admin access granted to ${userEmail}`,
      });

      // Reload admin users
      loadAdminUsers();
      
      // If this is for the current user, refresh their profile
      if (user?.email === userEmail) {
        await refreshUserProfile();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to grant admin access',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const linkDonorProfile = async () => {
    try {
      setLoading(true);
      
      // Find user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (userError) {
        if (userError.code === 'PGRST116') {
          toast({
            title: 'User Not Found',
            description: `No user found with email ${userEmail}`,
            variant: 'destructive',
          });
        } else {
          throw userError;
        }
        return;
      }

      // Find donor by email
      const { data: donorData, error: donorError } = await supabase
        .from('donor_profiles')
        .select('id')
        .eq('email', donorEmail)
        .single();

      if (donorError) {
        if (donorError.code === 'PGRST116') {
          toast({
            title: 'Donor Not Found',
            description: `No donor found with email ${donorEmail}`,
            variant: 'destructive',
          });
        } else {
          throw donorError;
        }
        return;
      }

      // Link user to donor profile
      const { error } = await supabase
        .from('profiles')
        .update({ donor_profile_id: donorData.id })
        .eq('id', userData.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `User ${userEmail} linked to donor profile ${donorEmail}`,
      });
      
      // If this is for the current user, refresh their profile
      if (user?.email === userEmail) {
        await refreshUserProfile();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to link donor profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Emergency grant admin access to yourself
  const emergencyAdminAccess = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        toast({
          title: 'Not Logged In',
          description: 'You must be logged in to use this feature',
          variant: 'destructive',
        });
        return;
      }
      
      // Grant admin access directly using user ID
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Emergency Access Granted',
        description: 'You now have admin access. Please refresh the page.',
      });
      
      await refreshUserProfile();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to grant emergency access',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>You must be logged in to access admin tools.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Admin Tools</CardTitle>
          <CardDescription>
            Manage user permissions and system settings
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="user-admin">
        <TabsList className="mb-4">
          <TabsTrigger value="user-admin">User Administration</TabsTrigger>
          <TabsTrigger value="donor-linking">Donor Linking</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Access</TabsTrigger>
        </TabsList>
        
        <TabsContent value="user-admin">
          <Card>
            <CardHeader>
              <CardTitle>Grant Admin Access</CardTitle>
              <CardDescription>Give a user administrator privileges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">User Email</Label>
                  <Input
                    id="admin-email"
                    placeholder="user@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={grantAdminAccess} disabled={loading}>
                <Shield className="mr-2 h-4 w-4" />
                Grant Admin Access
              </Button>
            </CardFooter>
          </Card>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Current Admin Users</h3>
            {adminUsers.length > 0 ? (
              <div className="space-y-2">
                {adminUsers.map((admin) => (
                  <div key={admin.id} className="p-3 bg-muted rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                      <UserCog className="mr-2 h-4 w-4" />
                      <span>{admin.email || admin.id}</span>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No admin users found</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="donor-linking">
          <Card>
            <CardHeader>
              <CardTitle>Link User to Donor Profile</CardTitle>
              <CardDescription>Connect an authenticated user to their donor profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-email">User Email</Label>
                  <Input
                    id="user-email"
                    placeholder="user@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="donor-email">Donor Email</Label>
                  <Input
                    id="donor-email"
                    placeholder="donor@example.com"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={linkDonorProfile} disabled={loading}>
                <Link className="mr-2 h-4 w-4" />
                Link Profiles
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="emergency">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Admin Access</CardTitle>
              <CardDescription>Grant yourself admin access if you're locked out</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 text-orange-500">
                <AlertCircle className="h-5 w-5" />
                <p>Use this only if you are locked out of the admin section and need emergency access.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="destructive" onClick={emergencyAdminAccess} disabled={loading}>
                <Shield className="mr-2 h-4 w-4" />
                Emergency Admin Access
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
