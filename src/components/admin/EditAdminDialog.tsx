
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AdminUser } from "@/types/admin";

interface EditAdminDialogProps {
  admin: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onAdminUpdated: () => void;
}

const EditAdminDialog = ({ admin, isOpen, onClose, onAdminUpdated }: EditAdminDialogProps) => {
  const { toast } = useToast();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isContentManager, setIsContentManager] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Update state when admin changes
  useEffect(() => {
    if (admin) {
      setIsSuperAdmin(admin.is_super_admin);
      setIsContentManager(admin.is_content_manager);
    }
  }, [admin]);

  const handleSave = async () => {
    if (!admin) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase.rpc('update_admin_user', {
        target_user_id: admin.user_id,
        make_super_admin: isSuperAdmin,
        make_content_manager: isContentManager
      });

      if (error) throw error;

      const roleText = [];
      if (isSuperAdmin) roleText.push("Super Admin");
      if (isContentManager) roleText.push("Content Manager");
      const roleDescription = roleText.length > 0 ? ` with roles: ${roleText.join(", ")}` : " with no special roles";

      toast({
        title: "Success",
        description: `Admin roles updated for ${admin.email}${roleDescription}`,
      });

      onAdminUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error updating admin roles:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update admin roles",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Admin Roles</DialogTitle>
          <DialogDescription>
            Update the roles for {admin?.email}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-super-admin"
              checked={isSuperAdmin}
              onCheckedChange={(checked) => setIsSuperAdmin(checked as boolean)}
            />
            <Label htmlFor="edit-super-admin" className="text-sm">
              Super Admin (full system access)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-content-manager"
              checked={isContentManager}
              onCheckedChange={(checked) => setIsContentManager(checked as boolean)}
            />
            <Label htmlFor="edit-content-manager" className="text-sm">
              Content Manager (content management access)
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditAdminDialog;
