import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { useForumBadges } from '@/hooks/useForumBadges';

const ForumBadgesPanel: React.FC = () => {
  const { data: badges = [], isLoading, isError } = useForumBadges();

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-5 w-5 text-axanar-teal" />
          <h3 className="text-lg font-bold">Forum Badges</h3>
        </div>

        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading badges…</p>
        )}

        {!isLoading && isError && (
          <p className="text-sm text-muted-foreground">Unable to load badges right now.</p>
        )}

        {!isLoading && !isError && badges.length === 0 && (
          <p className="text-sm text-muted-foreground">No badges yet. Participate in the forum and campaigns to earn badges.</p>
        )}

        {!isLoading && !isError && badges.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {badges.slice(0, 12).map((b) => (
              <div key={`${b.user_id}-${b.badge_id}`} className="flex items-center gap-2 p-2 rounded-md bg-background/50 border border-border/50">
                <div className="h-7 w-7 rounded-full bg-axanar-teal/15 text-axanar-teal flex items-center justify-center">
                  <Award className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{b.badge.label}</div>
                  <div className="text-xs text-muted-foreground truncate">{new Date(b.awarded_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ForumBadgesPanel;
