import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp, 
  Share2,
  Users,
  DollarSign,
  Star,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LeaderboardEntry, LeaderboardCategory } from '@/hooks/useLeaderboard';
import { MILITARY_RANK_THRESHOLDS } from '@/hooks/useRankSystem';
import { toast } from 'sonner';

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
  category: LeaderboardCategory;
  userPosition?: {
    user_rank: number;
    total_contributors: number;
    metric_value: number;
    percentile: number;
    unified_xp: number;
  } | null;
  onCategoryChange: (category: LeaderboardCategory) => void;
}

const getCategoryConfig = (category: LeaderboardCategory) => {
  const configs = {
    unified_xp: {
      title: 'Top ARES Rankings',
      icon: Trophy,
      formatValue: (value: number, entry?: LeaderboardEntry) => `${Math.round(value).toLocaleString()} ARES`,
      description: 'Total experience points from donations, forum, and activities'
    },
    total_donated: {
      title: 'Top Donors',
      icon: DollarSign,
      formatValue: (value: number, entry?: LeaderboardEntry) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: 'Users ranked by total donation amount'
    },
    total_contributions: {
      title: 'Most Active Contributors',
      icon: TrendingUp,
      formatValue: (value: number, entry?: LeaderboardEntry) => `${Math.round(value).toLocaleString()} contributions`,
      description: 'Users with the most contributions across campaigns'
    },
    campaigns_supported: {
      title: 'Multi-Campaign Supporters',
      icon: Star,
      formatValue: (value: number, entry?: LeaderboardEntry) => `${Math.round(value)} campaigns`,
      description: 'Users supporting the most campaigns'
    },
    years_supporting: {
      title: 'Veteran Supporters',
      icon: Medal,
      formatValue: (value: number, entry?: LeaderboardEntry) => `${value.toFixed(1)} years`,
      description: 'Longest-standing community members'
    },
    activity_score: {
      title: 'Potential ARES XP Leaders',
      icon: Trophy,
      formatValue: (value: number, entry?: LeaderboardEntry) => `${Math.round(value).toLocaleString()} potential ARES`,
      description: 'Hedged potential ARES (1000x multiplier). Gap between this and verified ARES XP creates anticipation metric for account linking'
    },
    profile_completeness_score: {
      title: 'Complete Profiles',
      icon: Award,
      formatValue: (value: number, entry?: LeaderboardEntry) => `${Math.round(value)}%`,
      description: 'Users with the most complete profiles'
    },
    recruits_confirmed: {
      title: 'Top Recruiters',
      icon: Users,
      formatValue: (value: number, entry?: LeaderboardEntry) => `${Math.round(value)} recruits`,
      description: 'Users who brought the most new members'
    },
    forum_activity: {
      title: 'Forum Activity Leaders',
      icon: Users,
      formatValue: (value: number, entry?: LeaderboardEntry) => 
        entry ? `${entry.thread_count || 0} threads, ${entry.comment_count || 0} comments` : `${value} posts`,
      description: 'Most active forum participants'
    },
    online_activity: {
      title: 'Recently Online',
      icon: TrendingUp,
      formatValue: (value: number, entry?: LeaderboardEntry) => {
        if (value === 0 || !value) return 'Online now';
        const hours = Math.floor(value / 3600);
        if (hours < 1) return 'Recently';
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
      },
      description: 'Users most recently active'
    }
  };
  return configs[category];
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
  return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
};

const isRecentlyOnline = (lastSeen: string | null): boolean => {
  if (!lastSeen) return false;
  const lastSeenDate = new Date(lastSeen);
  const hoursSinceLastSeen = (Date.now() - lastSeenDate.getTime()) / (1000 * 60 * 60);
  return hoursSinceLastSeen <= 24; // Within last 24 hours
};

