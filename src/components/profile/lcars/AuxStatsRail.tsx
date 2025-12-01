/**
 * LCARS Auxiliary Stats Rail
 * Small stacked rectangles for quick stats (right rail on wide screens)
 */

interface StatBlock {
  label: string;
  value: string | number;
  sublabel?: string;
  color?: "primary" | "secondary" | "accent" | "muted";
}

interface AuxStatsRailProps {
  stats: StatBlock[];
}

export function AuxStatsRail({ stats }: AuxStatsRailProps) {
  const getColorClasses = (color: StatBlock["color"] = "primary") => {
    switch (color) {
      case "secondary":
        return "bg-secondary/10 border-secondary/30";
      case "accent":
        return "bg-accent/10 border-accent/30";
      case "muted":
        return "bg-muted/30 border-muted";
      case "primary":
      default:
        return "bg-primary/10 border-primary/30";
    }
  };

  return (
    <div className="space-y-3">
      <div className="bg-card border border-border p-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
          QUICK STATS
        </h3>
        
        <div className="space-y-2">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`border p-4 ${getColorClasses(stat.color)}`}
            >
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                {stat.label}
              </div>
              <div className="text-2xl font-bold text-foreground font-mono">
                {stat.value}
              </div>
              {stat.sublabel && (
                <div className="text-xs text-muted-foreground/70 mt-1">
                  {stat.sublabel}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
