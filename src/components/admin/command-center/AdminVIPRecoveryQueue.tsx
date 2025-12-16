import { Button } from "@/components/ui/button";
import { Crown, Link, Mail, Users, ChevronRight } from "lucide-react";
import { useAdminOperationalAlerts } from "@/hooks/useAdminOperationalAlerts";
import { useAdminVIPRecoveryQueue } from "@/hooks/useAdminVIPRecoveryQueue";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const TierSummary = ({ 
  label, 
  count, 
  color 
}: { 
  label: string; 
  count: number; 
  color: string;
}) => (
  <div className={cn(
    "flex items-center gap-2 px-3 py-2 rounded-sm border-l-4",
    color
  )}>
    <span className="text-2xl font-bold">{count}</span>
    <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
  </div>
);

export const AdminVIPRecoveryQueue = () => {
  const { data: alerts } = useAdminOperationalAlerts();
  const {
    data: queueData,
    isLoading,
    isError,
    error,
  } = useAdminVIPRecoveryQueue(100, 8);
  const navigate = useNavigate();

  const handleLinkAccount = (donorId: string) => {
    navigate(`/admin/donor/${donorId}`);
  };

  const tiers = alerts?.unlinkedVIPs || { tier10k: 0, tier5k: 0, tier1k: 0, tier100: 0, total: 0 };

  return (
    <div className="bg-black/60 border border-primary/30 rounded-sm overflow-hidden">
      {/* Header */}
      <div className="bg-primary/90 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary-foreground" />
          <span className="font-bold text-primary-foreground uppercase tracking-wide">
            VIP Recovery Queue
          </span>
        </div>
        <span className="text-sm text-primary-foreground/80">
          {tiers.total.toLocaleString()} unlinked
        </span>
      </div>

      {/* Tier Summary Row */}
      <div className="grid grid-cols-4 gap-2 p-3 bg-black/40 border-b border-primary/20">
        <TierSummary
          label="$10K+"
          count={tiers.tier10k}
          color="border-destructive bg-destructive/10 text-destructive"
        />
        <TierSummary
          label="$5K+"
          count={tiers.tier5k}
          color="border-orange-500 bg-orange-500/10 text-orange-400"
        />
        <TierSummary
          label="$1K+"
          count={tiers.tier1k}
          color="border-yellow-500 bg-yellow-500/10 text-yellow-400"
        />
        <TierSummary
          label="$100+"
          count={tiers.tier100}
          color="border-primary bg-primary/10 text-primary"
        />
      </div>

      {/* Priority List */}
      <div className="p-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
          Highest Priority
        </p>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse h-12 bg-muted/20 rounded-sm" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-6 text-muted-foreground">
            <Crown className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">VIP list failed to load</p>
            <p className="text-xs mt-1 opacity-80">
              {(error as any)?.message ? String((error as any).message) : "Please refresh."}
            </p>
          </div>
        ) : queueData?.donors && queueData.donors.length > 0 ? (
          <div className="space-y-1">
            {queueData.donors.slice(0, 6).map((donor) => (
              <div
                key={donor.id}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-sm hover:bg-primary/10 transition-colors group cursor-pointer",
                  donor.tier === '10k+' && "bg-destructive/5 border-l-2 border-destructive",
                  donor.tier === '5k+' && "border-l-2 border-orange-500",
                  donor.tier === '1k+' && "border-l-2 border-yellow-500",
                  donor.tier === '100+' && "border-l-2 border-primary/50"
                )}
                onClick={() => handleLinkAccount(donor.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{donor.name}</span>
                    <span
                      className={cn(
                        "text-xs font-bold",
                        donor.tier === '10k+' && "text-destructive",
                        donor.tier === '5k+' && "text-orange-400",
                        donor.tier === '1k+' && "text-yellow-400",
                        donor.tier === '100+' && "text-primary"
                      )}
                    >
                      ${donor.totalDonated.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{donor.email}</p>
                </div>

                <Link className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            ))}
          </div>
        ) : tiers.total > 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Crown className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No VIP donors loaded</p>
            <p className="text-xs mt-1 opacity-80">(Counts show unlinked VIPs exist; refresh.)</p>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Crown className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">All VIP donors linked</p>
          </div>
        )}
      </div>
    </div>
  );
};
