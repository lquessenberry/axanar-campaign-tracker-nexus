import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const MissingPledgeDataAlert: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [pledgeAmount, setPledgeAmount] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssignTitles = async () => {
    if (!user || !pledgeAmount || isNaN(Number(pledgeAmount))) {
      toast.error("Please enter a valid pledge amount");
      return;
    }

    setIsAssigning(true);
    try {
      const { data, error } = await supabase.rpc('assign_manual_ambassadorial_title', {
        p_user_id: user.id,
        p_pledge_amount: Number(pledgeAmount),
        p_campaign_id: null // Will use universal titles
      });

      if (error) throw error;

      toast.success(`Successfully assigned ${data[0].titles_assigned} title(s)!`);
      
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['ambassadorial-titles', user.id] });
      queryClient.invalidateQueries({ queryKey: ['user-rewards'] });
      
      setPledgeAmount("");
    } catch (error: any) {
      console.error('Error assigning titles:', error);
      toast.error(error.message || "Failed to assign titles");
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Alert className="border-yellow-500/50 bg-yellow-500/10">
      <AlertCircle className="h-4 w-4 text-yellow-500" />
      <AlertTitle className="text-yellow-700 dark:text-yellow-400">
        Missing Pledge Data?
      </AlertTitle>
      <AlertDescription className="text-yellow-600/90 dark:text-yellow-400/90">
        <p className="mb-4">
          If you've contributed but don't see your ambassadorial titles or perks, your historical pledge data may not have been migrated yet.
        </p>
        
        <div className="space-y-3">
          <div>
            <Label htmlFor="pledge-amount" className="text-xs text-yellow-700 dark:text-yellow-300">
              Enter your total pledge amount (USD)
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="pledge-amount"
                type="number"
                min="1"
                step="0.01"
                placeholder="2.00"
                value={pledgeAmount}
                onChange={(e) => setPledgeAmount(e.target.value)}
                className="max-w-32 bg-background"
              />
              <Button
                onClick={handleAssignTitles}
                disabled={isAssigning || !pledgeAmount}
                size="sm"
                variant="outline"
                className="bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/50"
              >
                {isAssigning ? "Assigning..." : "Assign My Titles"}
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-yellow-600/80 dark:text-yellow-400/80">
            This will create a placeholder pledge record and assign your ambassadorial titles. For full pledge history restoration, contact support.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};
