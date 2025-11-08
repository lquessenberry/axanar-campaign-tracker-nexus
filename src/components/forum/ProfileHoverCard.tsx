import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRankSystem } from '@/hooks/useRankSystem';
import { ChatButton } from '@/components/chat/ChatButton';

interface ProfileHoverCardProps {
  username: string;
  children: React.ReactNode;
}

export const ProfileHoverCard: React.FC<ProfileHoverCardProps> = ({ username, children }) => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile-preview', username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, bio, avatar_url, created_at, show_avatar_publicly, show_real_name_publicly, show_background_publicly')
        .eq('username', username)
        .single();
      
      if (error) throw error;
      return data;
    },
    staleTime: 60000, // Cache for 1 minute
  });

  const { data: rankSystem } = useRankSystem(profile?.id || '', 0);
  const militaryRank = rankSystem?.militaryRank;

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="top">
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : profile ? (
          <div className="space-y-3">
            {/* Avatar & Name */}
            <div className="flex items-center gap-3">
              <Link to={`/u/${username}`} className="flex-shrink-0">
                {profile.avatar_url && profile.show_avatar_publicly !== false ? (
                  <img
                    src={profile.avatar_url}
                    alt={username}
                    className="w-12 h-12 rounded-full object-cover border-2 border-axanar-teal/50"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-axanar-teal/30 to-blue-500/30 flex items-center justify-center font-bold text-lg border-2 border-axanar-teal/50">
                    {username.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link 
                  to={`/u/${username}`}
                  className="font-bold hover:text-axanar-teal transition-colors truncate block"
                >
                  {profile.show_real_name_publicly !== false && profile.full_name
                    ? profile.full_name
                    : `@${username}`}
                </Link>
                <p className="text-xs text-muted-foreground">@{username}</p>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs">
              {militaryRank && (
                <div className="flex items-center gap-1">
                  <Trophy className={`h-3 w-3 ${rankSystem?.isAdmin ? 'text-yellow-500' : 'text-primary'}`} />
                  <span className={rankSystem?.isAdmin ? 'text-yellow-500' : 'text-primary'}>
                    {militaryRank.name}
                  </span>
                </div>
              )}
              {profile.created_at && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Joined {new Date(profile.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <ChatButton
                userId={profile.id}
                userName={profile.full_name || username}
                username={username}
                variant="outline"
                size="sm"
                className="flex-1"
              />
              <Link 
                to={`/u/${username}`}
                className="flex-1 text-xs text-center py-2 px-3 bg-axanar-teal/10 hover:bg-axanar-teal/20 rounded-md transition-colors font-medium text-axanar-teal"
              >
                View Profile →
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground p-4">
            Profile not found
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
};

export default ProfileHoverCard;
