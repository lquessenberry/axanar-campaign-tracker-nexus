/**
 * LCARS Contribution Timeline
 * Captain's log style entries, newest on top, alternating side elbows
 */

import { formatDistanceToNow } from "date-fns";

interface TimelineEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  amount?: number;
  campaign?: string;
  type: "pledge" | "reward" | "activity" | "milestone";
}

interface TimelineFeedProps {
  entries: TimelineEntry[];
  maxHeight?: number;
}

export function TimelineFeed({ entries, maxHeight = 500 }: TimelineFeedProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "pledge":
        return "💎";
      case "reward":
        return "🎁";
      case "milestone":
        return "⭐";
      default:
        return "📝";
    }
  };

  return (
    <div className="bg-card border border-border p-6">
      {/* Section Header */}
      <div className="mb-6 pb-4 border-b border-border">
        <h2 className="text-xl font-bold uppercase tracking-wider text-foreground">
          CONTRIBUTION TIMELINE
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Your complete history with Axanar
        </p>
      </div>

      {/* Timeline Entries - Scrollable */}
      <div
        className="space-y-2 overflow-y-auto pr-2"
        style={{ maxHeight: `${maxHeight}px` }}
      >
        {entries.map((entry, index) => {
          const isLeft = index % 2 === 0;
          
          return (
            <div
              key={entry.id}
              className={`flex gap-4 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
            >
              {/* Elbow Connector */}
              <div className="flex-shrink-0 w-8 h-full flex flex-col items-center pt-2">
                <div className="h-8 w-8 bg-primary/20 flex items-center justify-center text-lg">
                  {getTypeIcon(entry.type)}
                </div>
                {index < entries.length - 1 && (
                  <div className="flex-1 w-0.5 bg-border mt-2" />
                )}
              </div>

              {/* Entry Card */}
              <div className="flex-1 bg-background border border-border p-4 mb-2">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-foreground uppercase text-sm">
                      {entry.title}
                    </h3>
                    {entry.campaign && (
                      <p className="text-xs text-primary font-mono mt-1">
                        {entry.campaign}
                      </p>
                    )}
                  </div>
                  {entry.amount && (
                    <span className="text-lg font-bold text-primary">
                      ${entry.amount.toLocaleString()}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {entry.description}
                </p>
                
                <p className="text-xs font-mono text-muted-foreground/70">
                  {formatDistanceToNow(new Date(entry.date), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
