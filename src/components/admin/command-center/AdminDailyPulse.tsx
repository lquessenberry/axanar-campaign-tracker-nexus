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
  <div className="lcars-readout flex-1 min-w-[120px]">
    <div className="flex items-center justify-center gap-2 mb-1 text-muted-foreground">
      {icon}
    </div>
    <div className="lcars-readout-value text-center">{value}</div>
    <div className="lcars-readout-label text-center">{label}</div>
    {sublabel && (
      <div className="text-[10px] text-muted-foreground/60 text-center">{sublabel}</div>
    )}
  </div>
);

export const AdminDailyPulse = () => {
  const { data: alerts } = useAdminOperationalAlerts();
  const { data: analytics } = useAdminAnalytics();
  const navigate = useNavigate();

  return (
    <div className="lcars-footer bg-muted/20">
      {/* LCARS elbow connector visual */}
      <div className="w-8 h-full bg-secondary rounded-bl-xl flex-shrink-0" />
      <div className="w-6 h-6 bg-secondary rounded-full -ml-3 flex-shrink-0" />
      
      {/* Metrics row */}
      <div className="flex flex-wrap items-stretch flex-1 divide-x divide-border/30">
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