const getMilitaryRank = (xp: number) => {
  for (let i = 0; i < MILITARY_RANK_THRESHOLDS.length; i++) {
    const rank = MILITARY_RANK_THRESHOLDS[i];
    if (xp >= rank.minXP && xp <= rank.maxXP) {
      return rank;
    }
  }
  return MILITARY_RANK_THRESHOLDS[0]; // Return Crewman as default
};

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  data,
  category,
  userPosition,
  onCategoryChange
}) => {
  const config = getCategoryConfig(category);
  const Icon = config.icon;

  const categories: { key: LeaderboardCategory; label: string }[] = [
    { key: 'unified_xp', label: 'ARES XP' },
    { key: 'total_donated', label: 'DONATIONS' },
    { key: 'total_contributions', label: 'ACTIVITY' },
    { key: 'years_supporting', label: 'VETERAN' },
    { key: 'recruits_confirmed', label: 'RECRUITMENT' },
    { key: 'activity_score', label: 'OVERALL' },
    { key: 'forum_activity', label: 'FORUM' },
    { key: 'online_activity', label: 'ONLINE' }
  ];

  const handleShare = (entry: LeaderboardEntry) => {
    const shareText = `🌟 Check out ${entry.full_name}'s incredible support for @AxanarProductions over ${entry.years_supporting} years! ${config.formatValue(entry.metric_value, entry)} and counting! #AxanarSupporter #StarTrekAxanar`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Axanar Supporter Spotlight',
        text: shareText,
        url: window.location.origin
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Share text copied to clipboard!");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-axanar-teal" />
            {config.title}
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            {categories.map(({ key, label }) => (
              <Button
                key={key}
                variant={category === key ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(key)}
                className={category === key ? "bg-axanar-teal" : ""}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{config.description}</p>
      </CardHeader>
      
      <CardContent>
        {/* User Position Banner */}
        {userPosition && userPosition.user_rank <= userPosition.total_contributors && (
          <div className="mb-6 p-4 bg-axanar-teal/10 rounded-lg border border-axanar-teal/20">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Your Position</h4>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Rank #{userPosition.user_rank} of {userPosition.total_contributors}</span>
                  <span>Top {userPosition.percentile}%</span>
                  <span>{config.formatValue(userPosition.metric_value)}</span>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  const shareText = `🎯 I'm ranked #${userPosition.user_rank} out of ${userPosition.total_contributors} Axanar supporters with ${config.formatValue(userPosition.metric_value)}! Proud to be in the top ${userPosition.percentile}% supporting @AxanarProductions! #AxanarSupporter #StarTrekAxanar`;
                  
                  if (navigator.share) {
                    navigator.share({
                      title: 'My Axanar Support Ranking',
                      text: shareText,
                      url: window.location.origin
                    });
                  } else {
                    navigator.clipboard.writeText(shareText);
                    toast.success("Your achievement copied to share!");
                  }
                }}
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share My Rank
              </Button>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="space-y-3">
          {data.map((entry) => (
            <div 
              key={entry.donor_id}
              className="relative flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              {/* Blur overlay for unlinked accounts */}
              {!entry.is_account_linked && (
                <div className="absolute inset-0 backdrop-blur-md bg-background/40 rounded-lg z-10 flex items-center justify-between gap-4 px-6">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <AlertTriangle className="h-8 w-8 text-yellow-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-base mb-1">Account Not Linked</h4>
                      <p className="text-xs text-muted-foreground leading-tight">
                        <span className="font-semibold text-foreground">{Math.round(entry.proposed_ares).toLocaleString()} proposed ARES</span> from donations. 
                        Overall points count donations only—verified ARES XP includes forum activity and achievements.
                      </p>
                    </div>
                  </div>
                  <Link to="/auth?flow=lookup" className="flex-shrink-0">
                    <Button 
                      variant="default" 
                      size="sm"
                      className="gap-2 bg-yellow-600 hover:bg-yellow-700 text-white whitespace-nowrap"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      MIA: Call for Re-Enlistment
                    </Button>
                  </Link>
                </div>
              )}
              {/* Rank */}
              <div className="flex items-center justify-center w-12">
                {getRankIcon(entry.rank)}
              </div>

              {/* Avatar & Name */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={entry.avatar_url} />
                    <AvatarFallback>
                      {entry.full_name ? entry.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                    </AvatarFallback>
                  </Avatar>
                  {entry.is_online && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {entry.profile_id && (entry.is_online || isRecentlyOnline(entry.last_seen)) ? (
                    <Link 
                      to={`/profile/${entry.profile_id}`}
                      className="font-medium truncate hover:text-axanar-teal transition-colors inline-block"
                    >
                      {entry.full_name}
                    </Link>
                  ) : (
                    <h4 className="font-medium truncate">{entry.full_name}</h4>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    {category === 'unified_xp' && (() => {
                      const militaryRank = getMilitaryRank(entry.metric_value);
                      return (
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${militaryRank.pipColor.replace('bg-', 'text-')}`}
                        >
                          {militaryRank.name}
                        </Badge>
                      );
                    })()}
                    <span>{Number(entry.years_supporting).toFixed(1)} years</span>
                    {entry.achievements > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {entry.achievements} achievements
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Metric Value */}
              <div className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="text-lg font-bold text-axanar-teal">
                    {config.formatValue(entry.metric_value, entry)}
                  </div>
                  {!entry.is_account_linked && category === 'unified_xp' && entry.proposed_ares > 0 && (
                    <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500/50">
                      Proposed
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  ${Number(entry.total_donated || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} donated
                  <div className="text-xs mt-0.5">
                    {entry.unified_xp.toLocaleString()} ARES
                  </div>
                </div>
              </div>

              {/* Share Button */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleShare(entry)}
                className="opacity-60 hover:opacity-100"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {data.length === 0 && (
          <div className="text-center py-8">
            <Icon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No data available</h3>
            <p className="text-muted-foreground">
              Be the first to appear in this leaderboard!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaderboardTable;