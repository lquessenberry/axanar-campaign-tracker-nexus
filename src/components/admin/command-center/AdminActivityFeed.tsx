import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, ChevronRight, UserPlus, DollarSign, MapPin, Shield, MessageCircle } from "lucide-react";
import { useAdminActivityFeed, ActivityEvent } from "@/hooks/useAdminActivityFeed";
import { formatDistanceToNow } from "date-fns";

const EventIcon = ({ type }: { type: ActivityEvent['type'] }) => {
  const icons = {
    signup: <UserPlus className="h-4 w-4 text-green-500" />,
    pledge: <DollarSign className="h-4 w-4 text-primary" />,
    address_update: <MapPin className="h-4 w-4 text-blue-500" />,
    admin_action: <Shield className="h-4 w-4 text-orange-500" />,
    message: <MessageCircle className="h-4 w-4 text-purple-500" />,
  };
  return icons[type] || <Activity className="h-4 w-4" />;
};

const EventBadge = ({ type }: { type: ActivityEvent['type'] }) => {
  const badges = {
    signup: { label: 'New', color: 'bg-green-500/10 text-green-500' },
    pledge: { label: 'Pledge', color: 'bg-primary/10 text-primary' },
    address_update: { label: 'Address', color: 'bg-blue-500/10 text-blue-500' },
    admin_action: { label: 'Admin', color: 'bg-orange-500/10 text-orange-500' },
    message: { label: 'Message', color: 'bg-purple-500/10 text-purple-500' },
  };
  const badge = badges[type] || { label: type, color: 'bg-muted text-muted-foreground' };
  
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badge.color}`}>
      {badge.label}
    </span>
  );
};

export const AdminActivityFeed = () => {
  const { data: events, isLoading } = useAdminActivityFeed(15);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-primary" />
          Live Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full" />
                  <div className="flex-1">
                    <div className="h-3 bg-muted rounded w-32 mb-1" />
                    <div className="h-2 bg-muted rounded w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : events && events.length > 0 ? (
            events.map(event => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/30 transition-colors"
              >
                <div className="mt-0.5 p-1.5 rounded-full bg-muted">
                  <EventIcon type={event.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm truncate">{event.actor}</span>
                    <EventBadge type={event.type} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {event.description}
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
