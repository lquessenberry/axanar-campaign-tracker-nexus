import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { UserTitle } from '@/hooks/useAmbassadorialTitles';

interface TitleBadgeDisplayProps {
  title: UserTitle;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
  className?: string;
}

export const TitleBadgeDisplay = ({ 
  title, 
  size = 'md', 
  showDescription = false,
  className = '' 
}: TitleBadgeDisplayProps) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  const iconSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const tierGradient = title.tier_level >= 25 ? 'from-fuchsia-500/20 to-pink-500/20' :
                       title.tier_level >= 20 ? 'from-rose-500/20 to-red-500/20' :
                       title.tier_level >= 15 ? 'from-orange-500/20 to-amber-500/20' :
                       title.tier_level >= 10 ? 'from-indigo-500/20 to-purple-500/20' :
                       title.tier_level >= 5 ? 'from-blue-500/20 to-indigo-500/20' :
                       'from-cyan-500/20 to-blue-500/20';

  const content = (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={className}
    >
      <Badge
        variant="outline"
        className={`
          ${sizeClasses[size]}
          ${title.color || 'text-cyan-400'}
          ${title.badge_style || 'border-cyan-400/30'}
          bg-gradient-to-r ${tierGradient}
          backdrop-blur-sm
          shadow-lg shadow-primary/10
          font-semibold
          transition-all duration-300
          hover:shadow-xl hover:shadow-primary/20
        `}
      >
        {title.icon && (
          title.icon.startsWith('/') || title.icon.startsWith('http') ? (
            <img 
              src={title.icon} 
              alt={title.display_name}
              className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} object-contain mr-1.5`}
            />
          ) : (
            <span className={`${iconSize[size]} mr-1.5`}>{title.icon}</span>
          )
        )}
        {title.display_name}
      </Badge>
      {showDescription && title.description && (
        <p className="text-xs text-muted-foreground mt-1">{title.description}</p>
      )}
    </motion.div>
  );

  if (!showDescription) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent className="max-w-xs bg-background/95 backdrop-blur-sm border-primary/20">
            <div className="space-y-2">
              <p className="font-semibold text-foreground">{title.display_name}</p>
              {title.description && (
                <p className="text-sm text-muted-foreground">{title.description}</p>
              )}
              {title.campaign_name && (
                <p className="text-xs text-muted-foreground">
                  Campaign: <span className="text-foreground">{title.campaign_name}</span>
                </p>
              )}
              <div className="pt-2 border-t border-border/50 space-y-1">
                {title.xp_multiplier > 1 && (
                  <p className="text-xs">
                    <span className="text-primary">⚡ {title.xp_multiplier}x</span> XP Multiplier
                  </p>
                )}
                {title.forum_xp_bonus > 0 && (
                  <p className="text-xs">
                    <span className="text-primary">+{title.forum_xp_bonus}</span> Forum XP Bonus
                  </p>
                )}
                {title.participation_xp_bonus > 0 && (
                  <p className="text-xs">
                    <span className="text-primary">+{title.participation_xp_bonus}</span> Participation XP
                  </p>
                )}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};
