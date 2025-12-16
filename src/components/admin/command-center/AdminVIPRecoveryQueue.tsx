import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Link, Mail, ChevronRight } from "lucide-react";
import { useAdminVIPRecoveryQueue } from "@/hooks/useAdminVIPRecoveryQueue";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const TierBadge = ({ tier }: { tier: string }) => {
  const styles = {
    '10k+': 'bg-destructive/20 text-destructive border-destructive/40 font-bold',
    '5k+': 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    '1k+': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    '100+': 'bg-primary/20 text-primary border-primary/40',
  };
  
  return (
    <Badge variant="outline" className={cn(
      "rounded-sm text-xs",
      styles[tier as keyof typeof styles] || ''
    )}>
      ${tier}
    </Badge>
  );
};

export const AdminVIPRecoveryQueue = () => {
  const { data, isLoading } = useAdminVIPRecoveryQueue(100, 5);
  const navigate = useNavigate();

  const handleLinkAccount = (donorId: string) => {
    navigate(`/admin/donor/${donorId}`);
  };

  const handleSendInvite = (email: string) => {
    navigate('/admin/dashboard?section=utilities');
  };

  return (
    <div className="lcars-frame lcars-frame-top bg-card">
      {/* LCARS Table Header with endcaps */}
      <div className="lcars-table-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown className="h-5 w-5" />
          <span>VIP Recovery Queue</span>
        </div>
        {data?.total && data.total > 0 && (
          <Badge className="bg-background/20 text-primary-foreground border-none font-bold">
            {data.total} unlinked
          </Badge>
        )}
      </div>
      
      {/* Table content */}
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 p-3">
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-32 mb-1" />
                  <div className="h-3 bg-muted rounded w-48" />
                </div>
                <div className="h-6 bg-muted rounded w-16" />
              </div>
            ))}
          </div>
        ) : data?.donors && data.donors.length > 0 ? (
          <>
            <div className="space-y-1">
              {data.donors.map((donor, index) => (
                <div
                  key={donor.id}
                  className={cn(
                    "lcars-table-row relative flex items-center gap-3 p-3",
                    index === 0 && donor.tier === '10k+' && "bg-destructive/5"
                  )}
                >
                  {/* Priority indicator */}
                  <div className={cn(
                    "w-1.5 h-full absolute left-0 top-0 bottom-0",
                    donor.tier === '10k+' && "bg-destructive",
                    donor.tier === '5k+' && "bg-orange-500",
                    donor.tier === '1k+' && "bg-yellow-500",
                    donor.tier === '100+' && "bg-primary",
                  )} />
                  
                  <div className="flex-1 min-w-0 pl-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground truncate">{donor.name}</span>
                      <TierBadge tier={donor.tier} />
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{donor.email}</p>
                    <p className="text-xs text-muted-foreground/70">
                      <span className="font-bold text-foreground">${donor.totalDonated.toLocaleString()}</span>
                      {' '}• {donor.pledgeCount} pledges
                    </p>
                  </div>
                  
                  {/* Action buttons - LCARS half-pills */}
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => handleLinkAccount(donor.id)}
                      className="lcars-btn-pill-l h-9 px-3 text-xs"
                      title="Link Account"
                    >
                      <Link className="h-3.5 w-3.5 mr-1" />
                      Link
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSendInvite(donor.email)}
                      className="lcars-btn-pill-r h-9 px-3 text-xs"
                      title="Send Invite"
                    >
                      <Mail className="h-3.5 w-3.5 mr-1" />
                      Invite
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Footer link */}
            <Button
              variant="ghost"
              className="w-full mt-4 text-primary hover:text-primary justify-center gap-2"
              onClick={() => navigate('/admin/dashboard?section=donor-management')}
            >
              View All {data.total} Unlinked Donors
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Crown className="h-10 w-10 mx-auto mb-2 opacity-40 text-yellow-500" />
            <p className="text-sm font-medium">All VIP donors are linked!</p>
          </div>
        )}
      </div>
    </div>
  );
};
