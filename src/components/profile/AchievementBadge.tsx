import React from 'react';
import { Trophy, Star, Shield, Heart, Award, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Achievement {
  id: string;
  achievement_type: string;
  achievement_data: any;
  earned_at: string;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
}

const getAchievementConfig = (type: string, data: any) => {
  switch (type) {
    case 'first_supporter':
      return {
        icon: Heart,
        title: 'First Supporter',
        description: 'Made your first donation to Axanar',
        color: 'bg-pink-500',
        xp: 25
      };
    case 'committed_backer':
      return {
        icon: Star,
        title: 'Committed Backer',
        description: `Contributed $${data.amount} total`,
        color: 'bg-blue-500',
        xp: 50
      };
    case 'major_supporter':
      return {
        icon: Trophy,
        title: 'Major Supporter',
        description: `Contributed $${data.amount} total`,
        color: 'bg-yellow-500',
        xp: 100
      };
    case 'champion_donor':
      return {
        icon: Award,
        title: 'Champion Donor',
        description: `Contributed $${data.amount} total`,
        color: 'bg-purple-500',
        xp: 200
      };
    case 'veteran_supporter':
      return {
        icon: Shield,
        title: 'Veteran Supporter',
        description: `Supporting for ${data.years} years`,
        color: 'bg-green-500',
        xp: 150
      };
    case 'multi_campaign_supporter':
      return {
        icon: Users,
        title: 'Multi-Campaign Supporter',
        description: `Backed ${data.campaigns} campaigns`,
        color: 'bg-indigo-500',
        xp: 75
      };
    case 'recruitment_ambassador':
      return {
        icon: Users,
        title: 'Recruitment Ambassador',
        description: `Helped ${data.recruits} donors reconnect`,
        color: 'bg-orange-500',
        xp: data.recruits * 25
      };
    default:
      return {
        icon: Star,
        title: 'Achievement',
        description: 'Special recognition',
        color: 'bg-gray-500',
        xp: 10
      };
  }
};

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ 
  achievement, 
  size = 'md' 
}) => {
  const config = getAchievementConfig(achievement.achievement_type, achievement.achievement_data);
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };
  
  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
      <div className={`${sizeClasses[size]} rounded-full ${config.color} flex items-center justify-center flex-shrink-0`}>
        <Icon size={iconSizes[size]} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm truncate">{config.title}</h4>
          <Badge variant="secondary" className="text-xs">
            +{config.xp} ARES
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {config.description}
        </p>
        <p className="text-xs text-muted-foreground">
          Earned {new Date(achievement.earned_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default AchievementBadge;