import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DaystromCard } from "@/components/ui/daystrom-card";
import { DAYSTROM_SPRINGS } from "@/lib/daystrom-springs";
import { Gift, DollarSign, Calendar, Sparkles } from "lucide-react";

interface DigitalPerksPanelProps {
  pledges: any[];
  isLoading: boolean;
}

export const DigitalPerksPanel: React.FC<DigitalPerksPanelProps> = ({
  pledges,
  isLoading
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Gift className="h-4 w-4 text-primary" />
            Digital Perks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pledges.length === 0) {
    return (
      <Card className="border-dashed border-muted-foreground/30">
        <CardContent className="py-8">
          <div className="text-center">
            <Gift className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <h3 className="font-semibold mb-1">No Digital Perks</h3>
            <p className="text-xs text-muted-foreground">
              Digital rewards will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Gift className="h-4 w-4 text-primary" />
            </div>
            <span>Digital Perks</span>
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {pledges.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
        {pledges.map((pledge, index) => (
          <motion.div
            key={pledge.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...DAYSTROM_SPRINGS.snappy, delay: index * 0.05 }}
            layoutId={`digital-perk-${pledge.id}`}
          >
            <div className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 border border-border/50 hover:border-primary/30 transition-all duration-200 group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    <h4 className="font-medium text-sm truncate">{pledge.reward?.name}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {pledge.campaign.name}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs shrink-0 bg-background">
                  ${Number(pledge.amount).toFixed(0)}
                </Badge>
              </div>
              
              {pledge.reward?.description && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {pledge.reward.description}
                </p>
              )}
              
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(pledge.created_at).toLocaleDateString()}
              </div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};