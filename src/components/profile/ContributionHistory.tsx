import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Heart, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Pledge {
  id: string;
  amount: number;
  created_at: string;
  status?: string;
  campaigns?: {
    title: string;
    image_url?: string;
    provider?: string;
    start_date?: string;
    web_url?: string;
  };
}

interface ContributionHistoryProps {
  pledges: Pledge[] | undefined;
  isLoading?: boolean;
}

const ContributionHistory: React.FC<ContributionHistoryProps> = ({
  pledges,
  isLoading = false
}) => {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Contribution History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-muted rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : pledges && pledges.length > 0 ? (
          <div className="space-y-4">
            {pledges.map((pledge) => (
              <div key={pledge.id} className="flex gap-4 p-4 border rounded-lg hover:border-primary/50 transition-colors">
                <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                  {pledge.campaigns?.image_url ? (
                    <img 
                      src={pledge.campaigns.image_url} 
                      alt={pledge.campaigns.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col gap-1">
                      <h3 className="font-bold">{pledge.campaigns?.title || 'Campaign'}</h3>
                      <div className="flex items-center gap-2">
                        {pledge.campaigns?.provider && (
                          <Badge variant="secondary" className="text-xs">
                            {pledge.campaigns.provider}
                          </Badge>
                        )}
                        {pledge.campaigns?.start_date && (
                          <Badge variant="outline" className="text-xs">
                            {new Date(pledge.campaigns.start_date).getFullYear()}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-lg font-bold text-primary">
                      ${Number(pledge.amount).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Contributed on {pledge.created_at ? new Date(pledge.created_at).toLocaleDateString() : "Date unavailable"}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                      {pledge.status || 'Completed'}
                    </span>
                    {pledge.campaigns?.web_url && (
                      <a 
                        href={pledge.campaigns.web_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded flex items-center gap-1 transition-colors"
                      >
                        View Campaign
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No contributions yet</h3>
            <p className="text-muted-foreground">
              Your contribution history will appear here once you make your first donation.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContributionHistory;