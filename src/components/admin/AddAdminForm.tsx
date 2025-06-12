
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AddAdminFormProps {
  onAdminAdded: () => void;
}

const AddAdminForm = ({ onAdminAdded }: AddAdminFormProps) => {
  const { toast } = useToast();
  const [newAdminEmail, setNewAdminEmail] = useState("");

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
  );
};

export default AddAdminForm;
