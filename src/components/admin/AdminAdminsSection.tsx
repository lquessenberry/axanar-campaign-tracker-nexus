import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSuperAdminCheck } from "@/hooks/useSuperAdminCheck";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AdminUser } from "@/types/admin";
import DebugPanel from "@/components/admin/DebugPanel";
import AddAdminForm from "@/components/admin/AddAdminForm";
import AdminList from "@/components/admin/AdminList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AdminAdminsSection = () => {
  const { user } = useAuth();
  const { data: isSuperAdmin, isLoading: superAdminLoading } = useSuperAdminCheck();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);

  // Define fetchAdmins with useCallback to prevent re-creation on every render
  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      // Call the RPC function without type parameters
      const { data: adminData, error } = await supabase.rpc('get_admin_users');

      if (error) {
        console.error('Error fetching admins:', error);
        throw error;
      }
      
      if (Array.isArray(adminData)) {
        setAdmins(adminData);
      } else {
        setAdmins([]);
      }
    } catch (error: unknown) {
      console.error('Error in fetchAdmins:', error);
      toast({
        title: "Error",
        description: `Failed to fetch admin users: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Redirect non-super admins to admin dashboard
  useEffect(() => {
    if (!superAdminLoading && !isSuperAdmin && user) {
      navigate('/admin');
      toast({
        title: "Access Denied",
        description: "Only super admins can access this page",
        variant: "destructive",
      });
    }
  }, [isSuperAdmin, superAdminLoading, user, navigate, toast]);

  // Fetch admins when component mounts or when isSuperAdmin changes
  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdmins();
    }
  }, [isSuperAdmin, fetchAdmins]);

  if (superAdminLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin Management</CardTitle>
          <CardDescription>Manage admin users and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isSuperAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin Management</CardTitle>
          <CardDescription>Access denied</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">Only super admins can access this section.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Management</CardTitle>
        <CardDescription>Manage admin users and their permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <DebugPanel />
          <AddAdminForm onAdminAdded={fetchAdmins} />
          <AdminList 
            admins={admins}
            loading={loading}
            currentUserId={user?.id || ''}
            onAdminRemoved={fetchAdmins}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminAdminsSection;
