
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AddAdminFormProps {
  onAdminAdded: () => void;
}

const AddAdminForm = ({ onAdminAdded }: AddAdminFormProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isContentManager, setIsContentManager] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    try {
      console.log('Adding admin user:', { email, isSuperAdmin, isContentManager });
      
      const { error } = await supabase.rpc('add_admin_by_email', {
        target_email: email.trim(),
        make_super_admin: isSuperAdmin,
        make_content_manager: isContentManager
      });

      if (error) throw error;

      const roleText = [];
      if (isSuperAdmin) roleText.push("Super Admin");
      if (isContentManager) roleText.push("Content Manager");
      const roleDescription = roleText.length > 0 ? ` with roles: ${roleText.join(", ")}` : " with basic admin access";

      toast({
        title: "Success",
        description: `Admin access granted to ${email}${roleDescription}`,
      });

      // Reset form
      setEmail("");
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
    } finally {
      setIsAdding(false);
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
          Grant admin access to a user by their email address
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email Address</Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="Enter user's email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
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

          <Button type="submit" disabled={isAdding} className="w-full">
            {isAdding ? "Adding Admin..." : "Add Admin"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddAdminForm;
