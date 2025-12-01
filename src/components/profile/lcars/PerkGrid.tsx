/**
 * LCARS Perk Gallery
 * 3-column grid on desktop (2 on tablet, 1 on mobile) with sharp corners
 */

interface Perk {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  status?: "active" | "pending" | "delivered";
  metadata?: string;
}

interface PerkGridProps {
  perks: Perk[];
  title?: string;
}

export function PerkGrid({ perks, title = "YOUR PERKS & REWARDS" }: PerkGridProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-500/20 text-green-500";
      case "pending":
        return "bg-yellow-500/20 text-yellow-500";
      case "active":
      default:
        return "bg-primary/20 text-primary";
    }
  };

  return (
    <div className="bg-card border border-border p-6">
      {/* Section Header */}
      <div className="mb-6 pb-4 border-b border-border">
        <h2 className="text-xl font-bold uppercase tracking-wider text-foreground">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {perks.length} total items earned across all campaigns
        </p>
      </div>

      {/* Perk Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {perks.map((perk) => (
          <div
            key={perk.id}
            className="border border-border bg-background overflow-hidden"
          >
            {/* Perk Header Bar */}
            <div className="h-10 px-4 flex items-center justify-between bg-primary/10 border-b border-border">
              <div className="flex items-center gap-2">
                {perk.icon}
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  {perk.title}
                </span>
              </div>
              {perk.status && (
                <span
                  className={`text-xs font-bold uppercase px-2 py-0.5 ${getStatusColor(perk.status)}`}
                >
                  {perk.status}
                </span>
              )}
            </div>

            {/* Perk Content */}
            <div className="p-4">
              {perk.description && (
                <p className="text-sm text-muted-foreground mb-2">
                  {perk.description}
                </p>
              )}
              {perk.metadata && (
                <p className="text-xs font-mono text-muted-foreground/70">
                  {perk.metadata}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
