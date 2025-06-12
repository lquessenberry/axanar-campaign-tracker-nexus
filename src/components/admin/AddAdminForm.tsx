
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
      if (isSuperAdmin || isContentManager) {
        const { error: updateError } = await supabase
          .from('admin_users')
          .update({
            is_super_admin: isSuperAdmin,
            is_content_manager: isContentManager
          })
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

        // Actually, we need to get the newly created admin's user_id first
        const { data: authUser, error: authError } = await supabase
          .from('auth.users')
          .select('id')
          .eq('email', newAdminEmail.trim())
          .single();

        if (!authError && authUser) {
          const { error: roleUpdateError } = await supabase
            .from('admin_users')
            .update({
              is_super_admin: isSuperAdmin,
              is_content_manager: isContentManager
            })
            .eq('user_id', authUser.id);

          if (roleUpdateError) {
            console.error('Error updating admin roles:', roleUpdateError);
          }
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
