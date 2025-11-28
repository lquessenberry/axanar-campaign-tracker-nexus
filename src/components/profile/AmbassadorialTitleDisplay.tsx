import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Award, Zap, MessageCircle, Users, Shield } from 'lucide-react';
import { useAmbassadorialTitles } from '@/hooks/useAmbassadorialTitles';
import { useTitleBuffs } from '@/hooks/useTitleBuffs';

interface AmbassadorialTitleDisplayProps {
  userId: string;
  className?: string;
  compact?: boolean;
}

export const AmbassadorialTitleDisplay: React.FC<AmbassadorialTitleDisplayProps> = ({
  userId,
  className = '',
  compact = false
}) => {
  const { data: titleData, isLoading: titlesLoading } = useAmbassadorialTitles(userId);
  const { data: buffs, isLoading: buffsLoading } = useTitleBuffs(userId);

  if (titlesLoading || buffsLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-20 bg-muted rounded-lg"></div>
      </div>
    );
  }

  if (!titleData?.primaryTitle) {
    return null;
  }

  const { primaryTitle } = titleData;
  const displayedTitles = titleData.titles.filter(t => t.is_displayed);

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={`${primaryTitle.color} border-current bg-current/10 cursor-help ${className}`}
            >
              <Award className="w-3 h-3 mr-1" />
              {primaryTitle.display_name}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-2">
              <p className="font-semibold">{primaryTitle.display_name}</p>
              {primaryTitle.description && (
                <p className="text-sm text-muted-foreground">{primaryTitle.description}</p>
              )}
              {primaryTitle.campaign_name && (
                <p className="text-xs text-muted-foreground">
                  Campaign: {primaryTitle.campaign_name}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="w-5 h-5" />
          Ambassadorial Titles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Title */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-background/80 to-muted/50 border-2 border-current" style={{ borderColor: primaryTitle.color.replace('text-', '') }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className={`text-xl font-bold ${primaryTitle.color}`}>
                {primaryTitle.display_name}
              </h3>
              {primaryTitle.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {primaryTitle.description}
                </p>
              )}
              {primaryTitle.campaign_name && (
                <p className="text-xs text-muted-foreground mt-2">
                  {primaryTitle.campaign_name}
                </p>
              )}
            </div>
            <Badge variant="secondary" className="shrink-0">
              Primary
            </Badge>
          </div>
        </div>

        {/* Active Buffs */}
        {buffs && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">Active Buffs</h4>
            <div className="grid grid-cols-2 gap-2">
              {buffs.xp_multiplier > 1.0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/50 cursor-help">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">
                          {((buffs.xp_multiplier - 1) * 100).toFixed(0)}% XP
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>All XP gains multiplied by {buffs.xp_multiplier.toFixed(2)}×</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {buffs.forum_xp_bonus > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/50 cursor-help">
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">
                          +{buffs.forum_xp_bonus} Forum
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Bonus forum XP per activity</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {buffs.participation_xp_bonus > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/50 cursor-help">
                        <Users className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">
                          +{buffs.participation_xp_bonus} Activity
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Bonus participation XP</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {buffs.special_permissions.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/50 cursor-help">
                        <Shield className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium">
                          {buffs.special_permissions.length} Perks
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        {buffs.special_permissions.map((perm, idx) => (
                          <p key={idx} className="text-xs">{perm}</p>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        )}

        {/* Additional Titles */}
        {displayedTitles.length > 1 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">
              Additional Titles ({displayedTitles.length - 1})
            </h4>
            <div className="flex flex-wrap gap-2">
              {displayedTitles
                .filter(t => !t.is_primary)
                .slice(0, 3)
                .map(title => (
                  <Badge 
                    key={title.id}
                    variant="outline"
                    className={`${title.color} border-current bg-current/5`}
                  >
                    {title.display_name}
                  </Badge>
                ))}
              {displayedTitles.length > 4 && (
                <Badge variant="secondary">
                  +{displayedTitles.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
