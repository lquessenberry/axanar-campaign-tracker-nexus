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
  } | null;
  onCategoryChange: (category: LeaderboardCategory) => void;
}

const getCategoryConfig = (category: LeaderboardCategory) => {
  const configs = {
    unified_xp: {
      title: 'Top ARES Rankings',
      icon: Trophy,
      formatValue: (value: number) => `${Math.round(value).toLocaleString()} ARES`,
      description: 'Total experience points from donations, forum, and activities'
    },
    total_donated: {
      title: 'Top Donors',
      icon: DollarSign,
      formatValue: (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: 'Users ranked by total donation amount'
    },
    total_contributions: {
      title: 'Most Active Contributors',
      icon: TrendingUp,
      formatValue: (value: number) => `${Math.round(value).toLocaleString()} contributions`,
      description: 'Users with the most contributions across campaigns'
    },
    campaigns_supported: {
      title: 'Multi-Campaign Supporters',
      icon: Star,
      formatValue: (value: number) => `${Math.round(value)} campaigns`,
      description: 'Users supporting the most campaigns'
    },
    years_supporting: {
      title: 'Veteran Supporters',
      icon: Medal,
      formatValue: (value: number) => `${value.toFixed(1)} years`,
      description: 'Longest-standing community members'
    },
    activity_score: {
      title: 'Overall Activity Leaders',
      icon: Trophy,
      formatValue: (value: number) => `${Math.round(value).toLocaleString()} points`,
      description: 'Combined activity and engagement score'
    },
    profile_completeness_score: {
      title: 'Complete Profiles',
      icon: Award,
      formatValue: (value: number) => `${Math.round(value)}%`,
      description: 'Users with the most complete profiles'
    },
    recruits_confirmed: {
      title: 'Top Recruiters',
      icon: Users,
      formatValue: (value: number) => `${Math.round(value)} recruits`,
      description: 'Users who brought the most new members'
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
    { key: 'activity_score', label: 'OVERALL' }
  ];

  const handleShare = (entry: LeaderboardEntry) => {
    const shareText = `🌟 Check out ${entry.full_name}'s incredible support for @AxanarProductions over ${entry.years_supporting} years! ${config.formatValue(entry.metric_value)} and counting! #AxanarSupporter #StarTrekAxanar`;
    
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
                <div className="absolute inset-0 backdrop-blur-md bg-background/40 rounded-lg z-10 flex flex-col items-center justify-center gap-3 p-4">
                  <div className="text-center max-w-md">
                    <h4 className="font-semibold text-lg mb-2 flex items-center justify-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      Account Not Linked
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      This contributor has <span className="font-semibold text-foreground">{Math.round(entry.proposed_ares).toLocaleString()} proposed ARES</span> from donations, 
                      but hasn't claimed their verified ARES XP yet. Overall participation points count donations only—verified ARES XP includes 
                      forum activity, achievements, and more.
                    </p>
                  </div>
                  <Link to="/auth?flow=lookup">
                    <Button 
                      variant="default" 
                      className="gap-2 bg-yellow-600 hover:bg-yellow-700 text-white"
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
                <Avatar className="h-10 w-10">
                  <AvatarImage src={entry.avatar_url} />
                  <AvatarFallback>
                    {entry.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium truncate">{entry.full_name}</h4>
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
                    {config.formatValue(entry.metric_value)}
                  </div>
                  {!entry.is_account_linked && category === 'unified_xp' && entry.proposed_ares > 0 && (
                    <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500/50">
                      Proposed
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  ${Number(entry.total_donated || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} donated
                  {!entry.is_account_linked && entry.proposed_ares > 0 && (
                    <div className="text-xs text-yellow-500 mt-0.5">
                      Would earn {Math.round(entry.proposed_ares).toLocaleString()} ARES
                    </div>
                  )}
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