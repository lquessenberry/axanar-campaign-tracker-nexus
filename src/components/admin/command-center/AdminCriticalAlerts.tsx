import { useAdminOperationalAlerts } from "@/hooks/useAdminOperationalAlerts";
import { MessageCircle, Users, Package, AlertTriangle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AlertCardProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  sublabel?: string;
  severity: 'critical' | 'warning' | 'info';
  onClick: () => void;
}

const AlertCard = ({ icon, label, count, sublabel, severity, onClick }: AlertCardProps) => {
  const severityClasses = {
    critical: 'lcars-alert-card critical lcars-pulse-critical',
    warning: 'lcars-alert-card warning lcars-pulse-warning',
    info: 'lcars-alert-card info',
  };

  const iconColors = {
    critical: 'text-destructive',
    warning: 'text-yellow-400',
    info: 'text-primary',
  };

  const countColors = {
    critical: 'text-destructive',
    warning: 'text-yellow-400',
    info: 'text-primary',
  };

  return (
    <button 
      className={cn(
        severityClasses[severity],
        "w-full text-left cursor-pointer transition-all hover:scale-[1.02]",
        "bg-card"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2.5 rounded-sm bg-background/80",
          iconColors[severity]
        )}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className={cn(
              "text-3xl font-bold tracking-tight",
              countColors[severity]
            )}>
              {count.toLocaleString()}
            </span>
          </div>
          <span className="text-sm font-semibold text-foreground uppercase tracking-wide">
            {label}
          </span>
          {sublabel && (
            <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
          )}
        </div>
      </div>
    </button>
  );
};

export const AdminCriticalAlerts = () => {
  const { data: alerts, isLoading } = useAdminOperationalAlerts();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="lcars-hero-banner">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="lcars-alert-card info animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted rounded-sm" />
                <div className="flex-1">
                  <div className="h-8 w-16 bg-muted rounded mb-1" />
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasOverdue = (alerts?.overdueMessages || 0) > 0;

  return (
    <div className="lcars-hero-banner">
      {/* Section header - text only, elbow is handled by parent CSS */}
      <div className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-widest mb-4 pl-2">
        <AlertTriangle className="h-4 w-4 text-primary" />
        <span>NEEDS ATTENTION</span>
      </div>
      
      {/* Alert cards grid - simplified, no nested frames */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <AlertCard
          icon={<MessageCircle className="h-6 w-6" />}
          label="Unread Messages"
          count={alerts?.unreadMessages || 0}
          sublabel={hasOverdue ? `${alerts?.overdueMessages} overdue (>24h)` : undefined}
          severity={hasOverdue ? 'critical' : (alerts?.unreadMessages || 0) > 0 ? 'warning' : 'info'}
          onClick={() => navigate('/messages')}
        />
        
        <AlertCard
          icon={<Users className="h-6 w-6" />}
          label="VIP Unlinked"
          count={alerts?.unlinkedVIPs.total || 0}
          sublabel={alerts?.unlinkedVIPs.tier10k ? `${alerts.unlinkedVIPs.tier10k} at $10K+` : 'High-value donors'}
          severity={(alerts?.unlinkedVIPs.tier10k || 0) > 0 ? 'critical' : (alerts?.unlinkedVIPs.total || 0) > 0 ? 'warning' : 'info'}
          onClick={() => navigate('/admin/dashboard?section=donor-management')}
        />
        
        <AlertCard
          icon={<Package className="h-6 w-6" />}
          label="Pending Shipments"
          count={alerts?.pendingShipments || 0}
          sublabel="Physical rewards to ship"
          severity={(alerts?.pendingShipments || 0) > 100 ? 'warning' : 'info'}
          onClick={() => navigate('/admin/dashboard?section=pledges-rewards')}
        />

        <AlertCard
          icon={<AlertTriangle className="h-6 w-6" />}
          label="Failed Updates"
          count={alerts?.failedAddressUpdates || 0}
          sublabel="Address errors (7d)"
          severity={(alerts?.failedAddressUpdates || 0) > 0 ? 'warning' : 'info'}
          onClick={() => navigate('/admin/dashboard?section=utilities')}
        />
      </div>
    </div>
  );
};
