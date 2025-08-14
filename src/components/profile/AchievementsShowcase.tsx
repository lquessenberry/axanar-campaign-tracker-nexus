import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, Heart, Users, Star, Gift, Crown, Zap } from 'lucide-react';

interface DonorData {
  donor_tier?: string;
  source_platform?: string;
  source_campaign?: string;
  total_donated?: number;
  total_contributions?: number;
  campaigns_supported?: number;
  years_supporting?: number;
  first_contribution_date?: string;
  source_reward_title?: string;
  source_perk_name?: string;
  email_lists?: string;
  recruits_confirmed?: number;
  profile_completeness_score?: number;
  activity_score?: number;
  source_amount?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  earned: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementsShowcaseProps {
  donorData: DonorData;
  className?: string;
}

const AchievementsShowcase: React.FC<AchievementsShowcaseProps> = ({ donorData, className = '' }) => {
  const generateAchievements = (data: DonorData): Achievement[] => {
    const achievements: Achievement[] = [];

    // 🏆 CONTRIBUTION MILESTONES
    const totalDonated = data.total_donated || 0;
    if (totalDonated >= 25) {
      achievements.push({
        id: 'first-supporter',
        title: 'First Supporter',
        description: `Contributed $${totalDonated.toFixed(2)}`,
        icon: '🎯',
        category: 'Milestones',
        earned: true,
        rarity: 'common'
      });
    }
    if (totalDonated >= 100) {
      achievements.push({
        id: 'committed-backer',
        title: 'Committed Backer',
        description: `$${totalDonated.toFixed(2)} total contribution`,
        icon: '💪',
        category: 'Milestones',
        earned: true,
        rarity: 'rare'
      });
    }
    if (totalDonated >= 500) {
      achievements.push({
        id: 'major-supporter',
        title: 'Major Supporter',
        description: `$${totalDonated.toFixed(2)} invested in the vision`,
        icon: '🚀',
        category: 'Milestones',
        earned: true,
        rarity: 'epic'
      });
    }
    if (totalDonated >= 1000) {
      achievements.push({
        id: 'champion-donor',
        title: 'Champion Donor',
        description: `$${totalDonated.toFixed(2)} - True believer`,
        icon: '👑',
        category: 'Milestones',
        earned: true,
        rarity: 'legendary'
      });
    }

    // 🌟 PLATFORM PIONEERS
    if (data.source_platform) {
      const platformIcons: Record<string, string> = {
        'Kickstarter': '🎬',
        'Indiegogo': '💡',
        'PayPal': '💳',
        'Direct': '⭐'
      };
      
      achievements.push({
        id: `platform-${data.source_platform.toLowerCase()}`,
        title: `${data.source_platform} Pioneer`,
        description: `Supported via ${data.source_platform}`,
        icon: platformIcons[data.source_platform] || '🌟',
        category: 'Platform',
        earned: true,
        rarity: 'common'
      });
    }

    // 📅 VETERAN STATUS
    const yearsSupporting = data.years_supporting || 0;
    if (yearsSupporting >= 1) {
      achievements.push({
        id: 'one-year-veteran',
        title: 'One Year Veteran',
        description: `${yearsSupporting} years of support`,
        icon: '🎖️',
        category: 'Loyalty',
        earned: true,
        rarity: 'common'
      });
    }
    if (yearsSupporting >= 3) {
      achievements.push({
        id: 'veteran-supporter',
        title: 'Veteran Supporter',
        description: `${yearsSupporting} years of dedication`,
        icon: '🏅',
        category: 'Loyalty',
        earned: true,
        rarity: 'rare'
      });
    }
    if (yearsSupporting >= 5) {
      achievements.push({
        id: 'founding-member',
        title: 'Founding Member',
        description: `${yearsSupporting} years - Original supporter`,
        icon: '🏆',
        category: 'Loyalty',
        earned: true,
        rarity: 'legendary'
      });
    }

    // 🎯 CAMPAIGN CHAMPION
    const campaignsSupported = data.campaigns_supported || 0;
    if (campaignsSupported >= 2) {
      achievements.push({
        id: 'multi-campaign',
        title: 'Multi-Campaign Champion',
        description: `Supported ${campaignsSupported} campaigns`,
        icon: '🎭',
        category: 'Engagement',
        earned: true,
        rarity: 'rare'
      });
    }

    // 🎁 COLLECTOR BADGES
    if (data.source_reward_title || data.source_perk_name) {
      achievements.push({
        id: 'perk-collector',
        title: 'Perk Collector',
        description: `Claimed: ${data.source_reward_title || data.source_perk_name}`,
        icon: '🎁',
        category: 'Collection',
        earned: true,
        rarity: 'common'
      });
    }

    // 👥 COMMUNITY MEMBER
    if (data.email_lists && data.email_lists.includes(',')) {
      achievements.push({
        id: 'community-member',
        title: 'Community Member',
        description: 'Active in multiple communities',
        icon: '👥',
        category: 'Community',
        earned: true,
        rarity: 'common'
      });
    }

    // 🔥 EARLY BIRD
    if (data.first_contribution_date) {
      const contributionYear = new Date(data.first_contribution_date).getFullYear();
      if (contributionYear <= 2015) {
        achievements.push({
          id: 'early-bird',
          title: 'Early Bird',
          description: `Joined in ${contributionYear} - Original supporter`,
          icon: '🐦',
          category: 'Legacy',
          earned: true,
          rarity: 'epic'
        });
      }
    }

    return achievements;
  };

  const achievements = generateAchievements(donorData);
  const groupedAchievements = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Milestones': <Trophy className="h-4 w-4" />,
      'Platform': <Star className="h-4 w-4" />,
      'Loyalty': <Calendar className="h-4 w-4" />,
      'Engagement': <Heart className="h-4 w-4" />,
      'Collection': <Gift className="h-4 w-4" />,
      'Community': <Users className="h-4 w-4" />,
      'Legacy': <Crown className="h-4 w-4" />
    };
    return iconMap[category] || <Zap className="h-4 w-4" />;
  };

  const getRarityColor = (rarity: string) => {
    const colorMap: Record<string, string> = {
      'common': 'bg-secondary text-secondary-foreground',
      'rare': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'epic': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'legendary': 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
    };
    return colorMap[rarity] || 'bg-secondary text-secondary-foreground';
  };

  if (achievements.length === 0) {
    return (
      <Card className={`${className} opacity-50`}>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No achievements yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Achievements & Accolades
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              {getCategoryIcon(category)}
              {category}
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryAchievements.map((achievement) => (
                <Badge
                  key={achievement.id}
                  className={`${getRarityColor(achievement.rarity)} hover-scale cursor-default flex items-center gap-2 px-3 py-1.5 text-xs`}
                  title={achievement.description}
                >
                  <span className="text-sm">{achievement.icon}</span>
                  <span className="font-medium">{achievement.title}</span>
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AchievementsShowcase;