import { Button } from "@/components/ui/button";
import { Activity, ChevronRight, UserPlus, DollarSign, MapPin, Shield, MessageCircle } from "lucide-react";
import { useAdminActivityFeed, ActivityEvent } from "@/hooks/useAdminActivityFeed";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const EventIcon = ({ type }: { type: ActivityEvent['type'] }) => {
  const icons = {
    signup: <UserPlus className="h-4 w-4" />,
    pledge: <DollarSign className="h-4 w-4" />,
    address_update: <MapPin className="h-4 w-4" />,
    admin_action: <Shield className="h-4 w-4" />,
    message: <MessageCircle className="h-4 w-4" />,
  };
  return icons[type] || <Activity className="h-4 w-4" />;
};

const EventDot = ({ type }: { type: ActivityEvent['type'] }) => {
  const colors = {
    signup: 'bg-green-500',
    pledge: 'bg-primary',
    address_update: 'bg-blue-500',
    admin_action: 'bg-orange-500',
    message: 'bg-purple-500',
  };
  
  return (
    <div className={cn(
      "w-2.5 h-2.5 rounded-full flex-shrink-0",
      colors[type] || 'bg-muted-foreground'
    )} />
  );
};

export const AdminActivityFeed = () => {
  const { data: events, isLoading } = useAdminActivityFeed(15);

  return (
    <div className="lcars-panel lcars-panel-right h-full bg-card">
      {/* LCARS Header with cap */}
      <div className="lcars-endcap-r py-3 px-4 border-b border-border/30">
        <h3 className="flex items-center gap-2 text-base font-bold uppercase tracking-wider text-foreground justify-end">
          Live Activity
          <Activity className="h-5 w-5 text-accent" />
        </h3>
      </div>
      
      {/* Activity feed content */}
      <div className="p-2">
        <div className="space-y-0.5 max-h-[400px] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-3 p-2">
                  <div className="w-2.5 h-2.5 bg-muted rounded-full" />
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
                className="lcars-queue-item flex items-start gap-3"
              >
                <EventDot type={event.type} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground truncate">
                      {event.actor}
                    </span>
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-sm font-semibold uppercase tracking-wide",
                      event.type === 'signup' && 'bg-green-500/15 text-green-400',
                      event.type === 'pledge' && 'bg-primary/15 text-primary',
                      event.type === 'address_update' && 'bg-blue-500/15 text-blue-400',
                      event.type === 'admin_action' && 'bg-orange-500/15 text-orange-400',
                      event.type === 'message' && 'bg-purple-500/15 text-purple-400',
                    )}>
                      {event.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {event.description}
                  </p>
                  <span className="text-[10px] text-muted-foreground/70">
                    {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
