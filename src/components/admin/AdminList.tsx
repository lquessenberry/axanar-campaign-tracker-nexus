
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminUser } from "@/types/admin";
import AdminUserCard from "./AdminUserCard";
import EditAdminDialog from "./EditAdminDialog";

interface AdminListProps {
  admins: AdminUser[];
  loading: boolean;
  currentUserId: string | undefined;
  onAdminRemoved: () => void;
}

const AdminList = ({ admins, loading, currentUserId, onAdminRemoved }: AdminListProps) => {
  const { toast } = useToast();
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const removeAdmin = async (userId: string, email: string) => {
    if (userId === currentUserId) {
      toast({
        title: "Error",
        description: "You cannot remove yourself as an admin",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await (supabase.rpc as any)('remove_admin_user', {
        target_user_id: userId
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Admin access removed from ${email}`,
      });

      onAdminRemoved();
    } catch (error: any) {
      console.error('Error removing admin:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove admin",
        variant: "destructive",
      });
    }
  };

  const handleEditAdmin = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingAdmin(null);
  };

  return (
    <>
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
                <AdminUserCard
                  key={admin.user_id}
                  admin={admin}
                  currentUserId={currentUserId}
                  onRemove={removeAdmin}
                  onEdit={handleEditAdmin}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <EditAdminDialog
        admin={editingAdmin}
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        onAdminUpdated={onAdminRemoved}
      />
    </>
  );
};

export default AdminList;
