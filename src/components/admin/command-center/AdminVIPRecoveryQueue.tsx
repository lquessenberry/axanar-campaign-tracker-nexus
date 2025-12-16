import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Link, Mail, ChevronRight } from "lucide-react";
import { useAdminVIPRecoveryQueue } from "@/hooks/useAdminVIPRecoveryQueue";
import { useNavigate } from "react-router-dom";

const TierBadge = ({ tier }: { tier: string }) => {
  const styles = {
    '10k+': 'bg-destructive/10 text-destructive border-destructive/30',
    '5k+': 'bg-orange-500/10 text-orange-500 border-orange-500/30',
    '1k+': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
    '100+': 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  };
  
  return (
    <Badge variant="outline" className={styles[tier as keyof typeof styles] || ''}>
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
    // For now, navigate to utilities where bulk invite tool exists
    navigate('/admin/dashboard?section=utilities');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Crown className="h-5 w-5 text-yellow-500" />
          VIP Recovery Queue
          {data?.total && data.total > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {data.total} unlinked
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4">
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
            <div className="space-y-2">
              {data.donors.map(donor => (
                <div
                  key={donor.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{donor.name}</span>
                      <TierBadge tier={donor.tier} />
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{donor.email}</p>
                    <p className="text-xs text-muted-foreground">
                      ${donor.totalDonated.toLocaleString()} • {donor.pledgeCount} pledges
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleLinkAccount(donor.id)}
                      className="h-8 w-8 p-0"
                      title="Link Account"
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSendInvite(donor.email)}
                      className="h-8 w-8 p-0"
                      title="Send Invite"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              className="w-full mt-3 text-primary hover:text-primary"
              onClick={() => navigate('/admin/dashboard?section=donor-management')}
            >
              View All {data.total} Unlinked Donors
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Crown className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">All VIP donors are linked!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
