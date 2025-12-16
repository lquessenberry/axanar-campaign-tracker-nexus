import { Card } from "@/components/ui/card";
import { useAdminOperationalAlerts } from "@/hooks/useAdminOperationalAlerts";
import { MessageCircle, Users, Package, AlertTriangle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AlertCardProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  sublabel?: string;
  severity: 'critical' | 'warning' | 'info';
  onClick: () => void;
}

const AlertCard = ({ icon, label, count, sublabel, severity, onClick }: AlertCardProps) => {
  const severityStyles = {
    critical: 'bg-destructive/10 border-destructive/50 hover:bg-destructive/20',
    warning: 'bg-yellow-500/10 border-yellow-500/50 hover:bg-yellow-500/20',
    info: 'bg-blue-500/10 border-blue-500/50 hover:bg-blue-500/20',
  };

  const iconStyles = {
    critical: 'text-destructive',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  const countStyles = {
    critical: 'text-destructive',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  return (
    <Card 
      className={`p-4 cursor-pointer transition-all border-2 ${severityStyles[severity]}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-background/50 ${iconStyles[severity]}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${countStyles[severity]}`}>
              {count.toLocaleString()}
            </span>
            <span className="text-sm font-medium text-foreground">{label}</span>
          </div>
          {sublabel && (
            <p className="text-xs text-muted-foreground">{sublabel}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export const AdminCriticalAlerts = () => {
  const { data: alerts, isLoading } = useAdminOperationalAlerts();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg" />
              <div className="flex-1">
                <div className="h-6 w-16 bg-muted rounded mb-1" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const hasOverdue = (alerts?.overdueMessages || 0) > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        <AlertTriangle className="h-4 w-4" />
        <span>Needs Attention</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AlertCard
          icon={<MessageCircle className="h-5 w-5" />}
          label="Unread Messages"
          count={alerts?.unreadMessages || 0}
          sublabel={hasOverdue ? `${alerts?.overdueMessages} overdue (>24h)` : undefined}
          severity={hasOverdue ? 'critical' : (alerts?.unreadMessages || 0) > 0 ? 'warning' : 'info'}
          onClick={() => navigate('/messages')}
        />
        
        <AlertCard
          icon={<Users className="h-5 w-5" />}
          label="VIP Unlinked"
          count={alerts?.unlinkedVIPs.total || 0}
          sublabel={alerts?.unlinkedVIPs.tier10k ? `${alerts.unlinkedVIPs.tier10k} at $10K+` : 'High-value donors'}
          severity={(alerts?.unlinkedVIPs.tier10k || 0) > 0 ? 'critical' : (alerts?.unlinkedVIPs.total || 0) > 0 ? 'warning' : 'info'}
          onClick={() => navigate('/admin/dashboard?section=donor-management')}
        />
        
        <AlertCard
          icon={<Package className="h-5 w-5" />}
          label="Pending Shipments"
          count={alerts?.pendingShipments || 0}
          sublabel="Physical rewards to ship"
          severity={(alerts?.pendingShipments || 0) > 100 ? 'warning' : 'info'}
          onClick={() => navigate('/admin/dashboard?section=pledges-rewards')}
        />

        <AlertCard
          icon={<AlertTriangle className="h-5 w-5" />}
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
