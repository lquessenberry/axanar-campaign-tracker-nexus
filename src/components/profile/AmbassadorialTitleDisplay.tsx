import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Award, Zap, MessageCircle, Users, Shield, Settings, Star, Eye, EyeOff } from 'lucide-react';
import { useAmbassadorialTitles, useSetPrimaryTitle, useToggleTitleDisplay } from '@/hooks/useAmbassadorialTitles';
import { useTitleBuffs } from '@/hooks/useTitleBuffs';
import { useForumBadges } from '@/hooks/useForumBadges';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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
  const [isManaging, setIsManaging] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  
  const { data: titleData, isLoading: titlesLoading } = useAmbassadorialTitles(userId);
  const { data: buffs, isLoading: buffsLoading } = useTitleBuffs(userId);
  const { data: forumBadges = [], isLoading: badgesLoading } = useForumBadges(userId);
  const { setPrimaryTitle } = useSetPrimaryTitle();
  const { toggleDisplay } = useToggleTitleDisplay();
  const queryClient = useQueryClient();

  const handleSetPrimary = async (titleId: string, titleName: string) => {
    setUpdating(titleId);
    try {
      await setPrimaryTitle(userId, titleId);
      await queryClient.invalidateQueries({ queryKey: ['ambassadorial-titles', userId] });
      await queryClient.invalidateQueries({ queryKey: ['title-buffs', userId] });
      toast.success(`Set "${titleName}" as primary title`);
    } catch (error) {
      console.error('Error setting primary title:', error);
      toast.error('Failed to update primary title');
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleDisplay = async (titleId: string, currentState: boolean, titleName: string) => {
    setUpdating(titleId);
    try {
      await toggleDisplay(userId, titleId, !currentState);
      await queryClient.invalidateQueries({ queryKey: ['ambassadorial-titles', userId] });
      await queryClient.invalidateQueries({ queryKey: ['title-buffs', userId] });
      toast.success(
        !currentState 
          ? `"${titleName}" is now displayed` 
          : `"${titleName}" is now hidden`
      );
    } catch (error) {
      console.error('Error toggling title display:', error);
      toast.error('Failed to update title visibility');
    } finally {
      setUpdating(null);
    }
  };

  if (titlesLoading || buffsLoading || badgesLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-20 bg-muted rounded-lg"></div>
      </div>
    );
  }

  if (!titleData?.primaryTitle && forumBadges.length === 0) {
    return null;
  }

  const { primaryTitle } = titleData || {};
  const ambassadorialTitles = titleData?.titles || [];
  const displayedTitles = ambassadorialTitles.filter(t => t.is_displayed);
  
  // Combine ambassadorial titles and forum badges
  const allTitles = [
    ...ambassadorialTitles,
    ...forumBadges.map(fb => ({
      id: fb.badge_id,
      display_name: fb.badge.label,
      description: fb.badge.description || undefined,
      color: 'text-cyan-400',
      is_displayed: true,
      is_primary: false,
      type: 'forum_badge' as const
    }))
  ];

  if (compact) {
    const compactIcon = primaryTitle?.icon && !primaryTitle.icon.startsWith('/') ? primaryTitle.icon : null;
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={`${primaryTitle.color} border-current bg-current/10 cursor-help ${className}`}
            >
              {compactIcon ? (
                <span className="mr-1 text-xs">{compactIcon}</span>
              ) : (
                <Award className="w-3 h-3 mr-1" />
              )}
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="w-5 h-5" />
            Ambassadorial Titles
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsManaging(!isManaging)}
          >
            <Settings className="w-4 h-4 mr-2" />
            {isManaging ? 'Done' : 'Manage'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Title */}
        {primaryTitle && (
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
        )}

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

        {/* All Titles Section */}
        {!isManaging && allTitles.length > 1 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">
              Additional Titles ({allTitles.filter(t => !t.is_primary).length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {allTitles
                .filter(t => !t.is_primary && t.is_displayed)
                .map(title => {
                  const icon = 'icon' in title ? title.icon : null;
                  const isEmojiIcon = icon && !icon.startsWith('/');
                  return (
                    <Badge 
                      key={title.id}
                      variant="outline"
                      className={`${title.color} border-current bg-current/5`}
                    >
                      {isEmojiIcon && <span className="mr-1 text-xs">{icon}</span>}
                      {title.display_name}
                    </Badge>
                  );
                })}
            </div>
          </div>
        )}

        {/* Management Mode */}
        {isManaging && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">
              All Titles ({allTitles.length})
            </h4>
            {allTitles.map(title => {
              const isForum = 'type' in title && title.type === 'forum_badge';
              return (
                <div
                  key={title.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    title.is_primary
                      ? 'bg-primary/5 border-primary'
                      : 'bg-muted/30 border-muted'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        {'icon' in title && title.icon && !title.icon.startsWith('/') && (
                          <span className="text-lg">{title.icon}</span>
                        )}
                        <h3 className={`font-bold ${title.color}`}>
                          {title.display_name}
                        </h3>
                        {title.is_primary && (
                          <Badge variant="default" className="shrink-0">
                            <Star className="w-3 h-3 mr-1" />
                            Primary
                          </Badge>
                        )}
                        {isForum && (
                          <Badge variant="secondary" className="shrink-0">
                            Forum
                          </Badge>
                        )}
                      </div>
                      
                      {title.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {title.description}
                        </p>
                      )}

                      {'campaign_name' in title && title.campaign_name && (
                        <p className="text-xs text-muted-foreground">
                          Campaign: {title.campaign_name}
                        </p>
                      )}
                    </div>

                    {!isForum && (
                      <div className="flex flex-col gap-2 shrink-0">
                        {!title.is_primary && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetPrimary(title.id, title.display_name)}
                            disabled={updating === title.id}
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Set Primary
                          </Button>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={title.is_displayed}
                            onCheckedChange={() => handleToggleDisplay(title.id, title.is_displayed, title.display_name)}
                            disabled={updating === title.id}
                          />
                          <span className="text-sm text-muted-foreground">
                            {title.is_displayed ? (
                              <>
                                <Eye className="w-4 h-4 inline mr-1" />
                                Visible
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-4 h-4 inline mr-1" />
                                Hidden
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
