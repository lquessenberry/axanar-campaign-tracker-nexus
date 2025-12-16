import { Card } from "@/components/ui/card";
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
  <div className="flex items-center gap-3 px-4 py-3">
    <div className="text-muted-foreground">{icon}</div>
    <div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      {sublabel && <div className="text-[10px] text-muted-foreground/70">{sublabel}</div>}
    </div>
  </div>
);

export const AdminDailyPulse = () => {
  const { data: alerts } = useAdminOperationalAlerts();
  const { data: analytics } = useAdminAnalytics();
  const navigate = useNavigate();

  return (
    <Card className="bg-muted/30">
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex flex-wrap divide-x divide-border">
          <PulseMetric
            icon={<UserPlus className="h-4 w-4" />}
            label="New Users"
            value={alerts?.recentSignups || 0}
            sublabel="Last 7 days"
          />
          <PulseMetric
            icon={<MessageCircle className="h-4 w-4" />}
            label="Unread"
            value={alerts?.unreadMessages || 0}
            sublabel="Messages"
          />
          <PulseMetric
            icon={<DollarSign className="h-4 w-4" />}
            label="Total Raised"
            value={`$${((analytics?.overview?.totalRaised || 0) / 1000).toFixed(0)}K`}
            sublabel="All time"
          />
          <PulseMetric
            icon={<Package className="h-4 w-4" />}
            label="Pending"
            value={(alerts?.pendingShipments || 0).toLocaleString()}
            sublabel="Shipments"
          />
        </div>
        <Button
          variant="outline"
          className="m-3 gap-2"
          onClick={() => navigate('/admin/dashboard?section=analytics')}
        >
          <BarChart3 className="h-4 w-4" />
          Full Analytics
        </Button>
      </div>
    </Card>
  );
};
