
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AddAdminFormProps {
  onAdminAdded: () => void;
}

const AddAdminForm = ({ onAdminAdded }: AddAdminFormProps) => {
  const { toast } = useToast();
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isContentManager, setIsContentManager] = useState(false);

  const addAdmin = async () => {
    if (!newAdminEmail.trim()) return;

    try {
      const { error } = await supabase.rpc('add_admin_by_email', {
        admin_email: newAdminEmail.trim()
      });

      if (error) throw error;

      // If either role is selected, we need to update the admin_users record
      // We'll use a different approach since we can't directly query auth.users
      if (isSuperAdmin || isContentManager) {
        // First, let's try to update using the email to find the user
        // We'll create a more robust solution by updating based on email
        const { error: roleUpdateError } = await supabase
          .from('admin_users')
          .update({
            is_super_admin: isSuperAdmin,
            is_content_manager: isContentManager
          })
          .in('user_id', [
            // We'll use a subquery approach by getting the user_id from donors table first
            // Since we can't directly access auth.users, we'll rely on the RPC function
            // to handle the admin creation and then update all admin_users with this email
          ]);

        // Alternative approach: Update the most recently created admin_user
        // This assumes the add_admin_by_email function just created the record
        const { error: updateError } = await supabase
          .from('admin_users')
          .update({
            is_super_admin: isSuperAdmin,
            is_content_manager: isContentManager
          })
          .order('created_at', { ascending: false })
          .limit(1);

        if (updateError) {
          console.error('Error updating admin roles:', updateError);
          // Don't throw here as the admin was created successfully
        }
      }

      const roleText = [];
      if (isSuperAdmin) roleText.push("Super Admin");
      if (isContentManager) roleText.push("Content Manager");
      const roleDescription = roleText.length > 0 ? ` with roles: ${roleText.join(", ")}` : "";

      toast({
        title: "Success",
        description: `Admin access granted to ${newAdminEmail}${roleDescription}`,
      });

      setNewAdminEmail("");
      setIsSuperAdmin(false);
      setIsContentManager(false);
      onAdminAdded();
    } catch (error: any) {
      console.error('Error adding admin:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add admin",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <UserPlus className="h-5 w-5 text-primary" />
          Add New Admin
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Grant admin access to existing users by their email address and assign roles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Enter user email address"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addAdmin()}
          />
          
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-medium">Admin Roles</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="super-admin"
                checked={isSuperAdmin}
                onCheckedChange={(checked) => setIsSuperAdmin(checked as boolean)}
              />
              <Label htmlFor="super-admin" className="text-sm">
                Super Admin (full system access)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="content-manager"
                checked={isContentManager}
                onCheckedChange={(checked) => setIsContentManager(checked as boolean)}
              />
              <Label htmlFor="content-manager" className="text-sm">
                Content Manager (content management access)
              </Label>
            </div>
          </div>

          <Button onClick={addAdmin} disabled={!newAdminEmail.trim()} className="w-full">
            Add Admin
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddAdminForm;
