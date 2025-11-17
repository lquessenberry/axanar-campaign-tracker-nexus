import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Award, Star, Eye, EyeOff } from 'lucide-react';
import { useAmbassadorialTitles, useSetPrimaryTitle, useToggleTitleDisplay } from '@/hooks/useAmbassadorialTitles';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface TitleManagementPanelProps {
  userId: string;
}

export const TitleManagementPanel: React.FC<TitleManagementPanelProps> = ({ userId }) => {
  const { data: titleData, isLoading } = useAmbassadorialTitles(userId);
  const { setPrimaryTitle } = useSetPrimaryTitle();
  const { toggleDisplay } = useToggleTitleDisplay();
  const queryClient = useQueryClient();
  const [updating, setUpdating] = useState<string | null>(null);

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manage Ambassadorial Titles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!titleData?.titles.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ambassadorial Titles</CardTitle>
          <CardDescription>
            You haven't earned any ambassadorial titles yet. Make pledges to campaigns to earn titles!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Manage Ambassadorial Titles
        </CardTitle>
        <CardDescription>
          Customize which titles you display and choose your primary title
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {titleData.titles.map(title => (
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
                    <h3 className={`font-bold ${title.color}`}>
                      {title.display_name}
                    </h3>
                    {title.is_primary && (
                      <Badge variant="default" className="shrink-0">
                        <Star className="w-3 h-3 mr-1" />
                        Primary
                      </Badge>
                    )}
                  </div>
                  
                  {title.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {title.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {title.campaign_name && (
                      <span>Campaign: {title.campaign_name}</span>
                    )}
                    {title.xp_multiplier > 1.0 && (
                      <Badge variant="secondary" className="text-xs">
                        {((title.xp_multiplier - 1) * 100).toFixed(0)}% XP Boost
                      </Badge>
                    )}
                    {title.forum_xp_bonus > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        +{title.forum_xp_bonus} Forum XP
                      </Badge>
                    )}
                    {title.participation_xp_bonus > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        +{title.participation_xp_bonus} Activity XP
                      </Badge>
                    )}
                  </div>
                </div>

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
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
