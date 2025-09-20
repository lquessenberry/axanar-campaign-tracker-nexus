import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserRewards } from "@/hooks/useUserRewards";
import { Gift, Calendar, DollarSign } from "lucide-react";

interface RewardsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RewardsDialog: React.FC<RewardsDialogProps> = ({ open, onOpenChange }) => {
  const { data: pledges, isLoading } = useUserRewards();

  const totalPledged = pledges?.reduce((sum, pledge) => sum + Number(pledge.amount), 0) || 0;
  const rewardCount = pledges?.filter(pledge => pledge.reward).length || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Your Perks & Rewards
          </DialogTitle>
          <DialogDescription>
            Track your pledges and rewards across all campaigns
          </DialogDescription>
        </DialogHeader>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{pledges?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Total Pledges</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">${totalPledged.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total Pledged</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{rewardCount}</div>
              <div className="text-sm text-muted-foreground">Rewards Earned</div>
            </CardContent>
          </Card>
        </div>
        
        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !pledges || pledges.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pledges found. Start supporting campaigns to earn rewards!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pledges.map((pledge) => (
                <Card key={pledge.id} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{pledge.campaign.name}</CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${Number(pledge.amount).toFixed(2)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {(() => {
                              // Use pledge.created_at if valid, otherwise fallback to source_contribution_date
                              const pledgeDate = pledge.created_at && pledge.created_at !== null 
                                ? new Date(pledge.created_at) 
                                : pledge.source_contribution_date 
                                  ? new Date(pledge.source_contribution_date)
                                  : null;
                              
                              // Check if date is valid (not epoch date)
                              if (!pledgeDate || pledgeDate.getFullYear() <= 1970) {
                                return 'Date not available';
                              }
                              
                              return pledgeDate.toLocaleDateString();
                            })()}
                          </span>
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-primary/10">
                        Pledge
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  {pledge.reward && (
                    <CardContent className="pt-0">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Gift className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{pledge.reward.name}</span>
                          <Badge variant="secondary">
                            Reward Tier
                          </Badge>
                        </div>
                        {pledge.reward.description && (
                          <p className="text-sm text-muted-foreground">
                            {pledge.reward.description}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default RewardsDialog;