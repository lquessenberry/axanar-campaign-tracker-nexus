
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAuth } from "@/contexts/AuthContext";
import { useSuperAdminCheck } from "@/hooks/useSuperAdminCheck";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AdminUser } from "@/types/admin";
import DebugPanel from "@/components/admin/DebugPanel";
import AddAdminForm from "@/components/admin/AddAdminForm";
import AdminList from "@/components/admin/AdminList";

const AdminManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useAdminCheck();
  const { data: isSuperAdmin, isLoading: superAdminLoading } = useSuperAdminCheck();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);

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

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      console.log('Fetching admins using get_admin_users function...');
      
      const { data: adminData, error } = await supabase
        .rpc('get_admin_users');

      console.log('Fetch admins result:', { adminData, error });

      if (error) {
        console.error('Error fetching admins:', error);
        throw error;
      }

      console.log('Successfully fetched admin users:', adminData);
      
      if (Array.isArray(adminData)) {
        setAdmins(adminData as AdminUser[]);
      } else {
        setAdmins([]);
      }
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
          <DebugPanel />
          <AddAdminForm onAdminAdded={fetchAdmins} />
          <AdminList 
            admins={admins}
            loading={loading}
            currentUserId={user?.id}
            onAdminRemoved={fetchAdmins}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminManagement;
