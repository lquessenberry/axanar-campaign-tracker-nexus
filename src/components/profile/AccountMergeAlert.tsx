import React, { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const AccountMergeAlert: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [oldEmail, setOldEmail] = useState("");
  const [isMerging, setIsMerging] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleMerge = async () => {
    if (!user || !oldEmail) {
      toast.error("Please enter the email of your old account");
      return;
    }

    setIsMerging(true);
    try {
      const { data, error } = await supabase.rpc('merge_donor_accounts', {
        p_source_email: oldEmail,
        p_target_auth_user_id: user.id
      });

      if (error) throw error;

      const result = data[0];
      
      if (result.success) {
        toast.success(result.message);
        
        // Invalidate all relevant queries to refresh the UI
        queryClient.invalidateQueries({ queryKey: ['ambassadorial-titles', user.id] });
        queryClient.invalidateQueries({ queryKey: ['user-rewards'] });
        queryClient.invalidateQueries({ queryKey: ['user-pledges'] });
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        queryClient.invalidateQueries({ queryKey: ['user-campaigns'] });
        
        setOldEmail("");
        setShowConfirm(false);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error('Error merging accounts:', error);
      toast.error(error.message || "Failed to merge accounts");
    } finally {
      setIsMerging(false);
    }
  };

  if (!showConfirm) {
    return (
      <Alert className="border-blue-500/50 bg-blue-500/10">
        <AlertCircle className="h-4 w-4 text-blue-500" />
        <AlertTitle className="text-blue-700 dark:text-blue-400">
          Have an old account to merge?
        </AlertTitle>
        <AlertDescription className="text-blue-600/90 dark:text-blue-400/90">
          <p className="mb-3">
            If you previously contributed using a different email address and no longer have access to it, you can merge that account into your current one.
          </p>
          <Button
            onClick={() => setShowConfirm(true)}
            size="sm"
            variant="outline"
            className="bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/50"
          >
            Merge Old Account
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-amber-500/50 bg-amber-500/10">
      <AlertCircle className="h-4 w-4 text-amber-500" />
      <AlertTitle className="text-amber-700 dark:text-amber-400">
        Merge Old Account
      </AlertTitle>
      <AlertDescription className="text-amber-600/90 dark:text-amber-400/90">
        <p className="mb-4">
          <strong>Important:</strong> This will transfer all pledges, ambassadorial titles, and profile data from your old account to this one. The old account will be marked as deleted.
        </p>
        
        <div className="space-y-3">
          <div>
            <Label htmlFor="old-email" className="text-xs text-amber-700 dark:text-amber-300">
              Enter the email address of your old account
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="old-email"
                type="email"
                placeholder="your-old-email@example.com"
                value={oldEmail}
                onChange={(e) => setOldEmail(e.target.value)}
                className="bg-background"
              />
              <Button
                onClick={handleMerge}
                disabled={isMerging || !oldEmail}
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-white min-w-24"
              >
                {isMerging ? "Merging..." : "Merge"}
              </Button>
              <Button
                onClick={() => {
                  setShowConfirm(false);
                  setOldEmail("");
                }}
                disabled={isMerging}
                size="sm"
                variant="ghost"
              >
                Cancel
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-amber-600/80 dark:text-amber-400/80 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
            This action is irreversible. Make sure you enter the correct email address.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};
