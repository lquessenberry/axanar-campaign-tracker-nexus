import { Button } from "@/components/ui/button";
import { useAdminOperationalAlerts } from "@/hooks/useAdminOperationalAlerts";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { UserPlus, MessageCircle, DollarSign, Package, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PulseMetricProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
}

const PulseMetric = ({ icon, label, value, sublabel }: PulseMetricProps) => (
  <div className="flex flex-col items-center px-6 py-2">
    <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
      {icon}
    </div>
    <div className="text-2xl font-bold text-foreground tracking-tight">{value}</div>
    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</div>
    {sublabel && (
      <div className="text-[10px] text-muted-foreground/60">{sublabel}</div>
    )}
  </div>
);

export const AdminDailyPulse = () => {
  const { data: alerts } = useAdminOperationalAlerts();
  const { data: analytics } = useAdminAnalytics();
  const navigate = useNavigate();

  return (
    <div className="lcars-footer">
      {/* Metrics row - elbow handled by CSS pseudo-elements */}
      <div className="flex flex-wrap items-center flex-1 gap-6 pl-4">
        <PulseMetric
          icon={<UserPlus className="h-4 w-4" />}
          label="New Users"
          value={alerts?.recentSignups || 0}
          sublabel="7 days"
        />
        <PulseMetric
          icon={<MessageCircle className="h-4 w-4" />}
          label="Unread"
          value={alerts?.unreadMessages || 0}
        />
        <PulseMetric
          icon={<DollarSign className="h-4 w-4" />}
          label="Total Raised"
          value={`$${((analytics?.overview?.totalRaised || 0) / 1000).toFixed(0)}K`}
        />
        <PulseMetric
          icon={<Package className="h-4 w-4" />}
          label="Pending"
          value={(alerts?.pendingShipments || 0).toLocaleString()}
        />
      </div>
      
      {/* Analytics button - LCARS half-pill pointing right */}
      <Button
        className="lcars-btn-pill-r m-3 gap-2"
        onClick={() => navigate('/admin/dashboard?section=analytics')}
      >
        <BarChart3 className="h-4 w-4" />
        Analytics
      </Button>
    </div>
  );
};
